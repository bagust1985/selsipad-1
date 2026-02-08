'use server';

import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { getServerSession } from '@/lib/auth/session';
import { ethers } from 'ethers';
import { revalidatePath } from 'next/cache';

const RPC_URLS: Record<string, string> = {
  '97': process.env.BSC_TESTNET_RPC_URL || 'https://bsc-testnet-rpc.publicnode.com',
  '56': process.env.BSC_MAINNET_RPC_URL || 'https://bsc-dataseed.binance.org',
};

const PRESALE_ROUND_ABI = [
  'function finalizeSuccess(bytes32 merkleRoot, uint256 totalVestingAllocation) external',
  'function finalizeFailed(string reason) external',
  'function status() view returns (uint8)',
  'function totalRaised() view returns (uint256)',
  'function softCap() view returns (uint256)',
];

/**
 * Admin action to finalize a presale.
 *
 * For SUCCESS: pass merkleRoot + totalAllocation (generated off-chain from contributions)
 * For FAILURE: pass reason string
 */
export async function finalizePresale(
  roundId: string,
  outcome: 'SUCCESS' | 'FAILED',
  options?: {
    merkleRoot?: string;
    totalAllocation?: string;
    failureReason?: string;
  }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const supabase = createServiceRoleClient();

    // Get round details
    const { data: round, error: roundError } = await supabase
      .from('launch_rounds')
      .select(
        'id, status, type, chain, contract_address, round_address, vesting_vault_address, total_raised, params, project_id'
      )
      .eq('id', roundId)
      .single();

    if (roundError || !round) {
      return { success: false, error: 'Round not found' };
    }

    if (round.type !== 'PRESALE') {
      return { success: false, error: 'Not a presale round' };
    }

    const contractAddress = round.round_address || round.contract_address;
    if (!contractAddress) {
      return { success: false, error: 'No contract address — deploy first' };
    }

    // Only allow finalize from DEPLOYED or ENDED status
    if (!['DEPLOYED', 'ENDED', 'LIVE'].includes(round.status)) {
      return { success: false, error: `Cannot finalize: current status is ${round.status}` };
    }

    const adminPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
    if (!adminPrivateKey) {
      return { success: false, error: 'DEPLOYER_PRIVATE_KEY not configured' };
    }

    const rpcUrl = RPC_URLS[round.chain];
    if (!rpcUrl) {
      return { success: false, error: `Unsupported chain: ${round.chain}` };
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const adminWallet = new ethers.Wallet(adminPrivateKey, provider);
    const contract = new ethers.Contract(contractAddress, PRESALE_ROUND_ABI, adminWallet);

    // Check on-chain status first
    const onchainStatus = await (contract as any).status().catch(() => null);
    console.log('[finalizePresale] On-chain status:', onchainStatus?.toString());

    if (outcome === 'SUCCESS') {
      // Validate required params
      if (!options?.merkleRoot || !options?.totalAllocation) {
        return {
          success: false,
          error: 'merkleRoot and totalAllocation required for success finalization',
        };
      }

      // Check softcap was met
      const [totalRaised, softCap] = await Promise.all([
        (contract as any).totalRaised(),
        (contract as any).softCap(),
      ]);

      if (totalRaised < softCap) {
        return {
          success: false,
          error: `Softcap not met. Raised: ${ethers.formatEther(totalRaised)}, Required: ${ethers.formatEther(softCap)}`,
        };
      }

      // Call finalizeSuccess on-chain
      const tx = await (contract as any).finalizeSuccess(
        options.merkleRoot,
        BigInt(options.totalAllocation),
        { gasLimit: 2000000 }
      );

      console.log('[finalizePresale] Success tx sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('[finalizePresale] Confirmed, block:', receipt.blockNumber);

      // Update DB
      const { error: updateError } = await supabase
        .from('launch_rounds')
        .update({
          status: 'FINALIZED',
          result: 'SUCCESS',
          merkle_root: options.merkleRoot,
          tge_timestamp: Math.floor(Date.now() / 1000),
          finalized_by: session.userId,
          finalized_at: new Date().toISOString(),
          total_raised: parseFloat(ethers.formatEther(totalRaised)),
          updated_at: new Date().toISOString(),
        })
        .eq('id', roundId);

      if (updateError) {
        return {
          success: false,
          error: `On-chain success but DB update failed: ${updateError.message}`,
        };
      }

      // Update project status
      if (round.project_id) {
        await supabase
          .from('projects')
          .update({ status: 'FINALIZED', updated_at: new Date().toISOString() })
          .eq('id', round.project_id);
      }

      // Process fee splits (like fairlaunch autopilot)
      await processPresaleFeeSplits(supabase, round, totalRaised);

      revalidatePath('/admin');
      return { success: true, outcome: 'SUCCESS', txHash: tx.hash };
    } else {
      // FAILED finalization
      const reason = options?.failureReason || 'Softcap not met';

      const tx = await (contract as any).finalizeFailed(reason, { gasLimit: 500000 });
      console.log('[finalizePresale] Failed tx sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('[finalizePresale] Confirmed, block:', receipt.blockNumber);

      // Update DB
      const { error: updateError } = await supabase
        .from('launch_rounds')
        .update({
          status: 'FINALIZED',
          result: 'FAILED',
          finalized_by: session.userId,
          finalized_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', roundId);

      if (updateError) {
        return {
          success: false,
          error: `On-chain failed but DB update failed: ${updateError.message}`,
        };
      }

      // Update project status
      if (round.project_id) {
        await supabase
          .from('projects')
          .update({ status: 'FAILED', updated_at: new Date().toISOString() })
          .eq('id', round.project_id);
      }

      revalidatePath('/admin');
      return { success: true, outcome: 'FAILED', txHash: tx.hash };
    }
  } catch (error: any) {
    console.error('[finalizePresale] Error:', error);
    return { success: false, error: error.message || 'Failed to finalize presale' };
  }
}

/**
 * Process fee splits after successful presale finalization.
 * Same pattern as fairlaunch: 70% owner, 30% platform (treasury/referral/staking).
 */
async function processPresaleFeeSplits(
  supabase: ReturnType<typeof createServiceRoleClient>,
  round: any,
  totalRaised: bigint
) {
  try {
    const params = round.params as any;
    const feeBps = params.fees_referral?.platform_fee_bps || 500; // default 5%
    const feeAmount = (totalRaised * BigInt(feeBps)) / 10000n;
    const feeEth = parseFloat(ethers.formatEther(feeAmount));

    // Create fee_splits entry
    const { data: feeSplit, error: feeError } = await supabase
      .from('fee_splits')
      .insert({
        round_id: round.id,
        total_fee: feeEth,
        treasury_amount: feeEth * 0.5, // 50% to treasury
        referral_pool: feeEth * 0.4, // 40% to referral pool
        staking_pool: feeEth * 0.1, // 10% to staking pool
        status: 'PROCESSED',
        processed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (feeError) {
      console.error('[processPresaleFeeSplits] Fee split error:', feeError);
      return;
    }

    console.log('[processPresaleFeeSplits] Fee split created:', feeSplit?.id, 'amount:', feeEth);

    // Create referral ledger entries for contributors with referrers
    const { data: contributions } = await supabase
      .from('contributions')
      .select('user_id, amount, referrer_id')
      .eq('round_id', round.id)
      .not('referrer_id', 'is', null);

    if (contributions && contributions.length > 0 && feeSplit) {
      const totalContributions = contributions.reduce((sum, c) => sum + parseFloat(c.amount), 0);

      for (const contrib of contributions) {
        const proportion = parseFloat(contrib.amount) / totalContributions;
        const referralReward = feeEth * 0.4 * proportion; // 40% of fee goes to referral pool

        await supabase.from('referral_ledger').insert({
          user_id: contrib.referrer_id,
          fee_split_id: feeSplit.id,
          source_type: 'PRESALE_CONTRIBUTION',
          amount: referralReward,
          status: 'PENDING',
        });
      }

      console.log('[processPresaleFeeSplits] Created', contributions.length, 'referral entries');
    }
  } catch (error) {
    console.error('[processPresaleFeeSplits] Error:', error);
  }
}

/**
 * Get on-chain presale state for admin dashboard.
 */
export async function getPresaleOnchainState(roundId: string) {
  try {
    const session = await getServerSession();
    if (!session) return { success: false, error: 'Not authenticated' };

    const supabase = createServiceRoleClient();
    const { data: round, error } = await supabase
      .from('launch_rounds')
      .select('chain, contract_address, round_address')
      .eq('id', roundId)
      .single();

    if (error || !round) return { success: false, error: 'Round not found' };

    const contractAddress = round.round_address || round.contract_address;
    if (!contractAddress) return { success: false, error: 'No contract address' };

    const rpcUrl = RPC_URLS[round.chain];
    if (!rpcUrl) return { success: false, error: 'Unsupported chain' };

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, PRESALE_ROUND_ABI, provider);

    const [status, totalRaised, softCap] = await Promise.all([
      (contract as any).status().catch(() => 0n),
      (contract as any).totalRaised().catch(() => 0n),
      (contract as any).softCap().catch(() => 0n),
    ]);

    return {
      success: true,
      state: {
        status: Number(status),
        totalRaised: ethers.formatEther(totalRaised),
        softCap: ethers.formatEther(softCap),
        softCapMet: totalRaised >= softCap,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

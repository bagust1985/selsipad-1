'use server';

import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { getServerSession } from '@/lib/auth/session';
import {
  generateMerkleTree,
  calculateAllocations,
  type MerkleTreeResult,
} from '@/lib/presale/merkle-tree';
import { ethers } from 'ethers';

/**
 * Get claim info for a user in a presale round.
 * Returns the Merkle proof, total allocation, and vesting details needed to claim.
 */
export async function getPresaleClaimInfo(roundId: string) {
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
        'id, status, result, type, vesting_vault_address, merkle_root, tge_timestamp, params, total_raised'
      )
      .eq('id', roundId)
      .single();

    if (roundError || !round) {
      return { success: false, error: 'Round not found' };
    }

    if (round.type !== 'PRESALE') {
      return { success: false, error: 'Not a presale round' };
    }

    // User's contribution
    const { data: userContribs } = await supabase
      .from('contributions')
      .select('amount, claimed_at, claim_tx_hash')
      .eq('round_id', roundId)
      .eq('user_id', session.userId);

    if (!userContribs || userContribs.length === 0) {
      return { success: false, error: 'No contribution found for this round' };
    }

    const totalContributed = userContribs.reduce((sum, c) => sum + parseFloat(c.amount), 0);
    const alreadyClaimed = userContribs.some((c) => c.claimed_at != null);

    // If not finalized yet, return basic info
    if (round.status !== 'FINALIZED' || round.result !== 'SUCCESS') {
      return {
        success: true,
        data: {
          canClaim: false,
          reason: `Presale not finalized yet (status: ${round.status}, result: ${round.result})`,
          totalContributed,
          alreadyClaimed,
        },
      };
    }

    // Get ALL contributions to rebuild the Merkle tree
    const { data: allContribs } = await supabase
      .from('contributions')
      .select('wallet_address, amount')
      .eq('round_id', roundId)
      .eq('status', 'CONFIRMED');

    if (!allContribs || allContribs.length === 0) {
      return { success: false, error: 'No contributions found for this round' };
    }

    // Aggregate contributions per wallet
    const contribByWallet = new Map<string, bigint>();
    for (const c of allContribs) {
      const addr = c.wallet_address.toLowerCase();
      const amount = ethers.parseEther(String(c.amount));
      contribByWallet.set(addr, (contribByWallet.get(addr) || 0n) + amount);
    }

    // Calculate token allocations
    const params = round.params as any;
    const totalTokensForSale = ethers.parseEther(String(params.token_for_sale || 0));
    const totalRaised = ethers.parseEther(String(round.total_raised || 0));

    const contributions = Array.from(contribByWallet.entries()).map(([address, amount]) => ({
      address,
      contributionAmount: amount,
    }));

    const allocations = calculateAllocations(contributions, totalTokensForSale, totalRaised);
    const merkleResult = generateMerkleTree(allocations);

    // Get user's proof
    const userAddress = session.address.toLowerCase();
    const userProof = merkleResult.proofs[userAddress];
    const userLeaf = merkleResult.leaves.find((l) => l.address.toLowerCase() === userAddress);

    if (!userProof || !userLeaf) {
      return {
        success: false,
        error: 'Could not generate Merkle proof for your address',
      };
    }

    return {
      success: true,
      data: {
        canClaim: !alreadyClaimed,
        alreadyClaimed,
        totalContributed,
        tokenAllocation: userLeaf.allocation.toString(),
        tokenAllocationFormatted: ethers.formatEther(userLeaf.allocation),
        merkleProof: userProof,
        merkleRoot: merkleResult.root,
        vestingVaultAddress: round.vesting_vault_address,
        tgeTimestamp: round.tge_timestamp,
      },
    };
  } catch (error: any) {
    console.error('[getPresaleClaimInfo] Error:', error);
    return { success: false, error: error.message || 'Failed to get claim info' };
  }
}

/**
 * Generate Merkle tree data for admin finalization.
 * Returns the root and total allocation needed for finalizeSuccess().
 */
export async function generatePresaleMerkleData(roundId: string) {
  try {
    const session = await getServerSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const supabase = createServiceRoleClient();

    // Get round details
    const { data: round, error: roundError } = await supabase
      .from('launch_rounds')
      .select('id, type, params, total_raised')
      .eq('id', roundId)
      .single();

    if (roundError || !round) {
      return { success: false, error: 'Round not found' };
    }

    // Get all contributions
    const { data: allContribs } = await supabase
      .from('contributions')
      .select('wallet_address, amount')
      .eq('round_id', roundId)
      .eq('status', 'CONFIRMED');

    if (!allContribs || allContribs.length === 0) {
      return { success: false, error: 'No confirmed contributions found' };
    }

    // Aggregate per wallet
    const contribByWallet = new Map<string, bigint>();
    for (const c of allContribs) {
      const addr = c.wallet_address.toLowerCase();
      const amount = ethers.parseEther(String(c.amount));
      contribByWallet.set(addr, (contribByWallet.get(addr) || 0n) + amount);
    }

    // Calculate allocations
    const params = round.params as any;
    const totalTokensForSale = ethers.parseEther(String(params.token_for_sale || 0));
    const totalRaised = ethers.parseEther(String(round.total_raised || 0));

    const contributions = Array.from(contribByWallet.entries()).map(([address, amount]) => ({
      address,
      contributionAmount: amount,
    }));

    const allocations = calculateAllocations(contributions, totalTokensForSale, totalRaised);
    const merkleResult = generateMerkleTree(allocations);

    return {
      success: true,
      data: {
        merkleRoot: merkleResult.root,
        totalAllocation: merkleResult.totalAllocation.toString(),
        totalAllocationFormatted: ethers.formatEther(merkleResult.totalAllocation),
        contributorCount: merkleResult.leaves.length,
        leaves: merkleResult.leaves.map((l) => ({
          address: l.address,
          allocation: l.allocation.toString(),
          allocationFormatted: ethers.formatEther(l.allocation),
        })),
      },
    };
  } catch (error: any) {
    console.error('[generatePresaleMerkleData] Error:', error);
    return { success: false, error: error.message || 'Failed to generate Merkle data' };
  }
}

/**
 * Mark tokens as claimed after successful on-chain vesting claim.
 */
export async function markPresaleTokensClaimed(roundId: string, txHash: string) {
  try {
    const session = await getServerSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const supabase = createServiceRoleClient();

    const { error } = await supabase
      .from('contributions')
      .update({
        claimed_at: new Date().toISOString(),
        claim_tx_hash: txHash,
      })
      .eq('round_id', roundId)
      .eq('user_id', session.userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to mark as claimed' };
  }
}

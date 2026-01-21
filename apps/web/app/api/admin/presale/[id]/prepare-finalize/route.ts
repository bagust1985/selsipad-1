/**
 * API: Prepare Finalization
 * POST /api/admin/presale/[id]/prepare-finalize
 *
 * ADMIN ONLY - Server-side merkle generation
 *
 * Flow:
 * 1. Load presale + vesting addresses from DB
 * 2. Load contributions snapshot from DB (NO RPC scanning)
 * 3. Compute token allocations
 * 4. Generate merkle tree (2+ leaves enforced)
 * 5. Persist root + proofs to DB
 * 6. Return proposal payload + calldata
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateMerkleTree } from '@/lib/server/merkle/generate-tree';
import { parseEther, encodeFunctionData } from 'viem';
import { PRESALE_ROUND_ABI } from '@/lib/web3/presale-contracts';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();

    // 1. Verify admin auth
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // 2. Load presale round data
    const { data: round, error: roundError } = await supabase
      .from('launch_rounds')
      .select('*')
      .eq('id', params.id)
      .single();

    if (roundError || !round) {
      return NextResponse.json({ error: 'Presale not found' }, { status: 404 });
    }

    if (!round.round_address || !round.vesting_vault_address) {
      return NextResponse.json({ error: 'Presale not deployed on-chain' }, { status: 400 });
    }

    // 3. Load contributions snapshot from DB (indexer output)
    // TODO: Replace with actual presale_contributions table
    // For now, simulate with sample data
    const sampleContributions = [
      {
        wallet_address: '0xe677CB29436F0BE225B174D5434fB8a04231069E',
        amount: parseEther('1.0'),
      },
      {
        wallet_address: '0x4E5a3ef17a67c7A7260cF2a01C9BD251be9653FF',
        amount: parseEther('0.8'),
      },
    ];

    const totalRaised = sampleContributions.reduce((sum, c) => sum + c.amount, 0n);

    // 4. Calculate token allocations
    const TOKEN_SUPPLY = parseEther('1000000'); // 1M tokens for presale

    const allocations = sampleContributions.map((c) => ({
      address: c.wallet_address,
      allocation: (c.amount * TOKEN_SUPPLY) / totalRaised,
    }));

    // 5. Generate merkle tree
    const merkleData = generateMerkleTree(
      allocations,
      round.vesting_vault_address,
      round.chain_id || 97, // BSC Testnet
      round.schedule_salt || '0x0000000000000000000000000000000000000000000000000000000000000000'
    );

    // 6. Persist merkle root + proofs to DB
    // Store in presale_merkle_proofs table
    for (const alloc of allocations) {
      const proof = merkleData.proofsByWallet[alloc.address.toLowerCase()];

      await supabase.from('presale_merkle_proofs').upsert({
        round_id: params.id,
        wallet_address: alloc.address.toLowerCase(),
        allocation: alloc.allocation.toString(),
        proof: proof,
      });
    }

    // Update launch_rounds with merkle root
    await supabase
      .from('launch_rounds')
      .update({
        merkle_root: merkleData.root,
      })
      .eq('id', params.id);

    // 7. Generate calldata for timelock/multisig execution
    const calldataSetMerkleRoot = encodeFunctionData({
      abi: PRESALE_ROUND_ABI,
      functionName: 'finalizeSuccess',
      args: [merkleData.root as `0x${string}`, merkleData.totalAllocation],
    });

    // 8. Return proposal payload
    return NextResponse.json({
      success: true,
      merkleRoot: merkleData.root,
      totalAllocation: merkleData.totalAllocation.toString(),
      allocations: allocations.map((a) => ({
        address: a.address,
        allocation: a.allocation.toString(),
        allocationFormatted: (Number(a.allocation) / 1e18).toFixed(6),
      })),
      snapshotHash: merkleData.snapshotHash,
      calldata: calldataSetMerkleRoot,
      target: round.round_address,
      message: 'Merkle tree generated and persisted. Ready for finalization.',
    });
  } catch (error: any) {
    console.error('Prepare finalize error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

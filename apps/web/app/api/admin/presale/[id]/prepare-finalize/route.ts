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
 * 6. Return proposal payload
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { generateMerkleTree } from '@/lib/server/merkle/generate-tree';
import { parseEther } from 'viem';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 1. Verify admin auth via wallet session (service-role bypasses RLS)
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: session } = await supabaseAdmin
      .from('auth_sessions')
      .select('wallets!inner(user_id)')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    const userId = (session?.wallets as any)?.user_id;
    if (!userId) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('user_id', userId)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const supabase = supabaseAdmin;

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

    // 3. Load contributions from DB
    const { data: contributions, error: contribError } = await supabase
      .from('contributions')
      .select('wallet_address, amount')
      .eq('round_id', params.id)
      .gt('amount', 0);

    if (contribError || !contributions || contributions.length === 0) {
      return NextResponse.json(
        { error: 'No contributions found for this presale' },
        { status: 400 }
      );
    }

    const totalRaised = contributions.reduce((sum, c) => sum + parseEther(String(c.amount)), 0n);

    // 4. Calculate token allocations based on contribution proportions
    const roundParams = round.params as any;
    const tokensForSale = parseEther(String(roundParams?.token_for_sale || '0'));

    if (tokensForSale === 0n) {
      return NextResponse.json(
        { error: 'token_for_sale is 0 — cannot calculate allocations' },
        { status: 400 }
      );
    }

    const allocations = contributions.map((c) => ({
      address: c.wallet_address,
      allocation: (parseEther(String(c.amount)) * tokensForSale) / totalRaised,
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

    // 7. Return proposal payload
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
      target: round.round_address,
      message: 'Merkle tree generated and persisted. Ready for finalization.',
    });
  } catch (error: any) {
    console.error('Prepare finalize error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

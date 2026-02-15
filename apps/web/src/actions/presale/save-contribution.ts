'use server';

import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { getServerSession } from '@/lib/auth/session';
import { recordContribution } from '@/actions/referral/record-contribution';
import { revalidatePath } from 'next/cache';

/**
 * Record a presale contribution in the database after on-chain tx confirms.
 * Called by the frontend after the contribute() transaction succeeds.
 */
export async function savePresaleContribution({
  roundId,
  txHash,
  amount,
  referrerCode,
}: {
  roundId: string;
  txHash: string;
  amount: string; // ETH/BNB amount as string
  referrerCode?: string;
}) {
  try {
    console.log('[savePresaleContribution] CALLED with:', {
      roundId,
      txHash,
      amount,
      referrerCode,
    });
    const session = await getServerSession();
    if (!session) {
      console.warn('[savePresaleContribution] No session — user not authenticated');
      return { success: false, error: 'Not authenticated' };
    }
    console.log('[savePresaleContribution] Session found:', {
      userId: session.userId,
      address: session.address,
    });

    const supabase = createServiceRoleClient();

    // Verify round exists and is active
    const { data: round, error: roundError } = await supabase
      .from('launch_rounds')
      .select('id, status, type, chain')
      .eq('id', roundId)
      .single();

    if (roundError || !round) {
      console.warn('[savePresaleContribution] Round not found:', roundId, roundError?.message);
      return { success: false, error: 'Round not found' };
    }

    console.log('[savePresaleContribution] Round found:', {
      id: round.id,
      status: round.status,
      type: round.type,
      chain: round.chain,
    });

    if (round.type !== 'PRESALE') {
      console.warn('[savePresaleContribution] Not a presale round:', round.type);
      return { success: false, error: 'Not a presale round' };
    }

    if (!['DEPLOYED', 'LIVE'].includes(round.status)) {
      console.warn('[savePresaleContribution] Presale not active:', round.status);
      return { success: false, error: `Presale not active: ${round.status}` };
    }

    // Check if contribution already recorded (idempotency by tx hash)
    const { data: existing } = await supabase
      .from('contributions')
      .select('id')
      .eq('tx_hash', txHash)
      .single();

    if (existing) {
      return { success: true, data: existing, alreadyRecorded: true };
    }

    // Resolve referrer
    let referrerId: string | null = null;
    if (referrerCode) {
      const { data: referrer } = await supabase
        .from('referral_codes')
        .select('user_id')
        .eq('code', referrerCode)
        .single();

      if (referrer && referrer.user_id !== session.userId) {
        referrerId = referrer.user_id;
      }
    }

    // Insert contribution
    // NOTE: referrer tracking is handled separately via fee_splits, NOT via contributions table
    const { data, error } = await supabase
      .from('contributions')
      .insert({
        round_id: roundId,
        user_id: session.userId,
        wallet_address: session.address,
        amount: parseFloat(amount),
        chain: round.chain || '97',
        tx_hash: txHash,
        status: 'CONFIRMED',
        confirmed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[savePresaleContribution] Insert error:', error);
      return { success: false, error: error.message };
    }

    // Update round totals (best effort)
    try {
      const { error: rpcError } = await supabase.rpc('increment_round_totals', {
        p_round_id: roundId,
        p_amount: parseFloat(amount),
      });
      if (rpcError) {
        console.warn('[savePresaleContribution] RPC fallback for totals:', rpcError.message);
      }
    } catch (rpcErr: any) {
      console.warn('[savePresaleContribution] RPC not available:', rpcErr.message);
    }

    // ✅ Referral tracking (best-effort, non-fatal)
    try {
      await recordContribution({
        userId: session.userId,
        sourceType: 'PRESALE',
        sourceId: roundId,
        amount: (parseFloat(amount) * 1e18).toString(), // Convert to wei string
        asset: 'NATIVE',
        chain: round.chain || '97',
        txHash,
      });
    } catch (refErr: any) {
      console.warn('[savePresaleContribution] Referral tracking (non-fatal):', refErr?.message);
    }

    revalidatePath(`/project/${roundId}`);
    revalidatePath(`/presales/${roundId}`);
    return { success: true, data };
  } catch (error: any) {
    console.error('[savePresaleContribution] Error:', error);
    return { success: false, error: error.message || 'Failed to save contribution' };
  }
}

'use server';

import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { getServerSession } from '@/lib/auth/session';
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
    const session = await getServerSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const supabase = createServiceRoleClient();

    // Verify round exists and is active
    const { data: round, error: roundError } = await supabase
      .from('launch_rounds')
      .select('id, status, type')
      .eq('id', roundId)
      .single();

    if (roundError || !round) {
      return { success: false, error: 'Round not found' };
    }

    if (round.type !== 'PRESALE') {
      return { success: false, error: 'Not a presale round' };
    }

    if (!['DEPLOYED', 'LIVE'].includes(round.status)) {
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
    const { data, error } = await supabase
      .from('contributions')
      .insert({
        round_id: roundId,
        user_id: session.userId,
        wallet_address: session.address,
        amount: parseFloat(amount),
        tx_hash: txHash,
        referrer_id: referrerId,
        status: 'CONFIRMED',
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

    revalidatePath(`/presales/${roundId}`);
    return { success: true, data };
  } catch (error: any) {
    console.error('[savePresaleContribution] Error:', error);
    return { success: false, error: error.message || 'Failed to save contribution' };
  }
}

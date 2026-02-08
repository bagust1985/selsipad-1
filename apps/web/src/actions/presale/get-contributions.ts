'use server';

import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { getServerSession } from '@/lib/auth/session';

/**
 * Get user's contributions for a presale round.
 */
export async function getPresaleContributions(roundId: string) {
  try {
    const session = await getServerSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const supabase = createServiceRoleClient();

    // Get user's contributions
    const { data: contributions, error } = await supabase
      .from('contributions')
      .select('id, amount, tx_hash, status, claimed_at, claim_tx_hash, created_at')
      .eq('round_id', roundId)
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    // Calculate totals
    const totalContributed = (contributions || []).reduce(
      (sum, c) => sum + parseFloat(c.amount),
      0
    );
    const hasClaimed = (contributions || []).some((c) => c.claimed_at != null);

    return {
      success: true,
      data: {
        contributions: contributions || [],
        totalContributed,
        hasClaimed,
        count: (contributions || []).length,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to get contributions' };
  }
}

/**
 * Get all contributions for a presale round (admin/stats view).
 */
export async function getAllPresaleContributions(roundId: string) {
  try {
    const session = await getServerSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const supabase = createServiceRoleClient();

    const { data: contributions, error } = await supabase
      .from('contributions')
      .select('id, user_id, wallet_address, amount, tx_hash, status, referrer_id, created_at')
      .eq('round_id', roundId)
      .order('created_at', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    const totalRaised = (contributions || []).reduce((sum, c) => sum + parseFloat(c.amount), 0);
    const uniqueContributors = new Set((contributions || []).map((c) => c.user_id)).size;

    return {
      success: true,
      data: {
        contributions: contributions || [],
        totalRaised,
        uniqueContributors,
        totalContributions: (contributions || []).length,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to get all contributions' };
  }
}

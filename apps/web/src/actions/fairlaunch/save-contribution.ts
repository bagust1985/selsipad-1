'use server';

import { createClient } from '@/lib/supabase/server';
import { getServerSession } from '@/lib/auth/session';
import { recordContribution } from '@/actions/referral/record-contribution';

/**
 * Save fairlaunch contribution to database and trigger referral tracking
 */
export async function saveFairlaunchContribution(params: {
  roundId: string;
  amount: string; // in wei
  txHash: string;
  chain: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current session
    const session = await getServerSession();
    
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const supabase = createClient();
    
    // Get round details
    const { data: round, error: roundError } = await supabase
      .from('launch_rounds')
      .select('id, chain, raise_asset, token_address')
      .eq('id', params.roundId)
      .single();
    
    if (roundError || !round) {
      return { success: false, error: 'Round not found' };
    }
    
    // Save contribution to database
    const { error: insertError } = await supabase
      .from('contributions')
      .insert({
        round_id: params.roundId,
        user_id: session.userId,
        amount: params.amount,
        payment_token: round.raise_asset || 'NATIVE',
        tx_hash: params.txHash,
        chain: params.chain,
      });
    
    if (insertError) {
      // If duplicate tx_hash, ignore (already recorded)
      if (!insertError.message.includes('duplicate') && !insertError.message.includes('unique')) {
        console.error('Insert contribution error:', insertError);
        return { success: false, error: insertError.message };
      }
    }
    
    // ✅ Record for referral tracking
    await recordContribution({
      userId: session.userId,
      sourceType: 'FAIRLAUNCH',
      sourceId: params.roundId,
      amount: params.amount,
      asset: round.raise_asset || 'NATIVE',
      chain: params.chain,
      txHash: params.txHash,
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('saveFairlaunchContribution error:', error);
    return {
      success: false,
      error: error.message || 'Failed to save contribution',
    };
  }
}

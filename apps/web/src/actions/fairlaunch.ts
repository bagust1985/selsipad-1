'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Save fairlaunch contract address to database after deployment
 */
export async function saveFairlaunchContract(data: {
  roundId: string;
  fairlaunchAddress: string;
  txHash: string;
  chainId: number;
}) {
  const supabase = createClient();

  console.log('💾 Saving fairlaunch contract:', data);

  const { error } = await supabase
    .from('launch_rounds')
    .update({
      round_address: data.fairlaunchAddress.toLowerCase(),
      chain_id: data.chainId,
      status: 'UPCOMING',
    })
    .eq('id', data.roundId);

  if (error) {
    console.error('Failed to save fairlaunch address:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Update fairlaunch creation to include project_id return
 */
export async function createFairlaunchDraftWithReturn(wizardData: any, walletAddress: string) {
  const supabase = createClient();

  // Get user by wallet
  const { data: wallet } = await supabase
    .from('wallets')
    .select('user_id')
    .eq('address', walletAddress.toLowerCase())
    .single();

  if (!wallet) {
    return { success: false, error: 'Wallet not found' };
  }

  try {
    // Create project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: wizardData.basics?.name || 'Unnamed Project',
        description: wizardData.basics?.description,
        creator_id: wallet.user_id,
        chain: wizardData.basics?.network || 'ethereum',
        token_address: wizardData.params?.token_address,
        token_name: wizardData.basics?.name,
        token_symbol: wizardData.basics?.symbol,
        status: 'DRAFT',
        kyc_status: 'NOT_SUBMITTED',
        logo_url: wizardData.basics?.logo_url,
      })
      .select('id')
      .single();

    if (projectError || !project) {
      return { success: false, error: projectError?.message || 'Project creation failed' };
    }

    // Create launch round
    const { data: round, error: roundError } = await supabase
      .from('launch_rounds')
      .insert({
        project_id: project.id,
        round_type: 'FAIRLAUNCH',
        token_address: wizardData.params?.token_address,
        soft_cap: wizardData.params?.softcap,
        min_contribution: wizardData.params?.min_contribution,
        max_contribution: wizardData.params?.max_contribution,
        start_time: wizardData.params?.start_at,
        end_time: wizardData.params?.end_at,
        listing_premium_bps: 500,
        status: 'DRAFT',
        lp_lock_duration_months: wizardData.liquidity?.lp_lock_months,
        lp_liquidity_percent: wizardData.liquidity?.liquidity_percent,
      })
      .select('id')
      .single();

    if (roundError || !round) {
      return { success: false, error: roundError?.message || 'Round creation failed' };
    }

    return {
      success: true,
      projectId: project.id,
      roundId: round.id,
    };
  } catch (error: any) {
    console.error('Error creating fairlaunch draft:', error);
    return { success: false, error: error.message };
  }
}

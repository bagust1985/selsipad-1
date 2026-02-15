/**
 * Manual fix for Blue Check status
 * Run this from the admin panel or via API
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const { wallet_address } = await request.json();

    if (!wallet_address) {
      return NextResponse.json({ error: 'wallet_address required' }, { status: 400 });
    }

    console.log('🔍 Checking wallet:', wallet_address);

    // Get wallet
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('profile_id, address, network')
      .eq('address', wallet_address.toLowerCase())
      .eq('network', 'EVM')
      .single();

    if (walletError || !wallet) {
      return NextResponse.json(
        { error: 'Wallet not found', details: walletError },
        { status: 404 }
      );
    }

    console.log('✅ Wallet found:', wallet);

    // Get current profile status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, username, bluecheck_status, bluecheck_purchased_at')
      .eq('user_id', wallet.profile_id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Profile not found', details: profileError },
        { status: 404 }
      );
    }

    console.log('📋 Current status:', profile);

    if (profile.bluecheck_status === 'ACTIVE') {
      return NextResponse.json({
        success: true,
        message: 'Blue Check already ACTIVE',
        profile,
      });
    }

    // Update to ACTIVE
    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({
        bluecheck_status: 'ACTIVE',
        bluecheck_purchased_at: new Date().toISOString(),
        bluecheck_grant_type: 'PURCHASE',
      })
      .eq('user_id', wallet.profile_id)
      .select();

    if (updateError) {
      return NextResponse.json({ error: 'Update failed', details: updateError }, { status: 500 });
    }

    // Create audit log
    await supabase.from('bluecheck_audit_log').insert({
      action_type: 'MANUAL_GRANT',
      target_user_id: wallet.profile_id,
      reason: 'Manual fix after successful on-chain purchase',
      metadata: {
        wallet_address: wallet_address,
        previous_status: profile.bluecheck_status,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Blue Check activated!',
      before: profile,
      after: updated,
    });
  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

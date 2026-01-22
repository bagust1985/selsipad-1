// Quick script to check and fix Blue Check status
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndFixBlueCheck() {
  const walletAddress = '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e';

  console.log('🔍 Checking wallet:', walletAddress);

  // Get wallet info
  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('profile_id, address, network')
    .eq('address', walletAddress.toLowerCase())
    .eq('network', 'EVM')
    .single();

  if (walletError || !wallet) {
    console.error('❌ Wallet not found:', walletError);
    return;
  }

  console.log('✅ Wallet found:', wallet);

  // Get profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_id, username, bluecheck_status, bluecheck_purchased_at, bluecheck_tx_hash')
    .eq('user_id', wallet.profile_id)
    .single();

  if (profileError) {
    console.error('❌ Profile error:', profileError);
    return;
  }

  console.log('📋 Current profile status:', profile);

  // Check if already active
  if (profile.bluecheck_status === 'ACTIVE') {
    console.log('✅ Blue Check already ACTIVE!');
    return;
  }

  // Update to ACTIVE
  console.log('🔧 Updating Blue Check to ACTIVE...');

  const { data: updated, error: updateError } = await supabase
    .from('profiles')
    .update({
      bluecheck_status: 'ACTIVE',
      bluecheck_purchased_at: new Date().toISOString(),
      bluecheck_grant_type: 'PURCHASE',
      bluecheck_tx_hash: 'MANUAL_FIX', // You can update this with actual tx hash
    })
    .eq('user_id', wallet.profile_id)
    .select();

  if (updateError) {
    console.error('❌ Update error:', updateError);
    return;
  }

  console.log('✅ Blue Check ACTIVATED!', updated);

  // Create audit log
  const { error: auditError } = await supabase.from('bluecheck_audit_log').insert({
    action_type: 'MANUAL_GRANT',
    target_user_id: wallet.profile_id,
    reason: 'Manual fix after successful on-chain purchase',
    metadata: {
      wallet_address: walletAddress,
      fixed_by: 'admin',
    },
  });

  if (auditError) {
    console.error('⚠️ Audit log error:', auditError);
  } else {
    console.log('✅ Audit log created');
  }
}

checkAndFixBlueCheck()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

#!/usr/bin/env node

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from apps/web/.env.local
config({ path: resolve(process.cwd(), 'apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.log('Please check your .env.local file has:');
  console.log('  - NEXT_PUBLIC_SUPABASE_URL');
  console.log('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAdminStatus() {
  console.log('🔍 Checking admin configuration...\n');

  // Check all users with admin status
  const { data: admins, error: adminError } = await supabase
    .from('profiles')
    .select('user_id, is_admin, created_at')
    .eq('is_admin', true);

  if (adminError) {
    console.error('❌ Error fetching admin profiles:', adminError);
    return;
  }

  if (!admins || admins.length === 0) {
    console.log('⚠️  No admin users found in the database');
    console.log('\nTo set up an admin:');
    console.log('1. Connect your wallet to the app');
    console.log('2. Run: node scripts/set-admin.mjs <your-wallet-address>');
    return;
  }

  console.log(`✅ Found ${admins.length} admin user(s):\n`);

  for (const admin of admins) {
    // Get wallets for this admin
    const { data: wallets, error: walletError } = await supabase
      .from('wallets')
      .select('address, chain_type, is_primary')
      .eq('user_id', admin.user_id);

    if (walletError) {
      console.error(`❌ Error fetching wallets for user ${admin.user_id}:`, walletError);
      continue;
    }

    console.log(`Admin User ID: ${admin.user_id}`);
    console.log(`Created: ${admin.created_at}`);

    if (!wallets || wallets.length === 0) {
      console.log('⚠️  No wallets connected to this admin account');
    } else {
      console.log('Connected Wallets:');
      wallets.forEach((wallet) => {
        const primary = wallet.is_primary ? ' (PRIMARY)' : '';
        console.log(`  - [${wallet.chain_type}] ${wallet.address}${primary}`);
      });
    }
    console.log('');
  }
}

checkAdminStatus().catch(console.error);

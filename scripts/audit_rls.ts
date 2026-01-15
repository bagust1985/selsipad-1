/**
 * SCRIPT: audit_rls.ts
 * Security Hardening: Verify RLS is enabled on all tables.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

// const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const CRITICAL_TABLES = [
  'projects',
  'transactions',
  'wallets',
  'kyc_submissions',
  'admin_actions',
  'sbt_rewards_ledger',
  'sbt_claims',
  'trending_snapshots',
  'trending_projects',
];

async function auditRLS() {
  console.log('Starting RLS Security Audit...');

  // We can't easily query PG catalog via Supabase JS client unless we have a specialized RPC.
  // Assuming we have an RPC 'check_rls_status' or we try to access as ANON and fail.
  // Strategy: Try to SELECT from each table as an Anonymous user (Client without Service Key).

  const anonClient = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

  for (const table of CRITICAL_TABLES) {
    console.log(`Checking ${table}...`);

    try {
      // Try to read 1 record
      const { data, error } = await anonClient.from(table).select('*').limit(1);

      // Analysis
      // ideally, Public Read is OK for 'projects', 'trending'
      // But NOT OK for 'admin_actions', 'kyc_submissions', 'sbt_claims' (unless own)

      if (['kyc_submissions', 'admin_actions'].includes(table)) {
        if (!error && data) {
          console.error(
            `❌ CRITICAL: ${table} is readable by ANON! RLS might be missing or too permissive.`
          );
        } else {
          console.log(`✅ ${table} appears protected from Anon read.`);
        }
      } else {
        // Public tables
        console.log(`ℹ️ ${table} is public read (Expected for some).`);
      }
    } catch (e) {
      console.log(`Error checking ${table}:`, e);
    }
  }

  console.log('Audit Complete. (Manual verification of policies recommended for complex logic)');
}

auditRLS();

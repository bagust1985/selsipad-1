/**
 * SCRIPT: reconcile_sbt_rewards.ts
 * Verifies that Total Distributed Rewards == Total Accrued in Ledgers
 * Warning: This script assumes "NFT_STAKING" fee splits are the SOLE source.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function reconcile() {
  console.log('Starting Reconciliation...');

  // 1. Sum Source: processed fees for NFT_STAKING
  const { data: fees } = await supabase
    .from('fee_splits')
    .select('referral_pool_amount') // Assuming this is the bucket used
    .eq('source_type', 'NFT_STAKING')
    .eq('processed', true);

  const totalSource = (fees || []).reduce(
    (sum: bigint, f: any) => sum + BigInt(f.referral_pool_amount || 0),
    0n
  );
  console.log(`Total Source (Fee Splits): ${totalSource}`);

  // 2. Sum Destination: All user ledgers (Accrued)
  const { data: ledgers } = await supabase.from('sbt_rewards_ledger').select('total_accrued');

  const totalDestination = (ledgers || []).reduce(
    (sum: bigint, l: any) => sum + BigInt(l.total_accrued || 0),
    0n
  );
  console.log(`Total Destination (User Ledgers): ${totalDestination}`);

  // 3. Compare
  const diff = totalSource - totalDestination;

  if (diff === 0n) {
    console.log('✅ RECONCILIATION SUCCESS: Source matches Destination.');
  } else {
    console.error(`❌ RECONCILIATION FAILED: Diff is ${diff}.`);
    // Positive diff: We haven't distributed everything yet? (Worker lag?)
    // Negative diff: We distributed more than we have? (Bug!)

    // Note: Rounding errors might occur if "Equal Split" division has remainders.
    // Remainders usually stay in the "System".
    // totalDestination should be <= totalSource.
    if (diff > 0n) {
      console.log('Info: Positive difference likely due to remainders or dust.');
    }
  }
}

reconcile();

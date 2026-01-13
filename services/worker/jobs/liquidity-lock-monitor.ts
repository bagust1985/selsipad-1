/**
 * Liquidity Lock Monitor Worker
 * Monitors lock contract events and updates lock status
 *
 * Trigger: Locks in PENDING status with tx_hash
 * Run: Every 1 minute via cron
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PendingLock {
  id: string;
  round_id: string;
  chain: string;
  dex_type: string;
  lock_tx_hash: string;
  locker_contract_address?: string;
  lock_id?: string;
}

/**
 * Verify lock on-chain via indexer
 * TODO: Integrate with indexer for actual verification
 */
async function verifyLockOnChain(lock: PendingLock): Promise<{
  verified: boolean;
  locked_at?: string;
  error?: string;
}> {
  console.log(`  Verifying lock tx ${lock.lock_tx_hash} on ${lock.chain}...`);

  // TODO: Query indexer for lock contract events
  // For now, simulate verification (always succeeds after short delay)

  // Placeholder logic
  const isValid = lock.lock_tx_hash && lock.lock_tx_hash.length > 10;

  if (!isValid) {
    return { verified: false, error: 'Invalid transaction hash' };
  }

  // Simulate successful verification
  return {
    verified: true,
    locked_at: new Date().toISOString(),
  };
}

/**
 * Update round status when lock is confirmed
 */
async function updateRoundLockStatus(roundId: string, status: 'LOCKED' | 'FAILED'): Promise<void> {
  await supabase.from('launch_rounds').update({ lock_status: status }).eq('id', roundId);

  console.log(`  Updated round ${roundId} lock_status to ${status}`);

  // Check success gating
  if (status === 'LOCKED') {
    const { data: round } = await supabase
      .from('launch_rounds')
      .select('result, vesting_status, lock_status, success_gated_at')
      .eq('id', roundId)
      .single();

    if (
      round &&
      round.result === 'SUCCESS' &&
      round.vesting_status === 'CONFIRMED' &&
      round.lock_status === 'LOCKED' &&
      !round.success_gated_at
    ) {
      // All gates passed!
      await supabase
        .from('launch_rounds')
        .update({ success_gated_at: new Date().toISOString() })
        .eq('id', roundId);

      console.log(`  🎉 Round ${roundId} marked as SUCCESS (all gates passed)`);
    }
  }
}

/**
 * Process a single pending lock
 */
async function processLock(lock: PendingLock): Promise<void> {
  console.log(`\n🔒 Processing lock ${lock.id}...`);

  try {
    // Verify lock on-chain
    const verification = await verifyLockOnChain(lock);

    if (verification.verified) {
      // Update lock status to LOCKED
      await supabase
        .from('liquidity_locks')
        .update({
          status: 'LOCKED',
          locked_at: verification.locked_at,
          updated_at: new Date().toISOString(),
        })
        .eq('id', lock.id);

      // Update round lock status
      await updateRoundLockStatus(lock.round_id, 'LOCKED');

      console.log(`  ✅ Lock confirmed at ${verification.locked_at}`);
    } else {
      // Mark as FAILED
      await supabase
        .from('liquidity_locks')
        .update({
          status: 'FAILED',
          updated_at: new Date().toISOString(),
        })
        .eq('id', lock.id);

      await updateRoundLockStatus(lock.round_id, 'FAILED');

      console.log(`  ❌ Lock failed: ${verification.error || 'Unknown error'}`);
    }
  } catch (err) {
    console.error(`Error processing lock ${lock.id}:`, err);
  }
}

/**
 * Main lock monitor function
 */
export async function runLiquidityLockMonitor(): Promise<void> {
  console.log('\n🔍 Running Liquidity Lock Monitor...');
  console.log('Time:', new Date().toISOString());

  try {
    // Find pending locks with tx_hash
    const { data: locks, error } = await supabase
      .from('liquidity_locks')
      .select('*')
      .eq('status', 'PENDING')
      .not('lock_tx_hash', 'is', null)
      .limit(20)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching pending locks:', error);
      return;
    }

    if (!locks || locks.length === 0) {
      console.log('No pending locks to process');
      return;
    }

    console.log(`Found ${locks.length} pending locks`);

    // Process each lock
    for (const lock of locks) {
      await processLock(lock as PendingLock);
    }

    console.log('\n✅ Lock monitor completed successfully\n');
  } catch (err) {
    console.error('❌ Lock monitor error:', err);
    throw err;
  }
}

// Run directly if this is the main module
runLiquidityLockMonitor()
  .then(() => {
    console.log('Lock monitor finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Lock monitor failed:', error);
    process.exit(1);
  });

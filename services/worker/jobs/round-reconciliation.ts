/**
 * Round Reconciliation Worker
 * Verifies data integrity for launch rounds
 *
 * Checks:
 * - total_raised matches sum of CONFIRMED contributions
 * - total_participants matches count of unique contributors
 * - Detects anomalies and missing transactions
 *
 * Run: Every 10 minutes via cron
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ReconciliationResult {
  round_id: string;
  status: string;
  db_total_raised: number;
  calculated_total_raised: number;
  db_total_participants: number;
  calculated_total_participants: number;
  has_mismatch: boolean;
  difference: number;
}

/**
 * Reconcile a single round
 */
async function reconcileRound(roundId: string): Promise<ReconciliationResult> {
  // Get round data
  const { data: round, error: roundError } = await supabase
    .from('launch_rounds')
    .select('id, status, total_raised, total_participants')
    .eq('id', roundId)
    .single();

  if (roundError || !round) {
    throw new Error(`Failed to fetch round ${roundId}`);
  }

  // Calculate actual totals from contributions
  const { data: contributions, error: contribError } = await supabase
    .from('contributions')
    .select('amount, user_id')
    .eq('round_id', roundId)
    .eq('status', 'CONFIRMED');

  if (contribError) {
    throw new Error(`Failed to fetch contributions for round ${roundId}`);
  }

  // Calculate totals
  const calculatedTotalRaised = (contributions || []).reduce((sum, c) => sum + Number(c.amount), 0);

  const uniqueParticipants = new Set((contributions || []).map((c) => c.user_id));
  const calculatedTotalParticipants = uniqueParticipants.size;

  // Check for mismatch
  const dbTotalRaised = Number(round.total_raised);
  const difference = Math.abs(dbTotalRaised - calculatedTotalRaised);
  const hasMismatch =
    difference > 0.01 || // Allow for rounding errors (0.01)
    round.total_participants !== calculatedTotalParticipants;

  return {
    round_id: roundId,
    status: round.status,
    db_total_raised: dbTotalRaised,
    calculated_total_raised: calculatedTotalRaised,
    db_total_participants: round.total_participants,
    calculated_total_participants: calculatedTotalParticipants,
    has_mismatch: hasMismatch,
    difference,
  };
}

/**
 * Fix mismatch by updating round totals
 */
async function fixMismatch(result: ReconciliationResult): Promise<boolean> {
  console.log(`🔧 Fixing mismatch for round ${result.round_id}...`);

  const { error } = await supabase
    .from('launch_rounds')
    .update({
      total_raised: result.calculated_total_raised,
      total_participants: result.calculated_total_participants,
    })
    .eq('id', result.round_id);

  if (error) {
    console.error(`❌ Failed to fix round ${result.round_id}:`, error);
    return false;
  }

  console.log(`✅ Fixed round ${result.round_id}`);
  return true;
}

/**
 * Get all active rounds that need reconciliation
 */
async function getActiveRounds(): Promise<string[]> {
  // Reconcile LIVE, ENDED, and FINALIZED rounds
  const { data: rounds, error } = await supabase
    .from('launch_rounds')
    .select('id')
    .in('status', ['LIVE', 'ENDED', 'FINALIZED'])
    .order('created_at', { ascending: false })
    .limit(100); // Process max 100 rounds per run

  if (error) {
    console.error('Error fetching active rounds:', error);
    return [];
  }

  return (rounds || []).map((r) => r.id);
}

/**
 * Main reconciliation function
 */
export async function runRoundReconciliation(): Promise<void> {
  console.log('\n🔍 Running Round Reconciliation...');
  console.log('Time:', new Date().toISOString());

  try {
    const roundIds = await getActiveRounds();

    if (roundIds.length === 0) {
      console.log('No active rounds to reconcile');
      return;
    }

    console.log(`Found ${roundIds.length} rounds to reconcile`);

    const results: ReconciliationResult[] = [];
    let mismatchCount = 0;
    let fixedCount = 0;

    // Reconcile each round
    for (const roundId of roundIds) {
      try {
        const result = await reconcileRound(roundId);
        results.push(result);

        if (result.has_mismatch) {
          mismatchCount++;
          console.warn(`⚠️  Mismatch detected in round ${roundId}:`);
          console.warn(
            `   Total Raised: DB=${result.db_total_raised}, Actual=${result.calculated_total_raised}, Diff=${result.difference}`
          );
          console.warn(
            `   Participants: DB=${result.db_total_participants}, Actual=${result.calculated_total_participants}`
          );

          // Auto-fix in non-finalized rounds
          if (result.status !== 'FINALIZED') {
            const fixed = await fixMismatch(result);
            if (fixed) fixedCount++;
          } else {
            console.warn(`   ⚠️  Round is FINALIZED - manual review required`);
          }
        }
      } catch (error) {
        console.error(`Error reconciling round ${roundId}:`, error);
      }
    }

    console.log('\n📊 Reconciliation Summary:');
    console.log(`  - Total rounds checked: ${results.length}`);
    console.log(`  - Mismatches found: ${mismatchCount}`);
    console.log(`  - Auto-fixed: ${fixedCount}`);
    console.log(`  - Requires manual review: ${mismatchCount - fixedCount}`);

    if (mismatchCount > 0) {
      console.warn('\n⚠️  Anomalies detected! Check logs for details.');
    } else {
      console.log('✅ All rounds balanced correctly');
    }

    console.log('\n✅ Reconciliation completed\n');
  } catch (error) {
    console.error('❌ Reconciliation error:', error);
    throw error;
  }
}

// Run directly if this is the main module
runRoundReconciliation()
  .then(() => {
    console.log('Reconciliation finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Reconciliation failed:', error);
    process.exit(1);
  });

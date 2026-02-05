/**
 * Round State Scheduler Worker
 * Automatically transitions pool states based on time
 *
 * Transitions:
 * - APPROVED → LIVE when start_at reached (legacy presale)
 * - DEPLOYED → ACTIVE when start_at reached (fairlaunch)
 * - LIVE/ACTIVE → ENDED when end_at passed
 *
 * Run: Every minute via cron
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Transition APPROVED rounds to LIVE when start time reached
 */
async function transitionApprovedToLive(): Promise<number> {
  const now = new Date().toISOString();

  // Find APPROVED rounds that should be LIVE
  const { data: rounds, error: fetchError } = await supabase
    .from('launch_rounds')
    .select('id, status, start_at')
    .eq('status', 'APPROVED')
    .lte('start_at', now);

  if (fetchError) {
    console.error('Error fetching APPROVED rounds:', fetchError);
    return 0;
  }

  if (!rounds || rounds.length === 0) {
    return 0;
  }

  console.log(`Found ${rounds.length} rounds to transition APPROVED → LIVE`);

  // Update to LIVE
  const { error: updateError } = await supabase
    .from('launch_rounds')
    .update({ status: 'LIVE' })
    .in(
      'id',
      rounds.map((r: { id: string }) => r.id)
    );

  if (updateError) {
    console.error('Error updating rounds to LIVE:', updateError);
    return 0;
  }

  console.log(`✅ Transitioned ${rounds.length} rounds to LIVE`);
  return rounds.length;
}

/**
 * Transition DEPLOYED rounds to ACTIVE when start time reached
 * This handles Fairlaunch rounds deployed by admin
 */
async function transitionDeployedToActive(): Promise<number> {
  const now = new Date().toISOString();

  // Find DEPLOYED rounds that should be ACTIVE
  const { data: rounds, error: fetchError } = await supabase
    .from('launch_rounds')
    .select('id, status, start_at')
    .eq('status', 'DEPLOYED')
    .lte('start_at', now);

  if (fetchError) {
    console.error('Error fetching DEPLOYED rounds:', fetchError);
    return 0;
  }

  if (!rounds || rounds.length === 0) {
    return 0;
  }

  console.log(`Found ${rounds.length} rounds to transition DEPLOYED → ACTIVE`);

  // Update to ACTIVE
  const { error: updateError } = await supabase
    .from('launch_rounds')
    .update({ status: 'ACTIVE' })
    .in(
      'id',
      rounds.map((r: { id: string }) => r.id)
    );

  if (updateError) {
    console.error('Error updating rounds to ACTIVE:', updateError);
    return 0;
  }

  console.log(`✅ Transitioned ${rounds.length} rounds to ACTIVE`);
  return rounds.length;
}

/**
 * Transition LIVE/ACTIVE rounds to ENDED when end time passed
 */
async function transitionLiveToEnded(): Promise<number> {
  const now = new Date().toISOString();

  // Find LIVE or ACTIVE rounds that should be ENDED
  const { data: rounds, error: fetchError } = await supabase
    .from('launch_rounds')
    .select('id, status, end_at')
    .in('status', ['LIVE', 'ACTIVE'])
    .lte('end_at', now);

  if (fetchError) {
    console.error('Error fetching LIVE rounds:', fetchError);
    return 0;
  }

  if (!rounds || rounds.length === 0) {
    return 0;
  }
  console.log(`Found ${rounds.length} rounds to transition LIVE/ACTIVE → ENDED`);

  // Update to ENDED
  const { error: updateError } = await supabase
    .from('launch_rounds')
    .update({ status: 'ENDED' })
    .in(
      'id',
      rounds.map((r: { id: string }) => r.id)
    );

  if (updateError) {
    console.error('Error updating rounds to ENDED:', updateError);
    return 0;
  }

  console.log(`✅ Transitioned ${rounds.length} rounds to ENDED`);
  return rounds.length;
}

/**
 * Main scheduler function
 */
export async function runRoundStateScheduler(): Promise<void> {
  console.log('\n🔄 Running Round State Scheduler...');
  console.log('Time:', new Date().toISOString());

  try {
    const approvedCount = await transitionApprovedToLive();
    const deployedCount = await transitionDeployedToActive();
    const liveCount = await transitionLiveToEnded();

    console.log('\n📊 Summary:');
    console.log(`  - APPROVED → LIVE: ${approvedCount}`);
    console.log(`  - DEPLOYED → ACTIVE: ${deployedCount}`);
    console.log(`  - LIVE/ACTIVE → ENDED: ${liveCount}`);
    console.log('✅ Scheduler completed successfully\n');
  } catch (error) {
    console.error('❌ Scheduler error:', error);
    throw error;
  }
}

// Run directly if this is the main module
runRoundStateScheduler()
  .then(() => {
    console.log('Scheduler finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Scheduler failed:', error);
    process.exit(1);
  });

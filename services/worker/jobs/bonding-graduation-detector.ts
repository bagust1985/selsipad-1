/**
 * FASE 7 Worker: Bonding Graduation Detector
 * Monitors pools for graduation threshold and triggers migration
 */

import { createClient } from '@supabase/supabase-js';
import { checkGraduationThreshold } from '../../../packages/shared/src/utils/bonding-curve';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function detectGraduation() {
  console.log('[Graduation Detector] Starting graduation check...');

  try {
    // Query all LIVE pools
    const { data: livePools, error } = await supabase
      .from('bonding_pools')
      .select('*')
      .eq('status', 'LIVE');

    if (error) {
      console.error('[Graduation Detector] Error fetching pools:', error);
      return;
    }

    console.log(`[Graduation Detector] Found ${livePools?.length || 0} LIVE pools`);

    for (const pool of livePools || []) {
      const check = checkGraduationThreshold(
        pool.actual_sol_reserves,
        pool.graduation_threshold_sol
      );

      console.log(
        `[Pool ${pool.id}] Progress: ${check.progress_percent}% (${pool.actual_sol_reserves}/${pool.graduation_threshold_sol} lamports)`
      );

      if (check.threshold_met) {
        console.log(`[Pool ${pool.id}] 🎯 GRADUATION THRESHOLD REACHED!`);

        // Update pool status: LIVE → GRADUATING
        const { error: updateError } = await supabase
          .from('bonding_pools')
          .update({
            status: 'GRADUATING',
            updated_at: new Date().toISOString(),
          })
          .eq('id', pool.id);

        if (updateError) {
          console.error(`[Pool ${pool.id}] Failed to update status:`, updateError);
          continue;
        }

        // Create bonding event
        await supabase.from('bonding_events').insert({
          pool_id: pool.id,
          event_type: 'GRADUATION_STARTED',
          event_data: {
            actual_sol_reserves: pool.actual_sol_reserves,
            graduation_threshold: pool.graduation_threshold_sol,
            progress_percent: check.progress_percent,
          },
          triggered_by: null, // System event
        });

        console.log(`[Pool ${pool.id}] Status updated to GRADUATING`);

        // TODO: Notify pool creator via email/notification
        // TODO: Optionally auto-trigger migration if creator has pre-approved
      }
    }

    console.log('[Graduation Detector] Graduation check complete');
  } catch (error) {
    console.error('[Graduation Detector] Fatal error:', error);
    throw error;
  }
}

// Run detector
detectGraduation()
  .then(() => {
    console.log('[Graduation Detector] Job completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[Graduation Detector] Job failed:', error);
    process.exit(1);
  });

/**
 * SCRIPT: check_trending_health.ts
 * Observability check for Trending Engine.
 * Requirements: Snapshot must be generated every 10 mins.
 * Alert Threshold: No snapshot in last 20 mins.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkHealth() {
  console.log('Checking Trending Engine Health...');

  const { data: latest, error } = await supabase
    .from('trending_snapshots')
    .select('computed_at')
    .order('computed_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('CRITICAL: Failed to fetch snapshots.', error);
    process.exit(1);
  }

  if (!latest) {
    console.warn('WARNING: No snapshots found yet. System might be initializing.');
    return;
  }

  const lastRun = new Date(latest.computed_at).getTime();
  const now = Date.now();
  const diffMinutes = (now - lastRun) / 1000 / 60;

  console.log(`Last Snapshot: ${latest.computed_at} (${diffMinutes.toFixed(1)} mins ago)`);

  if (diffMinutes > 20) {
    console.error(
      `🚨 ALERT: Trending Engine Stalled! Last run was ${diffMinutes.toFixed(1)} mins ago.`
    );
    process.exit(1); // Fail for CI/Monitoring
  } else {
    console.log('✅ Trending Engine Healthy.');
  }
}

checkHealth();

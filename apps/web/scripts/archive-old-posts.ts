/**
 * Archive Old Posts Script
 *
 * Soft-deletes posts older than 90 days by setting deleted_at.
 * Run via cron: node scripts/archive-old-posts.ts
 * Or via PM2: pm2 start scripts/archive-old-posts.ts --cron "0 3 * * *"
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RETENTION_DAYS = 90;

async function archiveOldPosts() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

  console.log(
    `[Archive] Archiving posts older than ${cutoffDate.toISOString()} (${RETENTION_DAYS} days)...`
  );

  const { data, error, count } = await supabase
    .from('posts')
    .update({ deleted_at: new Date().toISOString(), deleted_by: 'SYSTEM_ARCHIVE' })
    .lt('created_at', cutoffDate.toISOString())
    .is('deleted_at', null)
    .select('id');

  if (error) {
    console.error('[Archive] Error:', error);
    process.exit(1);
  }

  console.log(`[Archive] Done! Archived ${data?.length || 0} posts.`);
}

archiveOldPosts().catch(console.error);

/**
 * SCRIPT: reconcile_trending.ts
 * Daily Reconciliation: Verifies Top 5 Trending Projects against raw posts.
 * Tolerance: 0 (Exact Match Required)
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function reconcile() {
  console.log('Starting Trending Reconciliation...');

  // 1. Get Latest Snapshot
  const { data: snapshot } = await supabase
    .from('trending_snapshots')
    .select('id, window_start_at, window_end_at')
    .order('computed_at', { ascending: false })
    .limit(1)
    .single();

  if (!snapshot) {
    console.log('No snapshots to reconcile.');
    return;
  }

  // 2. Get Top 5 Projects from Store
  const { data: storedProjects } = await supabase
    .from('trending_projects')
    .select('project_id, score, post_count_24h, comment_count_24h')
    .eq('snapshot_id', snapshot.id)
    .order('rank', { ascending: true })
    .limit(5);

  if (!storedProjects || storedProjects.length === 0) {
    console.log('Snapshot empty.');
    return;
  }

  // 3. Recompute from Raw Posts for these projects
  console.log(`Verifying Top ${storedProjects.length} projects...`);

  for (const proj of storedProjects) {
    // Re-fetch raw data
    const { data: posts, error } = await supabase
      .from('posts')
      .select(
        `
        type, 
        profiles!inner ( bluecheck_status )
      `
      )
      .eq('project_id', proj.project_id)
      .gt('created_at', snapshot.window_start_at)
      .lte('created_at', snapshot.window_end_at) // Strict Window
      .is('deleted_at', null)
      .filter('profiles.bluecheck_status', 'in', '("ACTIVE","VERIFIED")');

    if (error) {
      console.error(`Error fetching posts for ${proj.project_id}`, error);
      continue;
    }

    let rawPostCount = 0;
    let rawCommentCount = 0;

    (posts || []).forEach((p: any) => {
      // Re-apply memory filters if needed (but query should cover)
      if (p.type === 'REPLY') rawCommentCount++;
      else rawPostCount++;
    });

    const rawScore = rawPostCount * 10 + rawCommentCount;

    // Compare
    const scoreMatch = Number(proj.score) === rawScore;
    const postMatch = proj.post_count_24h === rawPostCount;
    const commentMatch = proj.comment_count_24h === rawCommentCount;

    if (scoreMatch && postMatch && commentMatch) {
      console.log(`✅ Project ${proj.project_id}: MATCH (Score: ${rawScore})`);
    } else {
      console.error(`❌ Project ${proj.project_id}: MISMATCH!`);
      console.error(
        `   Stored: Score=${proj.score}, P=${proj.post_count_24h}, C=${proj.comment_count_24h}`
      );
      console.error(`   Raw:    Score=${rawScore}, P=${rawPostCount}, C=${rawCommentCount}`);
      // process.exit(1); // Optional strict fail
    }
  }
}

reconcile();

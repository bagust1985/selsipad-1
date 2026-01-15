/**
 * Trending Projects Aggregator
 * Runs every 10 mins via QStash
 * Window: Last 24 hours
 * Score: (PostCount * 10) + CommentCount
 * Filter: Verified Users Only
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface ProjectScore {
  projectId: string;
  postCount: number;
  commentCount: number;
}

interface Post {
  project_id: string;
  created_at: string;
  type: string;
}

export async function runTrendingAggregator() {
  console.log('Starting Trending Aggregation (DoD Refined)...');

  const now = new Date();
  const windowEnd = now.toISOString();
  const windowStart = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  try {
    // 1. Fetch Eligible Projects (APPROVED or LIVE)
    // We filter posts by these projects to ensure we only trend valid ones.
    const { data: eligibleProjects, error: projError } = await supabase
      .from('projects')
      .select('id, status, chains_supported') // Add category if available
      .in('status', ['APPROVED', 'LIVE']);

    if (projError) throw projError;

    const validProjectIds = new Set((eligibleProjects || []).map((p) => p.id));
    // Map for project metadata (Chain scope)
    const projectMeta = new Map((eligibleProjects || []).map((p) => [p.id, p]));

    // 2. Fetch Activity (Verified Users, Not Deleted)
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(
        `
        id, 
        project_id, 
        type, 
        created_at,
        profiles!inner ( bluecheck_status )
      `
      )
      .gt('created_at', windowStart)
      .is('deleted_at', null) // Filter soft-deleted
      .not('project_id', 'is', null)
      .filter('profiles.bluecheck_status', 'in', '("ACTIVE","VERIFIED")'); // Explicit "Not Banned"

    if (postsError) throw postsError;

    // 3. Aggregate
    interface ExpandedScore extends ProjectScore {
      latestActivity: number;
    }
    const scores = new Map<string, ExpandedScore>();

    (posts || []).forEach((post: Post) => {
      // Filter by Project Status
      if (!validProjectIds.has(post.project_id)) return;

      const pid = post.project_id;
      const ts = new Date(post.created_at).getTime();

      if (!scores.has(pid)) {
        scores.set(pid, { projectId: pid, postCount: 0, commentCount: 0, latestActivity: ts });
      }

      const entry = scores.get(pid)!;
      entry.latestActivity = Math.max(entry.latestActivity, ts);

      if (post.type === 'REPLY') {
        entry.commentCount += 1;
      } else {
        entry.postCount += 1;
      }
    });

    // 4. Compute & Rank (Strict Tie-Breakers)
    // Priority: Score -> PostCount -> CommentCount -> LatestActivity
    const ranked = Array.from(scores.values())
      .map((p) => ({
        ...p,
        totalScore: p.postCount * 10 + p.commentCount,
      }))
      .sort((a, b) => {
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        if (b.postCount !== a.postCount) return b.postCount - a.postCount;
        if (b.commentCount !== a.commentCount) return b.commentCount - a.commentCount;
        return b.latestActivity - a.latestActivity;
      })
      .slice(0, 50); // Top 50 Retention

    if (ranked.length === 0) {
      console.log('No trending activity found (DoD filters applied).');
      return;
    }

    // 5. Create Snapshot
    const { data: snapshot, error: snapError } = await supabase
      .from('trending_snapshots')
      .insert({
        window_start_at: windowStart,
        window_end_at: windowEnd,
        computed_at: windowEnd,
      })
      .select('id')
      .single();

    if (snapError) throw snapError;

    // 6. Insert Trending Projects
    // Derive chain_scope from project meta. Category default ALL for now.
    const rows = ranked.map((p, index) => {
      const meta = projectMeta.get(p.projectId);
      const chainScope =
        meta?.chains_supported && meta.chains_supported.length > 0
          ? meta.chains_supported[0] // Simple primary chain logic
          : 'ALL';

      return {
        snapshot_id: snapshot.id,
        project_id: p.projectId,
        rank: index + 1,
        score: p.totalScore,
        post_count_24h: p.postCount,
        comment_count_24h: p.commentCount,
        category: 'ALL',
        chain_scope: chainScope,
      };
    });

    const { error: insertError } = await supabase.from('trending_projects').insert(rows);

    if (insertError) throw insertError;

    console.log(
      `Trending DoD Aggregation Complete. Snapshot: ${snapshot.id}. Projects: ${rows.length}`
    );
  } catch (error) {
    console.error('Trending Aggregation Failed:', error);
  }
}

'use server';

import { createClient } from '@/lib/supabase/server';

interface TrendingProject {
  projectId: string; // launch_round ID for detail link
  name: string;
  symbol: string;
  logoUrl: string;
  hashtag: string; // e.g. "#$CUR"
  uniqueUsers: number;
}

interface TrendingStatsResult {
  chartData: { value: number; label: string }[];
  trendingProjects: TrendingProject[];
  totalPosts24h: number;
  totalPosts7d: number;
}

/**
 * Get trending feed statistics for the homepage card.
 *
 * - Chart data: daily post counts over the last 7 days
 * - Trending projects: projects whose hashtag (#$SYMBOL) has ≥20 unique users in 24h
 * - Activity totals: 24h and 7d post counts
 *
 * Rules:
 * 1. Score = COUNT(DISTINCT author_id) per hashtag (anti-spam)
 * 2. Only upcoming/live projects eligible (launch_rounds.end_at > NOW())
 * 3. Posts must contain real text + hashtag (not hashtag-only)
 * 4. Threshold: ≥20 unique users to appear
 */
export async function getTrendingStats(): Promise<TrendingStatsResult> {
  try {
    const supabase = createClient();
    const now = new Date();

    // 1. Build chart data: daily post counts for the last 7 days
    const chartData: { value: number; label: string }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const { count } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', dayStart.toISOString())
        .lte('created_at', dayEnd.toISOString());

      chartData.push({
        value: count || 0,
        label: dayNames[dayStart.getDay()] || '',
      });
    }

    // 2. Get trending projects based on hashtag usage by unique users
    const trendingProjects = await getTrendingProjectsByHashtag(supabase, now);

    // 3. Calculate totals
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { count: totalPosts24h } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', twentyFourHoursAgo);

    const { count: totalPosts7d } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo);

    return {
      chartData,
      trendingProjects,
      totalPosts24h: totalPosts24h || 0,
      totalPosts7d: totalPosts7d || 0,
    };
  } catch (error) {
    console.error('[getTrendingStats] Error:', error);
    return {
      chartData: [],
      trendingProjects: [],
      totalPosts24h: 0,
      totalPosts7d: 0,
    };
  }
}

/**
 * Get trending projects by hashtag usage.
 *
 * Flow:
 * 1. Fetch active (upcoming/live) project symbols from launch_rounds + projects
 * 2. Fetch posts from last 24h that have hashtags AND real text content
 * 3. Match hashtags to project symbols
 * 4. Count unique users per project hashtag
 * 5. Return top 5 projects with ≥20 unique users
 */
async function getTrendingProjectsByHashtag(supabase: any, now: Date): Promise<TrendingProject[]> {
  try {
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    // Step 1: Get active (upcoming/live) project symbols from launch_rounds
    // Active = launch_rounds.end_at > NOW() AND status IN (DEPLOYED, ACTIVE, LIVE)
    const { data: activeRounds, error: roundsError } = await supabase
      .from('launch_rounds')
      .select(
        `
        id,
        status,
        start_at,
        end_at,
        project_id,
        params,
        projects (
          id, name, symbol, logo_url
        )
      `
      )
      .in('status', ['DEPLOYED', 'ACTIVE', 'LIVE'])
      .gt('end_at', now.toISOString());

    if (roundsError || !activeRounds || activeRounds.length === 0) {
      console.log('[getTrendingProjectsByHashtag] No active rounds found');
      return [];
    }

    // Build a map: lowercase symbol → project info
    const symbolMap = new Map<
      string,
      { roundId: string; name: string; symbol: string; logoUrl: string }
    >();
    for (const round of activeRounds) {
      const project = round.projects as any;
      if (!project) continue;

      const symbol = (round.params?.token_symbol || project.symbol || '').toUpperCase();
      if (!symbol) continue;

      symbolMap.set(symbol.toLowerCase(), {
        roundId: round.id,
        name: round.params?.project_name || project.name,
        symbol: symbol,
        logoUrl: round.params?.logo_url || project.logo_url || '/placeholder-logo.png',
      });
    }

    if (symbolMap.size === 0) {
      console.log('[getTrendingProjectsByHashtag] No active project symbols found');
      return [];
    }

    // Step 2: Get posts from last 24h with hashtags
    const { data: recentPosts, error: postsError } = await supabase
      .from('posts')
      .select('id, content, hashtags, author_id')
      .gte('created_at', twentyFourHoursAgo)
      .is('deleted_at', null)
      .not('hashtags', 'is', null)
      .limit(1000);

    if (postsError || !recentPosts || recentPosts.length === 0) {
      return [];
    }

    // Step 3: Filter posts that have real text content (not just hashtags)
    // and match hashtags to active project symbols
    // Count unique users per project symbol
    const projectUserSets = new Map<string, Set<string>>(); // symbol → Set<author_id>

    for (const post of recentPosts) {
      // Content validation: strip all hashtags, check remaining text ≥ 3 chars
      const contentWithoutHashtags = (post.content || '').replace(/#\S+/g, '').trim();

      if (contentWithoutHashtags.length < 3) {
        continue; // Skip hashtag-only posts
      }

      // Check each hashtag in this post
      const hashtags: string[] = post.hashtags || [];
      for (const tag of hashtags) {
        // Normalize: #$CUR → cur, #CUR → cur, #$cur → cur
        const normalized = tag
          .replace(/^#\$?/, '') // Remove leading # and optional $
          .toLowerCase();

        if (symbolMap.has(normalized)) {
          if (!projectUserSets.has(normalized)) {
            projectUserSets.set(normalized, new Set());
          }
          projectUserSets.get(normalized)!.add(post.author_id);
        }
      }
    }

    // Step 4: Filter ≥20 unique users and rank
    const TRENDING_THRESHOLD = 20;
    const results: TrendingProject[] = [];

    for (const [symbol, userSet] of projectUserSets.entries()) {
      if (userSet.size >= TRENDING_THRESHOLD) {
        const project = symbolMap.get(symbol)!;
        results.push({
          projectId: project.roundId,
          name: project.name,
          symbol: project.symbol,
          logoUrl: project.logoUrl,
          hashtag: `#$${project.symbol}`,
          uniqueUsers: userSet.size,
        });
      }
    }

    // Sort by unique users descending, return top 5
    results.sort((a, b) => b.uniqueUsers - a.uniqueUsers);
    return results.slice(0, 5);
  } catch (err) {
    console.error('[getTrendingProjectsByHashtag] Error:', err);
    return [];
  }
}

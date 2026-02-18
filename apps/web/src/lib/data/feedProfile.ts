'use server';

import { createClient } from '@/lib/supabase/server';

export interface SocialProfile {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  banner_url?: string;
  bluecheck: boolean;
  follower_count: number;
  following_count: number;
  post_count: number;
}

/**
 * Get Social Profile
 *
 * Fetches a user's public social profile with follower/following counts.
 * All data comes from existing tables — no new tables needed.
 */
export async function getSocialProfile(userId: string): Promise<SocialProfile | null> {
  const supabase = createClient();

  try {
    // Fetch profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('user_id, username, avatar_url, bio, banner_url, bluecheck_status')
      .eq('user_id', userId)
      .single();

    if (error || !profile) return null;

    // Count followers (people who follow this user)
    const { count: followerCount } = await supabase
      .from('user_follows')
      .select('id', { count: 'exact', head: true })
      .eq('following_id', userId);

    // Count following (people this user follows)
    const { count: followingCount } = await supabase
      .from('user_follows')
      .select('id', { count: 'exact', head: true })
      .eq('follower_id', userId);

    // Count posts
    const { count: postCount } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('author_id', userId)
      .is('deleted_at', null);

    return {
      id: profile.user_id,
      username: profile.username || 'Anonymous',
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      banner_url: profile.banner_url,
      bluecheck: profile.bluecheck_status === 'ACTIVE' || profile.bluecheck_status === 'VERIFIED',
      follower_count: followerCount || 0,
      following_count: followingCount || 0,
      post_count: postCount || 0,
    };
  } catch (err) {
    console.error('Error fetching social profile:', err);
    return null;
  }
}

/**
 * Get User Posts
 *
 * Fetches a user's posts for their profile feed.
 */
export async function getUserPosts(userId: string, limit = 20) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('posts')
      .select('id, author_id, content, type, created_at, image_urls, hashtags, like_count')
      .eq('author_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    // Fetch profile for author info
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id, username, avatar_url, bluecheck_status')
      .eq('user_id', userId)
      .single();

    return data.map((post: any) => ({
      id: post.id,
      author: {
        id: userId,
        username: profile?.username || 'Anonymous',
        avatar_url: profile?.avatar_url,
        bluecheck:
          profile?.bluecheck_status === 'ACTIVE' || profile?.bluecheck_status === 'VERIFIED',
      },
      content: post.content,
      type: post.type?.toLowerCase() || 'text',
      created_at: post.created_at,
      likes: post.like_count || 0,
      replies: 0,
      is_liked: false,
      image_urls: post.image_urls || [],
      hashtags: post.hashtags || [],
    }));
  } catch (err) {
    console.error('Error fetching user posts:', err);
    return [];
  }
}

// Data layer for Social Feed - REAL API INTEGRATION
// Replaces stub data with Supabase queries

import { createClient } from '@/lib/supabase/client';

export interface Post {
  id: string;
  author: {
    id: string;
    username: string;
    avatar_url?: string;
    bluecheck: boolean;
  };
  content: string;
  project_id?: string;
  project_name?: string;
  type: 'text' | 'update' | 'quote';
  created_at: string;
  likes: number;
  replies: number;
  is_liked: boolean;
  image_urls?: string[];
  hashtags?: string[];
  view_count?: number;
  edit_count?: number;
  last_edited_at?: string;
}

/**
 * Get Feed Posts
 *
 * Fetches posts for the social feed with pagination
 * Ordered by created_at descending (newest first)
 */
export async function getFeedPosts(limit = 20): Promise<Post[]> {
  const supabase = createClient();

  try {
    // Get current user (if authenticated) to check is_liked
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Fetch posts with author profile join
    // Fetch posts without JOIN (no FK relationship anymore)
    const { data, error } = await supabase
      .from('posts')
      .select('id, author_id, content, project_id, type, created_at, image_urls, hashtags')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching feed posts:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Fetch author profiles separately
    const authorIds = [...new Set(data.map((p) => p.author_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, username, avatar_url, bluecheck_status')
      .in('user_id', authorIds);

    // Create profile lookup
    const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

    // Get like counts and user's likes
    const postIds = data.map((p) => p.id);
    const likesData = await getPostLikeCounts(postIds, user?.id);

    // Map to frontend format with manual join
    return data.map((post: any) => {
      const author = profileMap.get(post.author_id) || {};
      const likes = likesData[post.id] || { count: 0, userLiked: false };

      return {
        id: post.id,
        author: {
          id: post.author_id, // Use author_id (user_id) for ownership check
          username: (author as any).username || 'Anonymous',
          avatar_url: (author as any).avatar_url,
          bluecheck:
            (author as any).bluecheck_status === 'ACTIVE' ||
            (author as any).bluecheck_status === 'VERIFIED',
        },
        content: post.content,
        project_id: post.project_id,
        project_name: undefined, // Will need separate query if needed
        type: mapPostType(post.type),
        created_at: post.created_at,
        likes: likes.count,
        replies: 0,
        is_liked: likes.userLiked,
        image_urls: post.image_urls || [],
        hashtags: post.hashtags || [],
      };
    });
  } catch (err) {
    console.error('Unexpected error in getFeedPosts:', err);
    return [];
  }
}

/**
 * Get Project Posts
 *
 * Fetches posts for a specific project
 */
export async function getProjectPosts(projectId: string): Promise<Post[]> {
  const supabase = createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('posts')
      .select('id, author_id, content, project_id, type, created_at')
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching project posts:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Fetch author profiles
    const authorIds = [...new Set(data.map((p) => p.author_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, username, avatar_url, bluecheck_status')
      .in('user_id', authorIds);

    const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

    const postIds = data.map((p) => p.id);
    const likesData = await getPostLikeCounts(postIds, user?.id);

    return data.map((post: any) => {
      const author = profileMap.get(post.author_id) || {};
      const likes = likesData[post.id] || { count: 0, userLiked: false };

      return {
        id: post.id,
        author: {
          id: post.author_id, // Use author_id (user_id) for ownership check
          username: (author as any).username || 'Anonymous',
          avatar_url: (author as any).avatar_url,
          bluecheck:
            (author as any).bluecheck_status === 'ACTIVE' ||
            (author as any).bluecheck_status === 'VERIFIED',
        },
        content: post.content,
        project_id: post.project_id,
        project_name: undefined,
        type: mapPostType(post.type),
        created_at: post.created_at,
        likes: likes.count,
        replies: 0,
        is_liked: likes.userLiked,
      };
    });
  } catch (err) {
    console.error('Unexpected error in getProjectPosts:', err);
    return [];
  }
}

/**
 * Create Post
 *
 * Creates a new post in the social feed
 * Requires Blue Check status for posting
 */
export async function createPost(content: string, projectId?: string): Promise<Post> {
  const supabase = createClient();

  try {
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Check Blue Check status (required for posting)
    const { data: profile } = await supabase
      .from('profiles')
      .select('bluecheck_status, username, avatar_url')
      .eq('user_id', user.id)
      .single();

    if (
      !profile ||
      (profile.bluecheck_status !== 'ACTIVE' && profile.bluecheck_status !== 'VERIFIED')
    ) {
      throw new Error('Blue Check status required to create posts');
    }

    // Insert new post
    const { data: newPost, error } = await supabase
      .from('posts')
      .insert({
        author_user_id: user.id,
        content,
        project_id: projectId,
        type: 'TEXT',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      throw error;
    }

    return {
      id: newPost.id,
      author: {
        id: user.id,
        username: profile.username || 'Anonymous',
        avatar_url: profile.avatar_url,
        bluecheck: true,
      },
      content: newPost.content,
      project_id: newPost.project_id,
      type: 'text',
      created_at: newPost.created_at,
      likes: 0,
      replies: 0,
      is_liked: false,
    };
  } catch (err) {
    console.error('Unexpected error in createPost:', err);
    throw err;
  }
}

/**
 * Like Post
 *
 * Adds a like to a post
 */
export async function likePost(postId: string): Promise<void> {
  const supabase = createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Insert like (will fail silently if already exists due to unique constraint)
    await supabase.from('post_likes').insert({
      post_id: postId,
      user_id: user.id,
    });
  } catch (err) {
    console.error('Unexpected error in likePost:', err);
    throw err;
  }
}

/**
 * Unlike Post
 *
 * Removes a like from a post
 */
export async function unlikePost(postId: string): Promise<void> {
  const supabase = createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Delete like
    await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
  } catch (err) {
    console.error('Unexpected error in unlikePost:', err);
    throw err;
  }
}

// Helper functions

async function getPostLikeCounts(
  postIds: string[],
  userId?: string
): Promise<Record<string, { count: number; userLiked: boolean }>> {
  if (postIds.length === 0) return {};

  const supabase = createClient();

  try {
    // Get like counts
    const { data: likes } = await supabase
      .from('post_likes')
      .select('post_id, user_id')
      .in('post_id', postIds);

    // Aggregate counts and check user likes
    const result: Record<string, { count: number; userLiked: boolean }> = {};

    postIds.forEach((id) => {
      result[id] = { count: 0, userLiked: false };
    });

    (likes || []).forEach((like: any) => {
      if (!result[like.post_id]) {
        result[like.post_id] = { count: 0, userLiked: false };
      }
      const postResult = result[like.post_id];
      if (postResult) {
        postResult.count++;
        if (userId && like.user_id === userId) {
          postResult.userLiked = true;
        }
      }
    });

    return result;
  } catch (err) {
    console.error('Error fetching post like counts:', err);
    return {};
  }
}

function mapPostType(dbType: string): 'text' | 'update' | 'quote' {
  switch (dbType) {
    case 'UPDATE':
      return 'update';
    case 'QUOTE':
      return 'quote';
    case 'TEXT':
    default:
      return 'text';
  }
}

/**
 * Get Following Feed
 *
 * Fetches posts only from users that the current user follows
 */
export async function getFollowingFeed(limit = 20): Promise<Post[]> {
  const supabase = createClient();

  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.warn('User not authenticated');
      return [];
    }

    // Get list of users that current user follows
    const { data: following } = await supabase
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', user.id);

    if (!following || following.length === 0) {
      return [];
    }

    const followingIds = following.map((f) => f.following_id);

    // Fetch posts from followed users
    const { data, error } = await supabase
      .from('posts')
      .select('id, author_id, content, project_id, type, created_at')
      .in('author_id', followingIds)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching following feed:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Fetch author profiles
    const authorIds = [...new Set(data.map((p) => p.author_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, username, avatar_url, bluecheck_status')
      .in('user_id', authorIds);

    const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

    const postIds = data.map((p) => p.id);
    const likesData = await getPostLikeCounts(postIds, user?.id);

    return data.map((post: any) => {
      const author = profileMap.get(post.author_id) || {};
      const likes = likesData[post.id] || { count: 0, userLiked: false };

      return {
        id: post.id,
        author: {
          id: post.author_id,
          username: (author as any).username || 'Anonymous',
          avatar_url: (author as any).avatar_url,
          bluecheck:
            (author as any).bluecheck_status === 'ACTIVE' ||
            (author as any).bluecheck_status === 'VERIFIED',
        },
        content: post.content,
        project_id: post.project_id,
        project_name: undefined,
        type: mapPostType(post.type),
        created_at: post.created_at,
        likes: likes.count,
        replies: 0,
        is_liked: likes.userLiked,
      };
    });
  } catch (err) {
    console.error('Unexpected error in getFollowingFeed:', err);
    return [];
  }
}

/**
 * Get Post By ID
 *
 * Fetches a single post by its ID with author profile and like data
 */
export async function getPostById(postId: string): Promise<Post | null> {
  const supabase = createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: post, error } = await supabase
      .from('posts')
      .select('id, author_id, content, project_id, type, created_at, image_urls, hashtags')
      .eq('id', postId)
      .is('deleted_at', null)
      .single();

    if (error || !post) {
      console.error('Error fetching post:', error);
      return null;
    }

    // Fetch author profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id, username, avatar_url, bluecheck_status')
      .eq('user_id', post.author_id)
      .single();

    // Get like data
    const likesData = await getPostLikeCounts([post.id], user?.id);
    const likes = likesData[post.id] || { count: 0, userLiked: false };

    return {
      id: post.id,
      author: {
        id: post.author_id,
        username: profile?.username || 'Anonymous',
        avatar_url: profile?.avatar_url,
        bluecheck:
          profile?.bluecheck_status === 'ACTIVE' || profile?.bluecheck_status === 'VERIFIED',
      },
      content: post.content,
      project_id: post.project_id,
      project_name: undefined,
      type: mapPostType(post.type),
      created_at: post.created_at,
      likes: likes.count,
      replies: 0,
      is_liked: likes.userLiked,
      image_urls: post.image_urls || [],
      hashtags: post.hashtags || [],
    };
  } catch (err) {
    console.error('Unexpected error in getPostById:', err);
    return null;
  }
}

export interface PostComment {
  id: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    username: string;
    avatar_url?: string;
    bluecheck: boolean;
  };
}

/**
 * Get Post Comments
 *
 * Fetches all comments for a post with author profiles
 */
export async function getPostComments(postId: string): Promise<PostComment[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('post_comments')
      .select('id, content, created_at, author_id')
      .eq('post_id', postId)
      .is('deleted_at', null)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: true });

    if (error || !data) {
      console.error('Error fetching comments:', error);
      return [];
    }

    if (data.length === 0) return [];

    // Fetch author profiles
    const authorIds = [...new Set(data.map((c: any) => c.author_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, username, avatar_url, bluecheck_status')
      .in('user_id', authorIds);

    const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

    return data.map((comment: any) => {
      const author = profileMap.get(comment.author_id) || {};
      return {
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        author: {
          id: comment.author_id,
          username: (author as any).username || 'Anonymous',
          avatar_url: (author as any).avatar_url,
          bluecheck:
            (author as any).bluecheck_status === 'ACTIVE' ||
            (author as any).bluecheck_status === 'VERIFIED',
        },
      };
    });
  } catch (err) {
    console.error('Unexpected error in getPostComments:', err);
    return [];
  }
}

/**
 * Create Comment
 *
 * Adds a comment to a post
 */
export async function createComment(postId: string, content: string): Promise<PostComment | null> {
  const supabase = createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, avatar_url, bluecheck_status')
      .eq('user_id', user.id)
      .single();

    const { data: comment, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content,
      })
      .select()
      .single();

    if (error || !comment) {
      console.error('Error creating comment:', error);
      return null;
    }

    return {
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      author: {
        id: user.id,
        username: profile?.username || 'Anonymous',
        avatar_url: profile?.avatar_url,
        bluecheck:
          profile?.bluecheck_status === 'ACTIVE' || profile?.bluecheck_status === 'VERIFIED',
      },
    };
  } catch (err) {
    console.error('Unexpected error in createComment:', err);
    return null;
  }
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Pencil } from 'lucide-react';
import { FeedPost } from '@/components/feed/FeedPost';
import { deletePost } from '../../interactions';
import type { Post } from '@/lib/data/feed';

interface SocialProfile {
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

export function FeedProfileClientContent({ userId }: { userId: string }) {
  const router = useRouter();
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  // Fetch profile data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch profile + posts
        const res = await fetch(`/api/feed/profile/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();

        setProfile(data.profile);
        setPosts(data.posts);

        // Check follow status
        const followRes = await fetch(`/api/feed/follow/${userId}`);
        const followData = await followRes.json();
        setIsFollowing(followData.following);

        // Get current user ID from session API
        const sessionRes = await fetch('/api/auth/session');
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          setCurrentUserId(sessionData.userId);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleFollow = async () => {
    if (followLoading) return;

    setFollowLoading(true);
    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const res = await fetch(`/api/feed/follow/${userId}`, { method });

      if (res.ok) {
        setIsFollowing(!isFollowing);
        if (profile) {
          setProfile({
            ...profile,
            follower_count: profile.follower_count + (isFollowing ? -1 : 1),
          });
        }
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Delete this post? This cannot be undone.')) return;

    setDeletingPostId(postId);
    try {
      await deletePost(postId);
      setPosts(posts.filter((p) => p.id !== postId));
      if (profile) {
        setProfile({ ...profile, post_count: profile.post_count - 1 });
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post');
    } finally {
      setDeletingPostId(null);
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-full" />
              <div className="h-5 bg-white/10 rounded w-32" />
            </div>
            <div className="h-32 bg-white/10 rounded-2xl" />
            <div className="w-20 h-20 bg-white/10 rounded-full mx-auto" />
            <div className="h-4 bg-white/10 rounded w-48 mx-auto" />
            <div className="h-3 bg-white/10 rounded w-64 mx-auto" />
            <div className="flex justify-center gap-8">
              <div className="h-4 bg-white/10 rounded w-16" />
              <div className="h-4 bg-white/10 rounded w-16" />
              <div className="h-4 bg-white/10 rounded w-16" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg">User not found</p>
          <button
            onClick={() => router.push('/feed')}
            className="mt-4 text-cyan-400 hover:text-cyan-300 text-sm"
          >
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUserId === userId;

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-2xl mx-auto">
        {/* Header Bar */}
        <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => router.push('/feed')}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">{profile.username}</h1>
            <p className="text-xs text-gray-500">{formatCount(profile.post_count)} posts</p>
          </div>
        </div>

        {/* Profile Header */}
        <div className="pb-4">
          {/* Banner — full width, no padding */}
          <div className="h-48 w-full overflow-hidden">
            {profile.banner_url ? (
              <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-cyan-900/30 via-purple-900/20 to-blue-900/30" />
            )}
          </div>

          {/* Avatar + Action Buttons Row */}
          <div className="relative z-10 flex items-end justify-between px-4 -mt-12">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="w-24 h-24 rounded-full object-cover border-4 border-black"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-black flex items-center justify-center text-2xl font-bold text-gray-400">
                {profile.username[0]?.toUpperCase()}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-2 mb-1">
              {isOwnProfile ? (
                <button
                  onClick={() => router.push('/profile/edit')}
                  className="px-5 py-2 rounded-full text-sm font-bold border border-gray-600 text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
              ) : currentUserId ? (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                    isFollowing
                      ? 'bg-transparent border border-gray-600 text-white hover:border-red-500 hover:text-red-400'
                      : 'bg-white text-black hover:bg-gray-200'
                  }`}
                >
                  {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                </button>
              ) : null}
            </div>
          </div>

          {/* Username & Verified */}
          <div className="mt-3 px-4">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xl font-bold text-white">{profile.username}</h2>
              {profile.bluecheck && (
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="11" r="11" fill="#39AEC4" />
                  <path
                    d="M6.5 11.5L9.5 14.5L15.5 8.5"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <p className="text-gray-500 text-sm">
              @{profile.username.toLowerCase().replace(/\s/g, '')}
            </p>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-white text-sm mt-3 px-4 leading-relaxed">{profile.bio}</p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-5 mt-4 px-4">
            <span className="text-sm">
              <span className="text-white font-bold">{formatCount(profile.following_count)}</span>{' '}
              <span className="text-gray-500">Following</span>
            </span>
            <span className="text-sm">
              <span className="text-white font-bold">{formatCount(profile.follower_count)}</span>{' '}
              <span className="text-gray-500">Followers</span>
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/10 flex">
          <button className="flex-1 py-3 text-sm font-bold text-cyan-400 border-b-2 border-cyan-400 text-center">
            Posts
          </button>
          <button className="flex-1 py-3 text-sm font-medium text-gray-500 hover:text-gray-300 text-center transition-colors cursor-not-allowed">
            Likes
          </button>
        </div>

        {/* Posts Feed */}
        <div>
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No posts yet</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="relative group/profilepost">
                <FeedPost post={post} currentUserId={currentUserId} />
                {/* Delete button for own posts */}
                {isOwnProfile && (
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    disabled={deletingPostId === post.id}
                    className="absolute top-4 right-4 p-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all opacity-0 group-hover/profilepost:opacity-100 disabled:opacity-50 z-20"
                    title="Delete post"
                  >
                    {deletingPostId === post.id ? (
                      <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

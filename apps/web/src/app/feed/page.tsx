'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Image as ImageIcon, Smile, Send } from 'lucide-react';
import { EmptyState, EmptyIcon, SkeletonCard, Banner } from '@/components/ui';
import { PageHeader, PageContainer } from '@/components/layout';
import { getFeedPosts, getFollowingFeed, createPost, type Post } from '@/lib/data/feed';
import { getUserProfile } from '@/lib/data/profile';
import { useToast } from '@/components/ui';
import { FeedPost } from '@/components/feed/FeedPost';
import { PostComposer } from '@/components/feed/PostComposer';

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEligible, setUserEligible] = useState(false);
  const [feedFilter, setFeedFilter] = useState<'all' | 'following'>('all');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const { showToast } = useToast();

  // Load data
  useState(() => {
    loadFeed('all');
  });

  const loadFeed = async (filter: 'all' | 'following') => {
    setLoading(true);
    try {
      const [postsData, profile] = await Promise.all([
        filter === 'following' ? getFollowingFeed() : getFeedPosts(),
        getUserProfile(),
      ]);
      setPosts(postsData);
      setUserEligible(profile?.bluecheck_status === 'active');
      setUserProfile(profile);
      setCurrentUserId(profile?.id);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedFilterChange = (filter: 'all' | 'following') => {
    setFeedFilter(filter);
    loadFeed(filter);
  };

  const handleSubmitPost = async (content: string, imageUrls?: string[]) => {
    try {
      const newPost = await createPost(content);
      setPosts([newPost, ...posts]);
      showToast('success', 'Post published successfully');
    } catch (error) {
      showToast('error', 'Failed to publish post');
    }
  };

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter((p) => p.id !== postId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-page pb-20">
        <PageHeader title="Selsi Feed" />
        <div className="max-w-[680px] mx-auto px-4 py-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-[20px] bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-[#39AEC4]/10 p-5 animate-pulse"
            >
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-white/10 rounded w-1/3" />
                  <div className="h-3 bg-white/5 rounded w-full" />
                  <div className="h-3 bg-white/5 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-page pb-20">
      <PageHeader title="Selsi Feed" />

      {/* Feed Filter Tabs — Gradient pill style */}
      <div className="sticky top-14 z-20 backdrop-blur-xl bg-black/60 border-b border-[#39AEC4]/10">
        <div className="max-w-[680px] mx-auto flex gap-2 px-4 py-3">
          <button
            onClick={() => handleFeedFilterChange('all')}
            className={`px-5 py-2 text-sm font-semibold rounded-full transition-all ${
              feedFilter === 'all'
                ? 'bg-gradient-to-r from-[#39AEC4] to-[#756BBA] text-white shadow-lg shadow-[#756BBA]/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-white/10'
            }`}
          >
            For You
          </button>
          <button
            onClick={() => handleFeedFilterChange('following')}
            className={`px-5 py-2 text-sm font-semibold rounded-full transition-all ${
              feedFilter === 'following'
                ? 'bg-gradient-to-r from-[#39AEC4] to-[#756BBA] text-white shadow-lg shadow-[#756BBA]/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-white/10'
            }`}
          >
            Following
          </button>
        </div>
      </div>

      <div className="max-w-[680px] mx-auto px-4 py-6 flex flex-col gap-10">
        {/* Following Banner */}
        {feedFilter === 'following' && (
          <Banner
            type="info"
            message="Following Feed"
            submessage="Showing posts only from users you follow"
          />
        )}

        {/* Info Banner for non-eligible users */}
        {!userEligible && (
          <div className="rounded-[20px] bg-gradient-to-br from-[#39AEC4]/5 to-[#756BBA]/5 backdrop-blur-xl border border-[#39AEC4]/20 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#39AEC4]/30 to-[#756BBA]/30 border border-[#39AEC4]/40 flex items-center justify-center text-lg flex-shrink-0">
                ✨
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Want to post on the feed?</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Get Blue Check verification to start posting
                </p>
              </div>
              <Link
                href="/profile/blue-check"
                className="px-4 py-2 text-xs font-semibold rounded-full bg-gradient-to-r from-[#39AEC4] to-[#756BBA] text-white hover:shadow-lg hover:shadow-[#756BBA]/20 transition-all flex-shrink-0"
              >
                Get Blue Check
              </Link>
            </div>
          </div>
        )}

        {/* Inline Post Composer */}
        {userEligible && (
          <PostComposer
            userProfile={userProfile}
            isEligible={userEligible}
            onSubmit={handleSubmitPost}
          />
        )}

        {/* Feed Posts */}
        {posts.length === 0 ? (
          <div className="rounded-[20px] bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-[#39AEC4]/10 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#39AEC4]/20 to-[#756BBA]/20 border border-[#39AEC4]/30 flex items-center justify-center text-3xl">
              📝
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Feed is empty</h3>
            <p className="text-sm text-gray-400 mb-4">
              Feed will be filled with project updates and trending posts
            </p>
            <Link
              href="/explore"
              className="inline-flex px-6 py-2.5 rounded-full bg-gradient-to-r from-[#39AEC4] to-[#756BBA] text-white text-sm font-semibold hover:shadow-lg hover:shadow-[#756BBA]/20 transition-all"
            >
              Explore Projects
            </Link>
          </div>
        ) : (
          posts.map((post) => (
            <FeedPost
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onDelete={() => handleDeletePost(post.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, Avatar, EmptyState, EmptyIcon, Banner } from '@/components/ui';
import { PageHeader, PageContainer, BottomSheet } from '@/components/layout';
import { type Post } from '@/lib/data/feed';
import { createPost } from './actions';
import { formatDistance } from 'date-fns';
import { useToast } from '@/components/ui';
import { FeedPost } from '@/components/feed/FeedPost';

interface FeedClientContentProps {
  initialPosts: Post[];
  userEligible: boolean;
  userProfile?: any;
}

/**
 * Feed Client Content
 *
 * Handles interactive feed UI including post composer
 */
export default function FeedClientContent({
  initialPosts,
  userEligible,
  userProfile,
}: FeedClientContentProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [composerOpen, setComposerOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleFabClick = () => {
    if (!userEligible) {
      showToast('error', 'Blue Check required to post');
      // TODO: Show gating notice modal
      return;
    }
    setComposerOpen(true);
  };

  const handleSubmitPost = async () => {
    if (!newPostContent.trim()) {
      showToast('error', 'Post content is required');
      return;
    }

    setSubmitting(true);
    try {
      const newPost = await createPost(newPostContent);
      setPosts([newPost, ...posts]);
      setNewPostContent('');
      setComposerOpen(false);
      showToast('success', 'Post published successfully');
    } catch (error) {
      showToast('error', 'Failed to publish post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-page pb-20">
      <PageHeader title="Feed" />

      <PageContainer className="py-4 space-y-4">
        {/* Info Banner for non-eligible users */}
        {!userEligible && (
          <Banner
            type="info"
            message="Want to post on the feed?"
            submessage="Get Blue Check verification to start posting"
            action={{
              label: 'Get Blue Check',
              onClick: () => (window.location.href = '/profile/blue-check'),
            }}
          />
        )}

        {/* Feed Posts */}
        {posts.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon={<EmptyIcon />}
                title="Feed is empty"
                description="Feed will be filled with project updates and trending posts"
                action={{
                  label: 'Explore Projects',
                  onClick: () => (window.location.href = '/explore'),
                }}
              />
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <FeedPost
              key={post.id}
              post={post}
              currentUserId={userProfile?.user_id}
              onDelete={() => setPosts(posts.filter((p) => p.id !== post.id))}
            />
          ))
        )}
      </PageContainer>

      {/* FAB (Floating Action Button) */}
      <button
        onClick={handleFabClick}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary-main text-primary-text rounded-full shadow-xl hover:bg-primary-hover active:scale-95 transition-all flex items-center justify-center z-30"
        aria-label="Create new post"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Composer Bottom Sheet */}
      <BottomSheet isOpen={composerOpen} onClose={() => setComposerOpen(false)} title="Create Post">
        <div className="space-y-4">
          <textarea
            placeholder="What's happening?"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="w-full min-h-32 bg-bg-input border border-border-subtle rounded-md px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all resize-none"
            maxLength={500}
          />

          <div className="flex items-center justify-between">
            <span className="text-caption text-text-tertiary">{newPostContent.length}/500</span>
            <button
              onClick={handleSubmitPost}
              disabled={!newPostContent.trim() || submitting}
              className="px-6 py-2 bg-primary-main text-primary-text rounded-md text-body-sm font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  Avatar,
  EmptyState,
  EmptyIcon,
  SkeletonCard,
  Banner,
} from '@/components/ui';
import { PageHeader, PageContainer, BottomSheet } from '@/components/layout';
import { getFeedPosts, createPost, type Post } from '@/lib/data/feed';
import { getUserProfile } from '@/lib/data/profile';
import { formatDistance } from 'date-fns';
import { useToast } from '@/components/ui';

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userEligible, setUserEligible] = useState(false);
  const { showToast } = useToast();

  // Load data
  useState(() => {
    Promise.all([getFeedPosts(), getUserProfile()]).then(([postsData, profile]) => {
      setPosts(postsData);
      setUserEligible(profile?.bluecheck_status === 'active');
      setLoading(false);
    });
  });

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

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-page pb-20">
        <PageHeader title="Feed" />
        <PageContainer className="py-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </PageContainer>
      </div>
    );
  }

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
            <Card key={post.id} hover>
              <CardContent className="space-y-3">
                {/* Author Row */}
                <div className="flex items-center gap-3">
                  <Avatar
                    src={post.author.avatar_url}
                    alt={post.author.username}
                    size="md"
                    fallback={post.author.username.slice(0, 2).toUpperCase()}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-heading-sm truncate">@{post.author.username}</h4>
                      {post.author.bluecheck && <span className="text-primary-main">✓</span>}
                    </div>
                    <p className="text-caption text-text-tertiary">
                      {formatDistance(new Date(post.created_at), new Date(), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <p className="text-body-sm text-text-primary whitespace-pre-wrap line-clamp-5">
                  {post.content}
                </p>

                {/* Project Tag */}
                {post.project_id && (
                  <Link href={`/project/${post.project_id}`}>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-bg-elevated border border-border-subtle rounded-full hover:border-primary-main transition-colors">
                      <span className="text-caption font-medium text-text-secondary">
                        🏷️ {post.project_name}
                      </span>
                    </div>
                  </Link>
                )}

                {/* Engagement Stats */}
                <div className="flex items-center gap-4 pt-2 border-t border-border-subtle">
                  <button className="flex items-center gap-1.5 text-caption text-text-secondary hover:text-primary-main transition-colors">
                    <svg
                      className="w-4 h-4"
                      fill={post.is_liked ? 'currentColor' : 'none'}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-caption text-text-secondary hover:text-primary-main transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span>{post.replies}</span>
                  </button>
                </div>
              </CardContent>
            </Card>
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

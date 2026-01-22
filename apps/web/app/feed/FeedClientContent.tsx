'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, Avatar, EmptyState, EmptyIcon, Banner } from '@/components/ui';
import { PageHeader, PageContainer } from '@/components/layout';
import { type Post } from '@/lib/data/feed';
import { createPost } from './actions';
import { useToast } from '@/components/ui';
import { FeedPost } from '@/components/feed/FeedPost';
import { PostComposer } from '@/components/feed/PostComposer';

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
  const { showToast } = useToast();

  const handleSubmitPost = async (content: string, imageUrls?: string[]) => {
    try {
      const newPost = await createPost(content, imageUrls);
      setPosts([newPost, ...posts]);
      showToast('success', 'Post published successfully');
    } catch (error) {
      showToast('error', 'Failed to publish post');
      throw error; // Re-throw to let composer handle it
    }
  };

  return (
    <div className="min-h-screen bg-bg-page">
      <PageHeader title="Feed" />

      {/* Feed Container */}
      <div className="max-w-2xl mx-auto border-x border-border-subtle bg-bg-page min-h-screen">
        {/* Info Banner for non-eligible users */}
        {!userEligible && (
          <div className="border-b border-border-subtle p-4">
            <Banner
              type="info"
              message="Want to post on the feed?"
              submessage="Get Blue Check verification to start posting"
              action={{
                label: 'Get Blue Check',
                onClick: () => (window.location.href = '/profile/blue-check'),
              }}
            />
          </div>
        )}

        {/* Post Composer */}
        {userEligible && (
          <div className="border-b-8 border-bg-page">
            <PostComposer
              userProfile={userProfile}
              isEligible={userEligible}
              onSubmit={handleSubmitPost}
            />
          </div>
        )}

        {/* Feed Posts */}
        {posts.length === 0 ? (
          <div className="p-8">
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
          </div>
        ) : (
          <div>
            {posts.map((post) => (
              <FeedPost
                key={post.id}
                post={post}
                currentUserId={userProfile?.id}
                onDelete={() => setPosts(posts.filter((p) => p.id !== post.id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

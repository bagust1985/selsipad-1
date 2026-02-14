'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type Post, type PostComment } from '@/lib/data/feed';
import { FeedPost } from '@/components/feed/FeedPost';
import { AnimatedBackground } from '@/components/home/figma/AnimatedBackground';
import { addComment } from '../../interactions';
import { BadgeCheck, Send, ArrowLeft } from 'lucide-react';

interface PostDetailClientProps {
  post: Post | null;
  initialComments: PostComment[];
  userProfile?: any;
  userEligible: boolean;
}

export default function PostDetailClient({
  post,
  initialComments,
  userProfile,
  userEligible,
}: PostDetailClientProps) {
  const router = useRouter();
  const [comments, setComments] = useState<PostComment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting || !post) return;

    setIsSubmitting(true);
    try {
      const comment = await addComment(post.id, newComment.trim());
      setComments([...comments, comment]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Post not found
  if (!post) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <AnimatedBackground />
        <div className="relative z-10 text-center">
          <h2 className="text-2xl font-bold mb-2">Post not found</h2>
          <p className="text-gray-400 mb-6">
            This post may have been deleted or doesn&apos;t exist.
          </p>
          <Link
            href="/feed"
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-all"
          >
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30 relative overflow-hidden font-twitter">
      <AnimatedBackground />
      <div className="fixed inset-0 bg-black/30 pointer-events-none z-[1]" />

      <div className="relative z-10">
        {/* Header — Twitter style */}
        <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/10">
          <div className="w-full max-w-4xl mx-auto px-4 h-14 flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white transition-colors p-1.5 -ml-1.5 rounded-full hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-white">Post</h1>
          </div>
        </div>

        {/* Main Thread */}
        <div className="w-full max-w-4xl mx-auto">
          {/* Original Post */}
          <div className="border-b border-white/10">
            <FeedPost
              post={post}
              currentUserId={userProfile?.id}
              onDelete={async () => {
                router.push('/feed');
              }}
            />
          </div>

          {/* Reply Composer — Twitter-style inline */}
          {userEligible && (
            <div className="border-b border-white/10 px-4 py-3">
              <div className="flex gap-3">
                {/* Avatar */}
                {userProfile?.avatar_url ? (
                  <img
                    src={userProfile.avatar_url}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-white/10 flex-shrink-0 mt-1"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center border border-white/10 flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-cyan-400">
                      {userProfile?.username?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}

                {/* Input */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-1">
                    Replying to <span className="text-cyan-400">@{post.author.username}</span>
                  </div>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Post your reply"
                    rows={1}
                    className="w-full bg-transparent text-base text-gray-200 placeholder-gray-600 resize-none focus:outline-none min-h-[44px]"
                    style={{ fieldSizing: 'content' } as any}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitComment();
                      }
                    }}
                  />
                  <div className="flex justify-end pt-2 border-t border-white/5">
                    <button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || isSubmitting}
                      className="px-5 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-bold disabled:opacity-40 disabled:hover:bg-cyan-500 transition-colors"
                    >
                      {isSubmitting ? 'Posting...' : 'Reply'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Comments / Replies — Twitter thread style */}
          <div className="pb-24">
            {comments.length === 0 ? (
              <div className="px-4 py-10 text-center border-b border-white/5">
                <p className="text-gray-600 text-sm">No replies yet</p>
              </div>
            ) : (
              comments.map((comment, index) => (
                <div
                  key={comment.id}
                  className="flex gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  {/* Thread line + Avatar */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    {comment.author?.avatar_url ? (
                      <img
                        src={comment.author.avatar_url}
                        alt={comment.author.username || ''}
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-white/10">
                        <span className="text-sm font-bold text-cyan-400">
                          {comment.author?.username?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Comment Content */}
                  <div className="flex-1 min-w-0">
                    {/* Author line */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-sm font-bold text-white truncate">
                        {comment.author?.username || 'Anonymous'}
                      </span>
                      {comment.author?.bluecheck && (
                        <BadgeCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      )}
                      <span className="text-sm text-gray-500">·</span>
                      <span className="text-sm text-gray-500">
                        {formatTimeAgo(comment.created_at)}
                      </span>
                    </div>

                    {/* Replying to indicator */}
                    <div className="text-xs text-gray-500 mb-0.5">
                      Replying to <span className="text-cyan-400">@{post.author.username}</span>
                    </div>

                    {/* Comment text */}
                    <p className="text-sm text-gray-200 whitespace-pre-wrap break-words leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

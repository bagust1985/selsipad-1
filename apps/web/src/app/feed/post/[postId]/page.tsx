'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BadgeCheck, Send } from 'lucide-react';
import {
  getPostById,
  getPostComments,
  createComment,
  type Post,
  type PostComment,
} from '@/lib/data/feed';
import { getUserProfile } from '@/lib/data/profile';
import { FeedPost } from '@/components/feed/FeedPost';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.postId as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [postId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [postData, commentsData, profile] = await Promise.all([
        getPostById(postId),
        getPostComments(postId),
        getUserProfile(),
      ]);

      setPost(postData);
      setComments(commentsData);
      if (profile) {
        setCurrentUserId(profile.id);
        setUserProfile(profile);
      }
    } catch (err) {
      console.error('Error loading post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const comment = await createComment(postId, newComment.trim());
      if (comment) {
        setComments([comment, ...comments]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-page pb-20">
        {/* Header Skeleton */}
        <div className="sticky top-0 z-30 backdrop-blur-xl bg-black/60 border-b border-[#39AEC4]/10">
          <div className="max-w-[680px] mx-auto flex items-center gap-3 px-4 h-14">
            <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
            <div className="h-5 w-32 rounded bg-white/5 animate-pulse" />
          </div>
        </div>
        <div className="max-w-[680px] mx-auto px-4 py-6 space-y-4">
          <div className="rounded-[20px] bg-white/5 h-48 animate-pulse" />
          <div className="rounded-[20px] bg-white/5 h-24 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-bg-page pb-20">
        <div className="sticky top-0 z-30 backdrop-blur-xl bg-black/60 border-b border-[#39AEC4]/10">
          <div className="max-w-[680px] mx-auto flex items-center gap-3 px-4 h-14">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-lg font-bold text-white">Post</h1>
          </div>
        </div>
        <div className="max-w-[680px] mx-auto px-4 py-20 text-center">
          <p className="text-gray-500 text-lg">Post not found</p>
          <Link href="/feed" className="text-[#39AEC4] hover:underline mt-2 inline-block">
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-page pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-black/60 border-b border-[#39AEC4]/10">
        <div className="max-w-[680px] mx-auto flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">Post</h1>
        </div>
      </div>

      <div className="max-w-[680px] mx-auto px-4 py-6">
        {/* Post Card */}
        <FeedPost post={post} currentUserId={currentUserId} onDelete={() => router.push('/feed')} />

        {/* Comment Composer */}
        <div className="mt-6 rounded-[20px] bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-[#39AEC4]/10 p-4">
          <div className="flex gap-3">
            {/* User Avatar */}
            <div className="flex-shrink-0">
              {userProfile?.avatar_url ? (
                <img
                  src={userProfile.avatar_url}
                  alt={userProfile.username || 'User'}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#39AEC4]/40"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#39AEC4]/30 to-[#756BBA]/30 border border-[#39AEC4]/40 flex items-center justify-center text-white font-semibold text-sm">
                  {userProfile?.username?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex-1">
              <textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full resize-none bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#39AEC4]/50 focus:border-[#39AEC4]/50 text-white placeholder:text-gray-500 text-sm"
                rows={2}
                maxLength={280}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">{newComment.length}/280</span>
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || submitting}
                  className="px-5 py-2 bg-gradient-to-r from-[#39AEC4] to-[#756BBA] text-white text-sm font-bold rounded-full hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-[#756BBA]/20"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Posting...' : 'Comment'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 px-1">
            Comments ({comments.length})
          </h2>

          {comments.length === 0 ? (
            <div className="rounded-[20px] bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-[#39AEC4]/10 p-8 text-center">
              <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-[16px] bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-[#39AEC4]/10 hover:border-[#39AEC4]/20 transition-all p-4"
                >
                  <div className="flex gap-3">
                    {/* Comment Author Avatar */}
                    <Link href={`/feed/profile/${comment.author.id}`} className="flex-shrink-0">
                      {comment.author.avatar_url ? (
                        <img
                          src={comment.author.avatar_url}
                          alt={comment.author.username}
                          className="w-9 h-9 rounded-full object-cover border-2 border-[#39AEC4]/30"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#39AEC4]/30 to-[#756BBA]/30 border border-[#39AEC4]/30 flex items-center justify-center text-white font-semibold text-xs">
                          {comment.author.username[0]?.toUpperCase()}
                        </div>
                      )}
                    </Link>

                    {/* Comment Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/feed/profile/${comment.author.id}`}
                          className="font-bold text-sm text-white hover:underline truncate"
                        >
                          {comment.author.username}
                        </Link>
                        {comment.author.bluecheck && (
                          <BadgeCheck className="w-4 h-4 text-[#39AEC4] flex-shrink-0" />
                        )}
                        <span className="text-gray-600 text-xs">·</span>
                        <span className="text-gray-500 text-xs flex-shrink-0">
                          {formatTimeAgo(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mt-1 break-words">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

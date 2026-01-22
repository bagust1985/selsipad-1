'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Repeat2, Heart, BarChart3, Share2, MoreHorizontal } from 'lucide-react';
import { LikeButton } from './LikeButton';
import { PostMenu } from './PostMenu';
import { UserBadges } from '@/components/badges/UserBadges';
import { CommentModal } from './CommentModal';

interface FeedPostProps {
  post: {
    id: string;
    content: string;
    created_at: string;
    author: {
      id: string;
      username: string;
      avatar_url?: string;
      bluecheck: boolean;
    };
    likes: number;
    is_liked: boolean;
    replies: number;
    project_id?: string;
    project_name?: string;
    type: 'POST' | 'REPLY' | 'QUOTE' | 'REPOST';
    view_count?: number;
    edit_count?: number;
    last_edited_at?: string;
  };
  currentUserId?: string;
  onDelete?: () => void;
}

export function FeedPost({ post, currentUserId, onDelete }: FeedPostProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [reposting, setReposting] = useState(false);
  const [reposted, setReposted] = useState(false);

  const isAuthor = currentUserId === post.author.id;

  // Prevent hydration mismatch for dates
  useEffect(() => {
    setMounted(true);
  }, []);

  // Track view on mount
  useEffect(() => {
    const trackView = async () => {
      try {
        const { trackView: track } = await import('../../../app/feed/interactions');
        await track(post.id);
      } catch (error) {
        // Silently fail
      }
    };
    trackView();
  }, [post.id]);

  const handleSaveEdit = async () => {
    if (!editContent.trim() || saving) return;

    setSaving(true);
    try {
      const { editPost } = await import('../../../app/feed/interactions');
      await editPost(post.id, editContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to edit post:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleRepost = async () => {
    if (reposting) return;

    if (reposted) {
      if (!confirm('Remove this repost?')) return;
      setReposting(true);
      try {
        const response = await fetch(`/api/feed/repost/${post.id}`, { method: 'DELETE' });
        if (response.ok) setReposted(false);
        else alert('Failed to remove repost');
      } catch (error) {
        alert('Failed to remove repost');
      } finally {
        setReposting(false);
      }
    } else {
      if (!confirm('Repost this to your followers?')) return;
      setReposting(true);
      try {
        const response = await fetch(`/api/feed/repost/${post.id}`, { method: 'POST' });
        if (response.ok) setReposted(true);
        else {
          const data = await response.json();
          alert(data.error || 'Failed to repost');
        }
      } catch (error) {
        alert('Failed to repost');
      } finally {
        setReposting(false);
      }
    }
  };

  // Format time ago (Twitter style)
  const getTimeAgo = () => {
    if (!mounted) return '';
    const now = new Date();
    const postDate = new Date(post.created_at);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;

    return postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format counts (1000 -> 1K, 1000000 -> 1M)
  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="bg-transparent border-b border-border-subtle p-4 hover:bg-bg-elevated/50 transition-colors cursor-pointer">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {post.author.avatar_url ? (
            <img
              src={post.author.avatar_url}
              alt={post.author.username}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
              {post.author.username[0]?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="font-bold text-text-primary hover:underline">
                {post.author.username}
              </span>
              {post.author.bluecheck && (
                <span className="text-blue-500" title="Verified">
                  ✓
                </span>
              )}
              <UserBadges userId={post.author.id} compact maxDisplay={3} />
              <span className="text-text-secondary">·</span>
              <span className="text-text-secondary text-sm">{getTimeAgo()}</span>
              {post.edit_count && post.edit_count > 0 && (
                <span className="text-text-secondary text-xs">(edited)</span>
              )}
            </div>
            <PostMenu
              postId={post.id}
              isAuthor={isAuthor}
              onEdit={() => setIsEditing(true)}
              onDelete={onDelete}
            />
          </div>

          {/* Post Content */}
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 bg-bg-elevated border border-border-subtle text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={saving || !editContent.trim()}
                  className="px-4 py-1.5 bg-blue-500 text-white text-sm font-semibold rounded-full hover:bg-blue-600 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(post.content);
                  }}
                  className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm font-semibold rounded-full hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-text-primary text-[15px] leading-normal whitespace-pre-wrap break-words">
              {post.content}
            </p>
          )}

          {/* Engagement Bar */}
          <div className="mt-3 flex items-center justify-between max-w-md">
            {/* Comments */}
            <button
              onClick={() => setCommentModalOpen(true)}
              className="flex items-center gap-2 text-text-secondary hover:text-primary-main transition-colors group"
            >
              <div className="p-2 rounded-full group-hover:bg-primary-main/10 transition-colors">
                <MessageCircle className="w-[18px] h-[18px]" />
              </div>
              <span className="text-sm">{post.replies > 0 ? formatCount(post.replies) : ''}</span>
            </button>

            {/* Repost */}
            <button
              onClick={handleRepost}
              disabled={reposting}
              className={`flex items-center gap-2 transition-colors group ${
                reposted ? 'text-green-500' : 'text-text-secondary hover:text-green-500'
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                <Repeat2 className="w-[18px] h-[18px]" />
              </div>
              <span className="text-sm">{reposting ? '...' : ''}</span>
            </button>

            {/* Like */}
            <LikeButton postId={post.id} initialLiked={post.is_liked} initialCount={post.likes} />

            {/* Views */}
            <button className="flex items-center gap-2 text-text-secondary hover:text-primary-main transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-primary-main/10 transition-colors">
                <BarChart3 className="w-[18px] h-[18px]" />
              </div>
              <span className="text-sm">
                {post.view_count && post.view_count > 0 ? formatCount(post.view_count) : ''}
              </span>
            </button>

            {/* Share */}
            <button className="p-2 text-text-secondary hover:text-primary-main rounded-full hover:bg-primary-main/10 transition-colors">
              <Share2 className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Comment Modal */}
      <CommentModal
        postId={post.id}
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
      />
    </div>
  );
}

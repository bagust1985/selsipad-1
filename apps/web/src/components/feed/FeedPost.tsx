'use client';

import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { LikeButton } from './LikeButton';
import { ReactionPicker } from './ReactionPicker';
import { CommentSection } from './CommentSection';
import { ShareButton } from './ShareButton';
import { PostMenu } from './PostMenu';

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

  const isAuthor = currentUserId === post.author.id;

  console.log('[FeedPost] Author check:', {
    postId: post.id,
    currentUserId,
    authorId: post.author.id,
    isAuthor,
  });

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
      // Optionally refresh post data
    } catch (error) {
      console.error('Failed to edit post:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{post.author.username}</span>
              {post.author.bluecheck && <span className="text-blue-500 text-lg">✓</span>}
              {post.project_name && (
                <span className="text-sm text-gray-600">→ {post.project_name}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              {post.edit_count && post.edit_count > 0 && <span className="text-xs">(edited)</span>}
            </div>
          </div>
        </div>
        <PostMenu
          postId={post.id}
          isAuthor={isAuthor}
          onEdit={() => setIsEditing(true)}
          onDelete={onDelete}
        />
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={saving || !editContent.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(post.content);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
      )}

      {/* Engagement Stats */}
      {post.view_count !== undefined && post.view_count > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Eye className="w-4 h-4" />
          <span>{post.view_count.toLocaleString()} views</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <LikeButton postId={post.id} initialLiked={post.is_liked} initialCount={post.likes} />
        <ReactionPicker postId={post.id} />
        <CommentSection postId={post.id} />
        <ShareButton postId={post.id} postContent={post.content} />
      </div>
    </div>
  );
}

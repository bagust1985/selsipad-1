'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Send } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  like_count: number;
  author: {
    id: string;
    username: string;
    avatar_url?: string;
    bluecheck: boolean;
  };
}

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments]);

  const loadComments = async () => {
    try {
      const { getComments } = await import('../../app/feed/interactions');
      const data = await getComments(postId);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || loading) return;

    setLoading(true);
    try {
      const { addComment } = await import('../../app/feed/interactions');
      const comment = await addComment(postId, newComment);
      setComments([...comments, comment]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => setShowComments(!showComments)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 transition-all"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-medium">{comments.length}</span>
      </button>

      {showComments && (
        <div className="space-y-3 pl-4 border-l-2 border-gray-200">
          {/* Comment List */}
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{comment.author.username}</span>
                    {comment.author.bluecheck && <span className="text-blue-500">✓</span>}
                    <span className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Comment Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

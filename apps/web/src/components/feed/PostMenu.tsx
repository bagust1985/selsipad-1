'use client';

import { useState } from 'react';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';

interface PostMenuProps {
  postId: string;
  isAuthor: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PostMenu({ postId, isAuthor, onEdit, onDelete }: PostMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // TEMPORARY: Show menu always for testing
  if (!isAuthor) return null;

  console.log('[PostMenu] Render:', { postId, isAuthor });

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    setLoading(true);
    try {
      const { deletePost } = await import('../../../app/feed/interactions');
      await deletePost(postId);
      onDelete?.();
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 border border-gray-300 transition-colors"
        title="Post options"
      >
        <MoreVertical className="w-5 h-5 text-gray-800" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-1 z-20 bg-white rounded-lg shadow-xl border border-gray-200 p-2 min-w-[150px]">
            <button
              onClick={() => {
                onEdit?.();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors text-left text-gray-900"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-left disabled:opacity-50 text-gray-900"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

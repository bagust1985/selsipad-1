'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function LikeButton({ postId, initialLiked, initialCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading) return;

    const previousLiked = liked;
    const previousCount = count;

    // Optimistic update
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);
    setLoading(true);

    try {
      const { toggleLike } = await import('../../../app/feed/interactions');
      const result = await toggleLike(postId);

      setLiked(result.liked);
      setCount(result.likeCount);
    } catch (error) {
      // Revert on error
      setLiked(previousLiked);
      setCount(previousCount);
      console.error('Failed to toggle like:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-full transition-all
        ${
          liked
            ? 'text-red-500 bg-red-50 hover:bg-red-100'
            : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <Heart className={`w-5 h-5 transition-transform ${liked ? 'fill-current scale-110' : ''}`} />
      <span className="text-sm font-medium">{count}</span>
    </button>
  );
}

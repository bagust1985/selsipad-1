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

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;

    const previousLiked = liked;
    const previousCount = count;

    // Optimistic update
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);
    setLoading(true);

    try {
      const { toggleLike } = await import('../../app/feed/interactions');
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

  // Format counts (1000 -> 1K, 1000000 -> 1M)
  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`group/like flex items-center gap-1.5 transition-colors ${loading ? 'opacity-50' : ''} ${liked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'}`}
    >
      <div
        className={`p-2 rounded-full transition-colors ${
          liked ? 'bg-pink-500/10' : 'group-hover/like:bg-pink-500/10'
        }`}
      >
        <Heart
          className={`w-[18px] h-[18px] transition-transform ${liked ? 'fill-current scale-110' : 'group-hover/like:scale-110'}`}
        />
      </div>
      <span className="text-sm font-medium">{count > 0 ? formatCount(count) : ''}</span>
    </button>
  );
}

'use client';

import { useState } from 'react';
import { followUser, unfollowUser } from '@/app/profile/follow/actions';

interface FollowButtonProps {
  targetUserId: string;
  isFollowable: boolean;
  initialFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export function FollowButton({
  targetUserId,
  isFollowable,
  initialFollowing,
  onFollowChange,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!isFollowable || loading) return;

    setLoading(true);
    try {
      if (isFollowing) {
        const result = await unfollowUser(targetUserId);
        if (result.success) {
          setIsFollowing(false);
          onFollowChange?.(false);
        } else {
          console.error('Failed to unfollow:', result.error);
          // You might want to show a toast here
        }
      } else {
        const result = await followUser(targetUserId);
        if (result.success) {
          setIsFollowing(true);
          onFollowChange?.(true);
        } else {
          console.error('Failed to follow:', result.error);
          // You might want to show a toast here
        }
      }
    } catch (error) {
      console.error('Error in follow/unfollow:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isFollowable) {
    return (
      <button
        disabled
        className="px-4 py-2 text-sm font-medium border border-border-subtle rounded-md bg-bg-subtle text-text-tertiary cursor-not-allowed opacity-50"
        title="User must have at least one active badge to be followed"
      >
        Follow
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`px-4 py-2 text-sm font-medium border rounded-md transition-colors ${
        isFollowing
          ? 'border-border-subtle bg-bg-page text-text-primary hover:bg-bg-elevated hover:border-primary-main'
          : 'border-primary-main bg-primary-main text-primary-text hover:bg-primary-hover'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}

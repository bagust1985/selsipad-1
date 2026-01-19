'use client';

import { useState, useEffect } from 'react';
import { BadgeDisplay } from './BadgeDisplay';

interface UserBadgesProps {
  userId: string;
  compact?: boolean;
  maxDisplay?: number;
}

interface Badge {
  key: string;
  display_name: string;
  icon_url?: string;
  category?: string;
}

export function UserBadges({ userId, compact = true, maxDisplay = 3 }: UserBadgesProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const response = await fetch(`/api/badges/${userId}?limit=${maxDisplay}`);
        if (response.ok) {
          const data = await response.json();
          setBadges(data.badges || []);
        }
      } catch (error) {
        console.error('Failed to fetch badges:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [userId, maxDisplay]);

  if (loading || badges.length === 0) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1">
      {badges.map((badge) => (
        <BadgeDisplay key={badge.key} badge={badge} size={compact ? 'sm' : 'md'} />
      ))}
    </span>
  );
}

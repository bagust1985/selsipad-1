'use client';

interface BadgeDisplayProps {
  badge: {
    key: string;
    display_name: string;
    icon_url?: string;
    category?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const BADGE_EMOJI_MAP: Record<string, string> = {
  BLUE_CHECK: '✓',
  KYC_VERIFIED: '📋',
  DEV_KYC_VERIFIED: '🔐',
  REFERRAL_PRO: '👥',
  WHALE: '🐋',
  INFLUENCER: '⭐',
  TEAM_ADMIN: '👑',
  TEAM_MOD: '🛡️',
  TEAM_IT_PROGRAMMER: '💻',
  TEAM_CEO: '🎯',
  TEAM_MARKETING: '📢',
  EARLY_ADOPTER: '🌟',
  ACTIVE_CONTRIBUTOR: '🚀',
  DIAMOND_HANDS: '💎',
  EARLY_BIRD: '🐦',
  SC_AUDIT_PASSED: '✅',
  SC_AUDIT_PASS: '✅',
  FIRST_PROJECT: '🎉',
  TRENDING_PROJECT: '📈',
  VERIFIED_TEAM: '👥',
};

export function BadgeDisplay({ badge, size = 'md', showTooltip = true }: BadgeDisplayProps) {
  const emoji = BADGE_EMOJI_MAP[badge.key] || '🏅';

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <span
      className={`inline-flex items-center ${sizeClasses[size]}`}
      title={showTooltip ? badge.display_name : undefined}
      aria-label={badge.display_name}
    >
      {emoji}
    </span>
  );
}

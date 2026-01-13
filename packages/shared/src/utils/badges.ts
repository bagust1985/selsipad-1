/**
 * FASE 3: Badge Utilities
 * Helper functions for working with badges
 */

import type { BadgeDefinition, ProjectBadge, BadgeType } from '../types/fase3';
import { BADGE_KEYS } from '../types/fase3';

// ============================================
// Badge Constants
// ============================================

export const BADGE_TYPE_LABELS: Record<BadgeType, string> = {
  KYC: 'KYC Verification',
  SECURITY: 'Security Audit',
  MILESTONE: 'Milestone Achievement',
  SPECIAL: 'Special Recognition',
};

export const BADGE_TYPE_COLORS: Record<BadgeType, string> = {
  KYC: 'blue',
  SECURITY: 'green',
  MILESTONE: 'purple',
  SPECIAL: 'gold',
};

// ============================================
// Badge Retrieval
// ============================================

/**
 * Find a badge definition by its unique key
 */
export function getBadgeByKey(
  badges: BadgeDefinition[],
  badgeKey: string
): BadgeDefinition | undefined {
  return badges.find((badge) => badge.badge_key === badgeKey);
}

/**
 * Get all badges of a specific type
 */
export function getBadgesByType(
  badges: BadgeDefinition[],
  badgeType: BadgeType
): BadgeDefinition[] {
  return badges.filter((badge) => badge.badge_type === badgeType);
}

/**
 * Check if a badge key is a well-known system badge
 */
export function isSystemBadge(badgeKey: string): boolean {
  return Object.values(BADGE_KEYS).includes(
    badgeKey as (typeof BADGE_KEYS)[keyof typeof BADGE_KEYS]
  );
}

// ============================================
// Badge Formatting
// ============================================

/**
 * Format a list of project badges for display
 */
export function formatBadgesList(
  projectBadges: Array<ProjectBadge & { badge_definitions?: BadgeDefinition }>
): Array<{
  key: string;
  name: string;
  type: BadgeType;
  awardedAt: string;
  isAutoAwarded: boolean;
  reason?: string;
}> {
  return projectBadges.map((pb) => ({
    key: pb.badge_definitions?.badge_key || 'unknown',
    name: pb.badge_definitions?.name || 'Unknown Badge',
    type: pb.badge_definitions?.badge_type || 'SPECIAL',
    awardedAt: pb.awarded_at,
    isAutoAwarded: pb.awarded_by === null,
    reason: pb.reason || undefined,
  }));
}

/**
 * Group badges by type
 */
export function groupBadgesByType(badges: BadgeDefinition[]): Record<BadgeType, BadgeDefinition[]> {
  const grouped: Record<BadgeType, BadgeDefinition[]> = {
    KYC: [],
    SECURITY: [],
    MILESTONE: [],
    SPECIAL: [],
  };

  badges.forEach((badge) => {
    grouped[badge.badge_type].push(badge);
  });

  return grouped;
}

// ============================================
// Badge Status Checking
// ============================================

/**
 * Check if a project has a specific badge
 */
export function hasProjectBadge(
  projectBadges: Array<ProjectBadge & { badge_definitions?: BadgeDefinition }>,
  badgeKey: string
): boolean {
  return projectBadges.some((pb) => pb.badge_definitions?.badge_key === badgeKey);
}

/**
 * Get badge completion percentage for a project
 * (based on automatic badges only)
 */
export function getBadgeCompletionPercentage(
  projectBadges: Array<ProjectBadge & { badge_definitions?: BadgeDefinition }>
): number {
  const autoBadges = [
    BADGE_KEYS.KYC_VERIFIED,
    BADGE_KEYS.SC_AUDIT_PASSED,
    BADGE_KEYS.FIRST_PROJECT,
  ];

  const earned = autoBadges.filter((key) =>
    projectBadges.some((pb) => pb.badge_definitions?.badge_key === key)
  ).length;

  return Math.round((earned / autoBadges.length) * 100);
}

/**
 * Get missing automatic badges for a project
 */
export function getMissingAutoBadges(
  projectBadges: Array<ProjectBadge & { badge_definitions?: BadgeDefinition }>
): string[] {
  const autoBadges = [
    BADGE_KEYS.KYC_VERIFIED,
    BADGE_KEYS.SC_AUDIT_PASSED,
    BADGE_KEYS.FIRST_PROJECT,
  ];

  return autoBadges.filter(
    (key) => !projectBadges.some((pb) => pb.badge_definitions?.badge_key === key)
  );
}

// ============================================
// Badge Display Helpers
// ============================================

/**
 * Generate badge icon URL with fallback
 */
export function getBadgeIconUrl(
  badge: BadgeDefinition,
  fallbackIcon = '/badges/default.svg'
): string {
  return badge.icon_url || fallbackIcon;
}

/**
 * Generate badge display name with emoji prefix based on type
 */
export function getBadgeDisplayName(badge: BadgeDefinition): string {
  const emojis: Record<BadgeType, string> = {
    KYC: '✓',
    SECURITY: '🛡️',
    MILESTONE: '🏆',
    SPECIAL: '⭐',
  };

  const emoji = emojis[badge.badge_type] ?? '';
  return `${emoji} ${badge.name}`;
}

/**
 * Sort badges by priority (KYC > Security > Milestone > Special)
 */
export function sortBadgesByPriority(badges: BadgeDefinition[]): BadgeDefinition[] {
  const priority: Record<BadgeType, number> = {
    KYC: 1,
    SECURITY: 2,
    MILESTONE: 3,
    SPECIAL: 4,
  };

  return [...badges].sort((a, b) => {
    const priorityDiff = priority[a.badge_type] - priority[b.badge_type];
    if (priorityDiff !== 0) return priorityDiff;
    return a.name.localeCompare(b.name);
  });
}

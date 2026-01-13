/**
 * FASE 6: Referral Utilities
 * Helper functions for referral reward calculation and validation
 */

import type { ReferralLedger, ClaimEligibility } from '../types/fase6';

// ============================================================================
// REFERRAL REWARD CALCULATION
// ============================================================================

/**
 * Calculate total claimable rewards by chain/asset
 */
export function calculateClaimableRewards(
  ledgerEntries: ReferralLedger[]
): Map<string, Map<string, bigint>> {
  const rewardsByChain = new Map<string, Map<string, bigint>>();

  for (const entry of ledgerEntries) {
    if (entry.status !== 'CLAIMABLE') continue;

    if (!rewardsByChain.has(entry.chain)) {
      rewardsByChain.set(entry.chain, new Map());
    }

    const assetMap = rewardsByChain.get(entry.chain)!;
    const currentAmount = assetMap.get(entry.asset) || 0n;
    assetMap.set(entry.asset, currentAmount + BigInt(entry.amount));
  }

  return rewardsByChain;
}

/**
 * Get claimable rewards for specific chain/asset
 */
export function getClaimableForChainAsset(
  ledgerEntries: ReferralLedger[],
  chain: string,
  asset: string
): {
  total_amount: bigint;
  entry_ids: string[];
} {
  const entries = ledgerEntries.filter(
    (entry) => entry.status === 'CLAIMABLE' && entry.chain === chain && entry.asset === asset
  );

  const totalAmount = entries.reduce((sum, entry) => sum + BigInt(entry.amount), 0n);

  return {
    total_amount: totalAmount,
    entry_ids: entries.map((e) => e.id),
  };
}

/**
 * Check if user has claimable rewards
 */
export function hasClaimableRewards(ledgerEntries: ReferralLedger[]): boolean {
  return ledgerEntries.some((entry) => entry.status === 'CLAIMABLE');
}

/**
 * Get total earned rewards (all statuses)
 */
export function calculateTotalEarned(ledgerEntries: ReferralLedger[]): bigint {
  return ledgerEntries.reduce((sum, entry) => sum + BigInt(entry.amount), 0n);
}

/**
 * Get total claimed rewards
 */
export function calculateTotalClaimed(ledgerEntries: ReferralLedger[]): bigint {
  return ledgerEntries
    .filter((entry) => entry.status === 'CLAIMED')
    .reduce((sum, entry) => sum + BigInt(entry.amount), 0n);
}

// ============================================================================
// REFERRAL ACTIVATION VALIDATION
// ============================================================================

/**
 * Check if referral is activated
 */
export function isReferralActivated(activatedAt: string | null): boolean {
  return activatedAt !== null;
}

/**
 * Calculate activation rate
 */
export function calculateActivationRate(totalReferrals: number, activeReferrals: number): number {
  if (totalReferrals === 0) return 0;
  return (activeReferrals / totalReferrals) * 100;
}

// ============================================================================
// CLAIM ELIGIBILITY
// ============================================================================

/**
 * Check full claim eligibility
 * CRITICAL: Blue Check ACTIVE + active_referral_count >= 1
 */
export function checkClaimEligibility(
  bluecheckStatus: string | null,
  activeReferralCount: number,
  ledgerEntries: ReferralLedger[]
): ClaimEligibility {
  const reasons: string[] = [];
  const isBluecheck = bluecheckStatus === 'ACTIVE';
  const hasActiveReferrals = activeReferralCount >= 1;
  const hasClaimable = hasClaimableRewards(ledgerEntries);

  if (!isBluecheck) {
    reasons.push('You must have an active Blue Check to claim rewards');
  }

  if (!hasActiveReferrals) {
    reasons.push('You must have at least 1 active referral to claim rewards');
  }

  if (!hasClaimable) {
    reasons.push('You have no claimable rewards');
  }

  return {
    can_claim: reasons.length === 0,
    reasons,
    checks: {
      is_bluecheck: isBluecheck,
      has_active_referrals: hasActiveReferrals,
      has_claimable_rewards: hasClaimable,
    },
  };
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Calculate referral statistics
 */
export function calculateReferralStatistics(
  totalReferrals: number,
  activeReferrals: number,
  ledgerEntries: ReferralLedger[]
): {
  total_referrals: number;
  active_referrals: number;
  activation_rate: number;
  total_earned: string;
  total_claimed: string;
  total_claimable: string;
} {
  const totalEarned = calculateTotalEarned(ledgerEntries);
  const totalClaimed = calculateTotalClaimed(ledgerEntries);
  const claimableEntries = ledgerEntries.filter((e) => e.status === 'CLAIMABLE');
  const totalClaimable = claimableEntries.reduce((sum, e) => sum + BigInt(e.amount), 0n);

  return {
    total_referrals: totalReferrals,
    active_referrals: activeReferrals,
    activation_rate: calculateActivationRate(totalReferrals, activeReferrals),
    total_earned: totalEarned.toString(),
    total_claimed: totalClaimed.toString(),
    total_claimable: totalClaimable.toString(),
  };
}

/**
 * FASE 5: Vesting Utilities
 * Server-side source of truth for claimable calculations
 */

import type {
  VestingSchedule,
  VestingAllocation,
  ClaimableCalculation,
  VestingTimeline,
  VestingIntervalType,
} from '../types/fase5';

// ============================================================================
// CLAIMABLE CALCULATION (SERVER-SIDE SOURCE OF TRUTH)
// ============================================================================

/**
 * Calculate claimable tokens for a user allocation
 * CRITICAL: This is the server-side source of truth
 *
 * Formula:
 * - TGE unlock: allocation * tge_percentage / 100
 * - Cliff unlock: 0 (unlocks after cliff period)
 * - Vested unlock: Linear based on time elapsed since cliff end
 * - Total claimable: TGE + cliff + vested - already_claimed
 */
export function calculateClaimable(
  schedule: VestingSchedule,
  allocation: VestingAllocation,
  currentTime: Date = new Date()
): ClaimableCalculation {
  const tgeDate = new Date(schedule.tge_at);
  const allocationTokens = BigInt(allocation.allocation_tokens);
  const claimedTokens = BigInt(allocation.claimed_tokens);

  // Check if TGE has occurred
  const isTgeReached = currentTime >= tgeDate;

  // 1. TGE Unlock (immediate, but only after TGE timestamp)
  const tgeUnlocked = isTgeReached
    ? (allocationTokens * BigInt(schedule.tge_percentage)) / 100n
    : 0n;

  // 2. Cliff period check
  const cliffEndDate = new Date(tgeDate);
  cliffEndDate.setMonth(cliffEndDate.getMonth() + schedule.cliff_months);

  const isCliffPassed = currentTime >= cliffEndDate;

  // 3. Vesting calculation (only after cliff)
  let vestedUnlocked = 0n;

  if (isCliffPassed && schedule.vesting_months > 0) {
    const vestingStartDate = cliffEndDate;
    const vestingEndDate = new Date(vestingStartDate);
    vestingEndDate.setMonth(vestingEndDate.getMonth() + schedule.vesting_months);

    // Total amount to vest (100% - TGE%)
    const totalToVest = allocationTokens - tgeUnlocked;

    if (currentTime >= vestingEndDate) {
      // Fully vested
      vestedUnlocked = totalToVest;
    } else if (currentTime > vestingStartDate) {
      // Partially vested - calculate based on interval
      vestedUnlocked = calculateVestedAmount(
        totalToVest,
        vestingStartDate,
        vestingEndDate,
        currentTime,
        schedule.interval_type
      );
    }
  }

  // 4. Cliff unlock (all remaining tokens unlock after cliff if no vesting)
  let cliffUnlocked = 0n;
  if (isCliffPassed && schedule.vesting_months === 0) {
    cliffUnlocked = allocationTokens - tgeUnlocked;
  }

  // 5. Total claimable
  const totalClaimable = tgeUnlocked + cliffUnlocked + vestedUnlocked;
  const availableNow = totalClaimable > claimedTokens ? totalClaimable - claimedTokens : 0n;

  // 6. Next claim date
  const vestingEndDate =
    schedule.vesting_months > 0 && isCliffPassed
      ? new Date(cliffEndDate.getTime() + schedule.vesting_months * 30.44 * 24 * 60 * 60 * 1000)
      : undefined;

  const nextClaimDate = calculateNextClaimDate(
    schedule,
    vestingEndDate || cliffEndDate,
    currentTime
  );

  return {
    total_allocated: allocationTokens.toString(),
    tge_unlocked: tgeUnlocked.toString(),
    cliff_unlocked: cliffUnlocked.toString(),
    vested_unlocked: vestedUnlocked.toString(),
    total_claimable: totalClaimable.toString(),
    already_claimed: claimedTokens.toString(),
    available_now: availableNow.toString(),
    calculation_time: currentTime.toISOString(),
    next_claim_date: nextClaimDate?.toISOString(),
    is_cliff_passed: isCliffPassed,
  };
}

/**
 * Calculate vested amount based on interval type
 * Handles daily and monthly intervals with proper rounding
 */
function calculateVestedAmount(
  totalToVest: bigint,
  vestingStartDate: Date,
  vestingEndDate: Date,
  currentTime: Date,
  intervalType: VestingIntervalType
): bigint {
  const totalDuration = vestingEndDate.getTime() - vestingStartDate.getTime();
  const elapsed = currentTime.getTime() - vestingStartDate.getTime();

  if (intervalType === 'DAILY') {
    // Daily unlock - linear from start to end
    const vestedPercentage = BigInt(Math.floor((elapsed / totalDuration) * 10000)); // 2 decimal precision
    return (totalToVest * vestedPercentage) / 10000n;
  } else {
    // Monthly unlock - unlock at month boundaries
    const totalMonths = Math.round(totalDuration / (30.44 * 24 * 60 * 60 * 1000)); // Average month
    const elapsedMonths = Math.floor(elapsed / (30.44 * 24 * 60 * 60 * 1000));

    const completedMonths = Math.min(elapsedMonths, totalMonths);
    return (totalToVest * BigInt(completedMonths)) / BigInt(totalMonths);
  }
}

/**
 * Calculate next claim date based on interval
 */
function calculateNextClaimDate(
  schedule: VestingSchedule,
  vestingEndDate: Date,
  currentTime: Date
): Date | undefined {
  if (currentTime >= vestingEndDate) {
    return undefined; // Fully vested, no next unlock
  }

  const tgeDate = new Date(schedule.tge_at);
  const cliffEndDate = new Date(tgeDate);
  cliffEndDate.setMonth(cliffEndDate.getMonth() + schedule.cliff_months);

  if (currentTime < tgeDate) {
    return tgeDate; // TGE is next
  }

  if (currentTime < cliffEndDate) {
    return cliffEndDate; // Cliff end is next
  }

  if (schedule.vesting_months === 0) {
    return undefined; // No vesting, everything unlocked after cliff
  }

  // Calculate next unlock based on interval
  if (schedule.interval_type === 'DAILY') {
    const next = new Date(currentTime);
    next.setDate(next.getDate() + 1);
    return next;
  } else {
    // Monthly - next month boundary
    const next = new Date(currentTime);
    next.setMonth(next.getMonth() + 1);
    next.setDate(1); // First of month
    return next;
  }
}

// ============================================================================
// VESTING TIMELINE
// ============================================================================

/**
 * Generate vesting timeline for UI display
 */
export function getVestingTimeline(
  schedule: VestingSchedule,
  currentTime: Date = new Date()
): VestingTimeline {
  const tgeDate = new Date(schedule.tge_at);

  const cliffEndDate =
    schedule.cliff_months > 0
      ? new Date(tgeDate.getTime() + schedule.cliff_months * 30.44 * 24 * 60 * 60 * 1000)
      : undefined;

  const vestingEndDate =
    schedule.vesting_months > 0 && cliffEndDate
      ? new Date(cliffEndDate.getTime() + schedule.vesting_months * 30.44 * 24 * 60 * 60 * 1000)
      : cliffEndDate;

  const daysSinceTge = Math.floor(
    (currentTime.getTime() - tgeDate.getTime()) / (24 * 60 * 60 * 1000)
  );

  const daysUntilFullyVested = vestingEndDate
    ? Math.max(
        0,
        Math.ceil((vestingEndDate.getTime() - currentTime.getTime()) / (24 * 60 * 60 * 1000))
      )
    : 0;

  // Calculate percent vested
  let percentVested = schedule.tge_percentage;
  if (vestingEndDate && currentTime > tgeDate) {
    const totalDuration = vestingEndDate.getTime() - tgeDate.getTime();
    const elapsed = Math.min(currentTime.getTime() - tgeDate.getTime(), totalDuration);
    const vestingProgress = (elapsed / totalDuration) * (100 - schedule.tge_percentage);
    percentVested = Math.min(100, schedule.tge_percentage + Math.floor(vestingProgress));
  }

  return {
    tge_date: tgeDate.toISOString(),
    cliff_end_date: cliffEndDate?.toISOString(),
    vesting_end_date: vestingEndDate?.toISOString(),
    next_unlock_date: calculateNextClaimDate(
      schedule,
      vestingEndDate || tgeDate,
      currentTime
    )?.toISOString(),
    days_since_tge: daysSinceTge,
    days_until_fully_vested: daysUntilFullyVested > 0 ? daysUntilFullyVested : undefined,
    percent_vested: percentVested,
  };
}

// ============================================================================
// CLIFF CHECKING
// ============================================================================

/**
 * Check if cliff period has passed
 */
export function isCliffPassed(schedule: VestingSchedule, currentTime: Date = new Date()): boolean {
  if (schedule.cliff_months === 0) {
    return true; // No cliff
  }

  const tgeDate = new Date(schedule.tge_at);
  const cliffEndDate = new Date(tgeDate);
  cliffEndDate.setMonth(cliffEndDate.getMonth() + schedule.cliff_months);

  return currentTime >= cliffEndDate;
}

/**
 * Get remaining cliff time in days
 */
export function getCliffRemainingDays(
  schedule: VestingSchedule,
  currentTime: Date = new Date()
): number | null {
  if (schedule.cliff_months === 0) {
    return null; // No cliff
  }

  if (isCliffPassed(schedule, currentTime)) {
    return 0; // Cliff already passed
  }

  const tgeDate = new Date(schedule.tge_at);
  const cliffEndDate = new Date(tgeDate);
  cliffEndDate.setMonth(cliffEndDate.getMonth() + schedule.cliff_months);

  const remainingMs = cliffEndDate.getTime() - currentTime.getTime();
  return Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
}

// ============================================================================
// SCHEDULE GENERATION
// ============================================================================

/**
 * Generate vesting schedule from round finalization
 * Defaults TGE to round's finalized_at timestamp
 */
export function generateVestingSchedule(
  roundId: string,
  finalizedAt: Date,
  params: {
    tge_percentage: number;
    cliff_months: number;
    vesting_months: number;
    interval_type: VestingIntervalType;
    token_address: string;
    chain: string;
    total_tokens: string;
    tge_at?: Date; // Optional override
  }
): Omit<VestingSchedule, 'id' | 'created_at' | 'updated_at'> {
  return {
    round_id: roundId,
    token_address: params.token_address,
    chain: params.chain,
    total_tokens: params.total_tokens,
    tge_percentage: params.tge_percentage,
    tge_at: (params.tge_at || finalizedAt).toISOString(),
    cliff_months: params.cliff_months,
    vesting_months: params.vesting_months,
    interval_type: params.interval_type,
    status: 'PENDING',
  };
}

// ============================================================================
// ELIGIBILITY CHECKS
// ============================================================================

/**
 * Check if user can claim now
 */
export function canClaimNow(
  schedule: VestingSchedule,
  allocation: VestingAllocation,
  currentTime: Date = new Date()
): { can_claim: boolean; reason?: string } {
  // Check schedule status
  if (schedule.status === 'PAUSED') {
    return { can_claim: false, reason: 'Vesting is currently paused' };
  }

  if (schedule.status !== 'CONFIRMED') {
    return { can_claim: false, reason: 'Vesting schedule not confirmed' };
  }

  // Check if TGE has occurred
  const tgeDate = new Date(schedule.tge_at);
  if (currentTime < tgeDate) {
    return { can_claim: false, reason: 'TGE has not occurred yet' };
  }

  // Calculate claimable
  const claimable = calculateClaimable(schedule, allocation, currentTime);
  const availableNow = BigInt(claimable.available_now);

  if (availableNow <= 0n) {
    if (!isCliffPassed(schedule, currentTime)) {
      const daysRemaining = getCliffRemainingDays(schedule, currentTime);
      return {
        can_claim: false,
        reason: `Cliff period active (${daysRemaining} days remaining)`,
      };
    }

    return { can_claim: false, reason: 'No tokens available to claim' };
  }

  return { can_claim: true };
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Calculate vesting statistics for analytics
 */
export function calculateVestingStatistics(
  allocations: VestingAllocation[],
  schedule: VestingSchedule,
  currentTime: Date = new Date()
): {
  total_allocated: string;
  total_claimed: string;
  total_claimable_now: string;
  percent_claimed: number;
  percent_vested: number;
} {
  let totalAllocated = 0n;
  let totalClaimed = 0n;
  let totalClaimableNow = 0n;

  for (const allocation of allocations) {
    totalAllocated += BigInt(allocation.allocation_tokens);
    totalClaimed += BigInt(allocation.claimed_tokens);

    const claimable = calculateClaimable(schedule, allocation, currentTime);
    totalClaimableNow += BigInt(claimable.available_now);
  }

  const percentClaimed =
    totalAllocated > 0n ? Number((totalClaimed * 10000n) / totalAllocated) / 100 : 0;

  const timeline = getVestingTimeline(schedule, currentTime);

  return {
    total_allocated: totalAllocated.toString(),
    total_claimed: totalClaimed.toString(),
    total_claimable_now: totalClaimableNow.toString(),
    percent_claimed: percentClaimed,
    percent_vested: timeline.percent_vested,
  };
}

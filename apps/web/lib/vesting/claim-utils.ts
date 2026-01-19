/**
 * Vesting Claim Utilities
 * Server-side calculation for claimable vesting amounts
 */

import { addMonths, differenceInDays, differenceInMonths } from 'date-fns';

export interface VestingSchedule {
  id: string;
  round_id: string;
  token_address: string;
  chain: string;
  total_tokens: string; // BigInt as string
  tge_percentage: number; // 0-100
  tge_at: string; // ISO timestamp
  cliff_months: number;
  vesting_months: number;
  interval_type: 'DAILY' | 'MONTHLY';
  status: string;
}

export interface VestingAllocation {
  id: string;
  schedule_id: string;
  round_id: string;
  user_id: string;
  allocation_tokens: string; // BigInt as string
  claimed_tokens: string; // BigInt as string
  last_claim_at: string | null;
  total_claims: number;
}

export interface ClaimableResult {
  claimable: bigint;
  claimableFormatted: string;
  nextUnlock: {
    amount: bigint;
    amountFormatted: string;
    unlockAt: Date | null;
    daysUntil: number | null;
  } | null;
  vestingProgress: {
    total: bigint;
    claimed: bigint;
    unlocked: bigint;
    locked: bigint;
    percentUnlocked: number;
  };
}

/**
 * Calculate claimable amount for a vesting allocation
 */
export function calculateClaimableAmount(
  allocation: VestingAllocation,
  schedule: VestingSchedule
): ClaimableResult {
  const now = new Date();
  const tgeTime = new Date(schedule.tge_at);

  const totalTokens = BigInt(allocation.allocation_tokens);
  const claimedTokens = BigInt(allocation.claimed_tokens);

  // Before TGE: Nothing unlocked
  if (now < tgeTime) {
    return {
      claimable: 0n,
      claimableFormatted: '0',
      nextUnlock: {
        amount: (totalTokens * BigInt(schedule.tge_percentage)) / 100n,
        amountFormatted: formatBigInt((totalTokens * BigInt(schedule.tge_percentage)) / 100n),
        unlockAt: tgeTime,
        daysUntil: differenceInDays(tgeTime, now),
      },
      vestingProgress: {
        total: totalTokens,
        claimed: claimedTokens,
        unlocked: 0n,
        locked: totalTokens,
        percentUnlocked: 0,
      },
    };
  }

  // TGE unlock amount
  const tgeAmount = (totalTokens * BigInt(schedule.tge_percentage)) / 100n;
  let unlockedAmount = tgeAmount;

  // Calculate cliff end time
  const cliffEnd = addMonths(tgeTime, schedule.cliff_months);

  // After cliff: Calculate linear vesting
  if (now >= cliffEnd) {
    const vestingEnd = addMonths(cliffEnd, schedule.vesting_months);
    const vestingTotal = totalTokens - tgeAmount;

    if (now >= vestingEnd) {
      // All tokens vested
      unlockedAmount = totalTokens;
    } else {
      // Linear vesting in progress
      if (schedule.interval_type === 'DAILY') {
        const elapsedDays = differenceInDays(now, cliffEnd);
        const totalDays = differenceInDays(vestingEnd, cliffEnd);
        const vestedAmount = (vestingTotal * BigInt(elapsedDays)) / BigInt(totalDays);
        unlockedAmount = tgeAmount + vestedAmount;
      } else {
        // MONTHLY
        const elapsedMonths = differenceInMonths(now, cliffEnd);
        const totalMonths = schedule.vesting_months;
        const vestedAmount = (vestingTotal * BigInt(elapsedMonths)) / BigInt(totalMonths);
        unlockedAmount = tgeAmount + vestedAmount;
      }
    }
  }

  // Claimable = unlocked - already claimed
  const claimable = unlockedAmount > claimedTokens ? unlockedAmount - claimedTokens : 0n;

  // Calculate next unlock
  const nextUnlock = calculateNextUnlock(allocation, schedule, now, unlockedAmount, totalTokens);

  const percentUnlocked =
    totalTokens > 0n ? Number((unlockedAmount * 10000n) / totalTokens) / 100 : 0;

  return {
    claimable,
    claimableFormatted: formatBigInt(claimable),
    nextUnlock,
    vestingProgress: {
      total: totalTokens,
      claimed: claimedTokens,
      unlocked: unlockedAmount,
      locked: totalTokens - unlockedAmount,
      percentUnlocked,
    },
  };
}

/**
 * Calculate when and how much will unlock next
 */
function calculateNextUnlock(
  allocation: VestingAllocation,
  schedule: VestingSchedule,
  now: Date,
  currentUnlocked: bigint,
  totalTokens: bigint
): ClaimableResult['nextUnlock'] {
  // If fully vested, no next unlock
  if (currentUnlocked >= totalTokens) {
    return null;
  }

  const tgeTime = new Date(schedule.tge_at);
  const cliffEnd = addMonths(tgeTime, schedule.cliff_months);
  const vestingEnd = addMonths(cliffEnd, schedule.vesting_months);

  // If before TGE, next unlock is TGE
  if (now < tgeTime) {
    const tgeAmount = (totalTokens * BigInt(schedule.tge_percentage)) / 100n;
    return {
      amount: tgeAmount,
      amountFormatted: formatBigInt(tgeAmount),
      unlockAt: tgeTime,
      daysUntil: differenceInDays(tgeTime, now),
    };
  }

  // If during cliff, next unlock is cliff end
  if (now < cliffEnd) {
    // First vesting unlock at cliff end
    const tgeAmount = (totalTokens * BigInt(schedule.tge_percentage)) / 100n;
    const vestingTotal = totalTokens - tgeAmount;
    const firstVestingAmount =
      schedule.interval_type === 'DAILY'
        ? vestingTotal / BigInt(differenceInDays(vestingEnd, cliffEnd))
        : vestingTotal / BigInt(schedule.vesting_months);

    return {
      amount: firstVestingAmount,
      amountFormatted: formatBigInt(firstVestingAmount),
      unlockAt: cliffEnd,
      daysUntil: differenceInDays(cliffEnd, now),
    };
  }

  // During vesting period
  if (now < vestingEnd) {
    const tgeAmount = (totalTokens * BigInt(schedule.tge_percentage)) / 100n;
    const vestingTotal = totalTokens - tgeAmount;

    if (schedule.interval_type === 'DAILY') {
      // Next daily unlock is tomorrow
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const perDayAmount = vestingTotal / BigInt(differenceInDays(vestingEnd, cliffEnd));

      return {
        amount: perDayAmount,
        amountFormatted: formatBigInt(perDayAmount),
        unlockAt: tomorrow,
        daysUntil: 1,
      };
    } else {
      // Next monthly unlock
      const currentMonth = differenceInMonths(now, cliffEnd);
      const nextUnlockDate = addMonths(cliffEnd, currentMonth + 1);

      const perMonthAmount = vestingTotal / BigInt(schedule.vesting_months);

      return {
        amount: perMonthAmount,
        amountFormatted: formatBigInt(perMonthAmount),
        unlockAt: nextUnlockDate,
        daysUntil: differenceInDays(nextUnlockDate, now),
      };
    }
  }

  // Shouldn't reach here, but return null for safety
  return null;
}

/**
 * Format BigInt for display (removes trailing zeros)
 */
function formatBigInt(value: bigint): string {
  return value.toString();
}

/**
 * Generate idempotency key for claim
 * Format: VESTING_CLAIM:{allocationId}:{hourBucket}
 */
export function generateClaimIdempotencyKey(allocationId: string): string {
  const now = new Date();
  const hourBucket = Math.floor(now.getTime() / (60 * 60 * 1000));
  return `VESTING_CLAIM:${allocationId}:${hourBucket}`;
}

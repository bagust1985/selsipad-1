/**
 * FASE 5: Vesting & Liquidity Lock Validators
 * Critical business logic validation for anti-rug mechanisms
 */

import type {
  CreateVestingScheduleRequest,
  CreateLiquidityLockRequest,
  ClaimIntentRequest,
  ClaimConfirmRequest,
  EmergencyPauseVestingRequest,
  VestingStatus,
  LockStatus,
} from '../types/fase5';

export class VestingValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'VestingValidationError';
  }
}

// ============================================================================
// VESTING SCHEDULE VALIDATION
// ============================================================================

export function validateVestingSchedule(
  data: Partial<CreateVestingScheduleRequest>
): CreateVestingScheduleRequest {
  if (!data.round_id) {
    throw new VestingValidationError('Round ID is required', 'round_id');
  }

  // TGE percentage validation
  if (data.tge_percentage === null || data.tge_percentage === undefined) {
    throw new VestingValidationError('TGE percentage is required', 'tge_percentage');
  }

  if (data.tge_percentage < 0 || data.tge_percentage > 100) {
    throw new VestingValidationError('TGE percentage must be between 0 and 100', 'tge_percentage');
  }

  // Cliff validation
  if (data.cliff_months === null || data.cliff_months === undefined) {
    throw new VestingValidationError('Cliff months is required', 'cliff_months');
  }

  if (data.cliff_months < 0) {
    throw new VestingValidationError('Cliff months cannot be negative', 'cliff_months');
  }

  // Vesting months validation
  if (data.vesting_months === null || data.vesting_months === undefined) {
    throw new VestingValidationError('Vesting months is required', 'vesting_months');
  }

  if (data.vesting_months < 0) {
    throw new VestingValidationError('Vesting months cannot be negative', 'vesting_months');
  }

  // Total must equal 100%
  const vestingPercentage = data.vesting_months > 0 ? 100 - data.tge_percentage : 0;
  if (data.tge_percentage + vestingPercentage > 100) {
    throw new VestingValidationError('TGE + vesting must not exceed 100%', 'tge_percentage');
  }

  // At least one distribution method required
  if (data.tge_percentage === 0 && data.vesting_months === 0) {
    throw new VestingValidationError('Must have either TGE or vesting period', 'tge_percentage');
  }

  // Interval type validation
  if (!data.interval_type) {
    throw new VestingValidationError('Interval type is required', 'interval_type');
  }

  if (!['DAILY', 'MONTHLY'].includes(data.interval_type)) {
    throw new VestingValidationError('Interval type must be DAILY or MONTHLY', 'interval_type');
  }

  return data as CreateVestingScheduleRequest;
}

// ============================================================================
// LIQUIDITY LOCK VALIDATION
// ============================================================================

/**
 * CRITICAL: Validates 12-month minimum lock duration
 * This is a HARD REQUIREMENT that cannot be overridden
 */
export function validateLockDuration(duration_months: number): void {
  const MINIMUM_LOCK_MONTHS = 12;

  if (duration_months < MINIMUM_LOCK_MONTHS) {
    throw new VestingValidationError(
      `Lock duration must be at least ${MINIMUM_LOCK_MONTHS} months (received: ${duration_months})`,
      'lock_duration_months'
    );
  }
}

export function validateLiquidityLock(
  data: Partial<CreateLiquidityLockRequest>
): CreateLiquidityLockRequest {
  if (!data.round_id) {
    throw new VestingValidationError('Round ID is required', 'round_id');
  }

  if (!data.dex_type) {
    throw new VestingValidationError('DEX type is required', 'dex_type');
  }

  const validDexTypes = ['UNISWAP_V2', 'PANCAKE', 'RAYDIUM', 'ORCA', 'OTHER'];
  if (!validDexTypes.includes(data.dex_type)) {
    throw new VestingValidationError(
      `Invalid DEX type. Must be one of: ${validDexTypes.join(', ')}`,
      'dex_type'
    );
  }

  if (!data.lp_token_address) {
    throw new VestingValidationError('LP token address is required', 'lp_token_address');
  }

  if (!data.lock_amount || BigInt(data.lock_amount) <= 0n) {
    throw new VestingValidationError('Lock amount must be greater than zero', 'lock_amount');
  }

  if (!data.lock_duration_months) {
    throw new VestingValidationError('Lock duration is required', 'lock_duration_months');
  }

  // CRITICAL: Enforce 12-month minimum
  validateLockDuration(data.lock_duration_months);

  return data as CreateLiquidityLockRequest;
}

// ============================================================================
// CLAIM VALIDATION
// ============================================================================

export function validateClaimIntent(data: Partial<ClaimIntentRequest>): ClaimIntentRequest {
  if (!data.allocation_id) {
    throw new VestingValidationError('Allocation ID is required', 'allocation_id');
  }

  return data as ClaimIntentRequest;
}

export function validateClaimConfirm(data: Partial<ClaimConfirmRequest>): ClaimConfirmRequest {
  if (!data.intent_id) {
    throw new VestingValidationError('Intent ID is required', 'intent_id');
  }

  if (!data.wallet_address) {
    throw new VestingValidationError('Wallet address is required', 'wallet_address');
  }

  if (!data.tx_hash) {
    throw new VestingValidationError('Transaction hash is required', 'tx_hash');
  }

  // Basic tx hash format validation
  if (data.tx_hash.length < 10) {
    throw new VestingValidationError('Invalid transaction hash format', 'tx_hash');
  }

  return data as ClaimConfirmRequest;
}

// ============================================================================
// SUCCESS GATING VALIDATION
// ============================================================================

/**
 * Validates that ALL three success gates are passed
 * CRITICAL: Project cannot be marked SUCCESS unless all gates pass
 */
export function validateSuccessGating(
  roundResult: string,
  vestingStatus: string,
  lockStatus: string
): { passed: boolean; missing: string[] } {
  const missing: string[] = [];

  if (roundResult !== 'SUCCESS') {
    missing.push('Round must have result SUCCESS');
  }

  if (vestingStatus !== 'CONFIRMED') {
    missing.push('Vesting must be CONFIRMED');
  }

  if (lockStatus !== 'LOCKED') {
    missing.push('Liquidity must be LOCKED');
  }

  return {
    passed: missing.length === 0,
    missing,
  };
}

// ============================================================================
// STATUS VALIDATION
// ============================================================================

export function validateVestingStatus(status: string): asserts status is VestingStatus {
  const valid: VestingStatus[] = ['PENDING', 'CONFIRMED', 'FAILED', 'PAUSED'];
  if (!valid.includes(status as VestingStatus)) {
    throw new VestingValidationError(
      `Invalid vesting status. Must be one of: ${valid.join(', ')}`,
      'status'
    );
  }
}

export function validateLockStatus(status: string): asserts status is LockStatus {
  const valid: LockStatus[] = ['PENDING', 'LOCKED', 'UNLOCKED', 'FAILED'];
  if (!valid.includes(status as LockStatus)) {
    throw new VestingValidationError(
      `Invalid lock status. Must be one of: ${valid.join(', ')}`,
      'status'
    );
  }
}

// ============================================================================
// EMERGENCY PAUSE VALIDATION
// ============================================================================

export function validateEmergencyPause(
  data: Partial<EmergencyPauseVestingRequest>
): EmergencyPauseVestingRequest {
  if (!data.round_id) {
    throw new VestingValidationError('Round ID is required', 'round_id');
  }

  if (!data.reason || data.reason.trim().length === 0) {
    throw new VestingValidationError('Reason is required for emergency pause', 'reason');
  }

  if (data.reason.trim().length < 10) {
    throw new VestingValidationError('Reason must be at least 10 characters', 'reason');
  }

  return data as EmergencyPauseVestingRequest;
}

// ============================================================================
// BUSINESS LOGIC VALIDATORS
// ============================================================================

/**
 * Validates cliff period has passed
 */
export function validateCliffPassed(
  tgeAt: Date,
  cliffMonths: number,
  currentTime: Date
): { passed: boolean; remainingDays?: number } {
  if (cliffMonths === 0) {
    return { passed: true };
  }

  const cliffEndDate = new Date(tgeAt);
  cliffEndDate.setMonth(cliffEndDate.getMonth() + cliffMonths);

  const passed = currentTime >= cliffEndDate;

  if (!passed) {
    const remainingMs = cliffEndDate.getTime() - currentTime.getTime();
    const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
    return { passed: false, remainingDays };
  }

  return { passed: true };
}

/**
 * Validates claim amount doesn't exceed available
 */
export function validateClaimAmount(claimAmount: bigint, availableAmount: bigint): void {
  if (claimAmount <= 0n) {
    throw new VestingValidationError('Claim amount must be greater than zero', 'claim_amount');
  }

  if (claimAmount > availableAmount) {
    throw new VestingValidationError(
      `Claim amount (${claimAmount}) exceeds available (${availableAmount})`,
      'claim_amount'
    );
  }
}

/**
 * Validates TGE timestamp
 */
export function validateTgeTimestamp(tgeAt: Date): void {
  // TGE cannot be in far future (> 30 days)
  const maxFuture = new Date();
  maxFuture.setDate(maxFuture.getDate() + 30);

  if (tgeAt > maxFuture) {
    throw new VestingValidationError(
      'TGE date cannot be more than 30 days in the future',
      'tge_at'
    );
  }

  // TGE cannot be too far in past (> 1 year)
  const maxPast = new Date();
  maxPast.setFullYear(maxPast.getFullYear() - 1);

  if (tgeAt < maxPast) {
    throw new VestingValidationError('TGE date cannot be more than 1 year in the past', 'tge_at');
  }
}

/**
 * FASE 4: Launchpad Validators
 * Request validation for pools, contributions, and finalization
 */

import type {
  CreatePoolRequest,
  UpdatePoolRequest,
  ContributionIntentRequest,
  ContributionConfirmRequest,
  ApprovePoolRequest,
  RejectPoolRequest,
  FinalizePoolRequest,
  RefundClaimRequest,
  PresaleParams,
  FairlaunchParams,
} from '../types/fase4';

// ============================================
// Validation Errors
// ============================================

export class PoolValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'PoolValidationError';
  }
}

// ============================================
// Pool Validation
// ============================================

export function validateCreatePool(data: unknown): CreatePoolRequest {
  const req = data as CreatePoolRequest;

  if (!req.project_id || typeof req.project_id !== 'string') {
    throw new PoolValidationError('project_id is required', 'project_id');
  }

  if (!req.type || !['PRESALE', 'FAIRLAUNCH'].includes(req.type)) {
    throw new PoolValidationError('type must be PRESALE or FAIRLAUNCH', 'type');
  }

  if (!req.chain || typeof req.chain !== 'string') {
    throw new PoolValidationError('chain is required', 'chain');
  }

  if (!req.token_address || typeof req.token_address !== 'string') {
    throw new PoolValidationError('token_address is required', 'token_address');
  }

  if (!req.raise_asset || typeof req.raise_asset !== 'string') {
    throw new PoolValidationError('raise_asset is required', 'raise_asset');
  }

  // Validate timestamps
  const startAt = new Date(req.start_at);
  const endAt = new Date(req.end_at);

  if (isNaN(startAt.getTime())) {
    throw new PoolValidationError('start_at must be a valid ISO timestamp', 'start_at');
  }

  if (isNaN(endAt.getTime())) {
    throw new PoolValidationError('end_at must be a valid ISO timestamp', 'end_at');
  }

  if (endAt <= startAt) {
    throw new PoolValidationError('end_at must be after start_at', 'end_at');
  }

  // Start time should be in the future (at least 1 hour)
  const now = new Date();
  const minStartTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
  if (startAt < minStartTime) {
    throw new PoolValidationError('start_at must be at least 1 hour in the future', 'start_at');
  }

  // Validate params based on type
  if (req.type === 'PRESALE') {
    validatePresaleParams(req.params as PresaleParams);
  } else {
    validateFairlaunchParams(req.params as FairlaunchParams);
  }

  return req;
}

export function validatePresaleParams(params: PresaleParams): void {
  if (!params.price || params.price <= 0) {
    throw new PoolValidationError('price must be greater than 0', 'params.price');
  }

  if (!params.hardcap || params.hardcap <= 0) {
    throw new PoolValidationError('hardcap must be greater than 0', 'params.hardcap');
  }

  if (!params.softcap || params.softcap <= 0) {
    throw new PoolValidationError('softcap must be greater than 0', 'params.softcap');
  }

  if (params.softcap > params.hardcap) {
    throw new PoolValidationError('softcap cannot exceed hardcap', 'params.softcap');
  }

  if (!params.token_for_sale || params.token_for_sale <= 0) {
    throw new PoolValidationError('token_for_sale must be greater than 0', 'params.token_for_sale');
  }

  // Validate min/max contribution if provided
  if (params.min_contribution && params.min_contribution <= 0) {
    throw new PoolValidationError(
      'min_contribution must be greater than 0',
      'params.min_contribution'
    );
  }

  if (params.max_contribution) {
    if (params.max_contribution <= 0) {
      throw new PoolValidationError(
        'max_contribution must be greater than 0',
        'params.max_contribution'
      );
    }
    if (params.min_contribution && params.max_contribution < params.min_contribution) {
      throw new PoolValidationError(
        'max_contribution must be >= min_contribution',
        'params.max_contribution'
      );
    }
  }
}

export function validateFairlaunchParams(params: FairlaunchParams): void {
  if (!params.softcap || params.softcap <= 0) {
    throw new PoolValidationError('softcap must be greater than 0', 'params.softcap');
  }

  if (!params.token_for_sale || params.token_for_sale <= 0) {
    throw new PoolValidationError('token_for_sale must be greater than 0', 'params.token_for_sale');
  }

  if (params.listing_premium_bps !== undefined) {
    if (params.listing_premium_bps < 0 || params.listing_premium_bps > 10000) {
      throw new PoolValidationError(
        'listing_premium_bps must be between 0 and 10000',
        'params.listing_premium_bps'
      );
    }
  }
}

export function validateUpdatePool(data: unknown): UpdatePoolRequest {
  const req = data as UpdatePoolRequest;

  if (req.start_at) {
    const startAt = new Date(req.start_at);
    if (isNaN(startAt.getTime())) {
      throw new PoolValidationError('start_at must be a valid ISO timestamp', 'start_at');
    }
  }

  if (req.end_at) {
    const endAt = new Date(req.end_at);
    if (isNaN(endAt.getTime())) {
      throw new PoolValidationError('end_at must be a valid ISO timestamp', 'end_at');
    }
  }

  // Note: More comprehensive validation requires existing pool data (checked in API)

  return req;
}

// ============================================
// Contribution Validation
// ============================================

export function validateContributionIntent(data: unknown): ContributionIntentRequest {
  const req = data as ContributionIntentRequest;

  if (!req.round_id || typeof req.round_id !== 'string') {
    throw new PoolValidationError('round_id is required', 'round_id');
  }

  if (!req.amount || typeof req.amount !== 'number' || req.amount <= 0) {
    throw new PoolValidationError('amount must be greater than 0', 'amount');
  }

  if (!req.wallet_address || typeof req.wallet_address !== 'string') {
    throw new PoolValidationError('wallet_address is required', 'wallet_address');
  }

  // Basic address validation (0x for EVM, base58 for Solana)
  if (req.wallet_address.startsWith('0x')) {
    if (!/^0x[a-fA-F0-9]{40}$/.test(req.wallet_address)) {
      throw new PoolValidationError('Invalid EVM wallet address', 'wallet_address');
    }
  }
  // Solana addresses are 32-44 characters base58
  else if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(req.wallet_address)) {
    throw new PoolValidationError('Invalid wallet address format', 'wallet_address');
  }

  return req;
}

export function validateContributionConfirm(data: unknown): ContributionConfirmRequest {
  const req = data as ContributionConfirmRequest;

  if (!req.round_id || typeof req.round_id !== 'string') {
    throw new PoolValidationError('round_id is required', 'round_id');
  }

  if (!req.tx_hash || typeof req.tx_hash !== 'string') {
    throw new PoolValidationError('tx_hash is required', 'tx_hash');
  }

  if (!req.amount || typeof req.amount !== 'number' || req.amount <= 0) {
    throw new PoolValidationError('amount must be greater than 0', 'amount');
  }

  if (!req.wallet_address || typeof req.wallet_address !== 'string') {
    throw new PoolValidationError('wallet_address is required', 'wallet_address');
  }

  return req;
}

// ============================================
// Admin Actions Validation
// ============================================

export function validateApprovePool(data: unknown): ApprovePoolRequest {
  const req = data as ApprovePoolRequest;

  if (req.notes && typeof req.notes !== 'string') {
    throw new PoolValidationError('notes must be a string', 'notes');
  }

  return req;
}

export function validateRejectPool(data: unknown): RejectPoolRequest {
  const req = data as RejectPoolRequest;

  if (!req.rejection_reason || typeof req.rejection_reason !== 'string') {
    throw new PoolValidationError('rejection_reason is required', 'rejection_reason');
  }

  if (req.rejection_reason.trim().length < 10) {
    throw new PoolValidationError(
      'rejection_reason must be at least 10 characters',
      'rejection_reason'
    );
  }

  return req;
}

export function validateFinalizePool(data: unknown): FinalizePoolRequest {
  const req = data as FinalizePoolRequest;

  if (req.notes && typeof req.notes !== 'string') {
    throw new PoolValidationError('notes must be a string', 'notes');
  }

  return req;
}

// ============================================
// Refund Validation
// ============================================

export function validateRefundClaim(data: unknown): RefundClaimRequest {
  const req = data as RefundClaimRequest;

  if (!req.round_id || typeof req.round_id !== 'string') {
    throw new PoolValidationError('round_id is required', 'round_id');
  }

  return req;
}

// ============================================
// Business Logic Validation
// ============================================

/**
 * Validate pool is in correct state for action
 */
export function validatePoolStatus(
  currentStatus: string,
  allowedStatuses: string[],
  action: string
): void {
  if (!allowedStatuses.includes(currentStatus)) {
    throw new PoolValidationError(
      `Cannot ${action} pool with status ${currentStatus}. Allowed: ${allowedStatuses.join(', ')}`,
      'status'
    );
  }
}

/**
 * Validate contribution amount within pool limits
 */
export function validateContributionAmount(
  amount: number,
  params: PresaleParams,
  userTotalContributed: number = 0
): void {
  if (params.min_contribution && amount < params.min_contribution) {
    throw new PoolValidationError(
      `Contribution must be at least ${params.min_contribution}`,
      'amount'
    );
  }

  if (params.max_contribution) {
    const newTotal = userTotalContributed + amount;
    if (newTotal > params.max_contribution) {
      throw new PoolValidationError(
        `Total contribution cannot exceed ${params.max_contribution}`,
        'amount'
      );
    }
  }
}

/**
 * Validate pool has reached softcap for success
 */
export function validateSoftcapReached(totalRaised: number, softcap: number): boolean {
  return totalRaised >= softcap;
}

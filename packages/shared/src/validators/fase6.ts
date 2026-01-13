/**
 * FASE 6: Social + Blue Check + Referral + AMA Validators
 * Validation utilities untuk growth loop features
 */

import type {
  CreatePostRequest,
  BlueCheckBuyIntentRequest,
  BlueCheckBuyConfirmRequest,
  ReferralActivateRequest,
  ReferralClaimRequest,
  CreateAMARequest,
  UpdateAMARequest,
  AMAPayRequest,
  AMAVerifyTokenRequest,
  BanUserRequest,
  RevokeBlueCheckRequest,
  PostType,
  AMAType,
} from '../types/fase6';

// ============================================================================
// POST VALIDATORS
// ============================================================================

export function validateCreatePost(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Invalid request data');
    return { valid: false, errors };
  }

  const post = data as Partial<CreatePostRequest>;

  // Content validation
  if (!post.content || typeof post.content !== 'string') {
    errors.push('Content is required');
  } else {
    const contentLength = post.content.trim().length;
    if (contentLength < 1) {
      errors.push('Content cannot be empty');
    }
    if (contentLength > 5000) {
      errors.push('Content cannot exceed 5000 characters');
    }
  }

  // Type validation
  const validTypes: PostType[] = ['POST', 'REPLY', 'QUOTE', 'REPOST'];
  if (!post.type || !validTypes.includes(post.type)) {
    errors.push(`Type must be one of: ${validTypes.join(', ')}`);
  }

  // Type-specific validation
  if (post.type === 'REPLY' && !post.parent_post_id) {
    errors.push('REPLY requires parent_post_id');
  }

  if (post.type === 'QUOTE' && !post.quoted_post_id) {
    errors.push('QUOTE requires quoted_post_id');
  }

  if (post.type === 'REPOST' && !post.reposted_post_id) {
    errors.push('REPOST requires reposted_post_id');
  }

  if (
    post.type === 'POST' &&
    (post.parent_post_id || post.quoted_post_id || post.reposted_post_id)
  ) {
    errors.push('POST should not have parent, quoted, or reposted references');
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// BLUE CHECK VALIDATORS
// ============================================================================

export function validateBlueCheckBuyIntent(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Invalid request data');
    return { valid: false, errors };
  }

  const request = data as Partial<BlueCheckBuyIntentRequest>;

  if (!request.payment_chain || typeof request.payment_chain !== 'string') {
    errors.push('payment_chain is required');
  }

  if (!request.payment_token || typeof request.payment_token !== 'string') {
    errors.push('payment_token is required');
  }

  return { valid: errors.length === 0, errors };
}

export function validateBlueCheckBuyConfirm(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Invalid request data');
    return { valid: false, errors };
  }

  const request = data as Partial<BlueCheckBuyConfirmRequest>;

  if (!request.purchase_id || typeof request.purchase_id !== 'string') {
    errors.push('purchase_id is required');
  }

  if (!request.tx_hash || typeof request.tx_hash !== 'string') {
    errors.push('tx_hash is required');
  } else if (request.tx_hash.length < 10) {
    errors.push('tx_hash appears invalid (too short)');
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// REFERRAL VALIDATORS
// ============================================================================

export function validateReferralActivate(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Invalid request data');
    return { valid: false, errors };
  }

  const request = data as Partial<ReferralActivateRequest>;

  if (!request.code || typeof request.code !== 'string') {
    errors.push('code is required');
  } else if (request.code.length < 6) {
    errors.push('Invalid referral code');
  }

  return { valid: errors.length === 0, errors };
}

export function validateReferralClaim(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Invalid request data');
    return { valid: false, errors };
  }

  const request = data as Partial<ReferralClaimRequest>;

  if (!request.chain || typeof request.chain !== 'string') {
    errors.push('chain is required');
  }

  if (!request.asset || typeof request.asset !== 'string') {
    errors.push('asset is required');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate claim eligibility (Blue Check + Active Referrals)
 * CRITICAL for claim gating
 */
export function validateClaimEligibility(
  bluecheckStatus: string | null,
  activeReferralCount: number
): { can_claim: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (bluecheckStatus !== 'ACTIVE') {
    reasons.push('You must have an active Blue Check to claim rewards');
  }

  if (activeReferralCount < 1) {
    reasons.push('You must have at least 1 active referral to claim rewards');
  }

  return {
    can_claim: reasons.length === 0,
    reasons,
  };
}

// ============================================================================
// AMA VALIDATORS
// ============================================================================

export function validateCreateAMA(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Invalid request data');
    return { valid: false, errors };
  }

  const request = data as Partial<CreateAMARequest>;

  if (!request.project_id || typeof request.project_id !== 'string') {
    errors.push('project_id is required');
  }

  if (!request.title || typeof request.title !== 'string') {
    errors.push('title is required');
  } else {
    const titleLength = request.title.trim().length;
    if (titleLength < 5) {
      errors.push('title must be at least 5 characters');
    }
    if (titleLength > 200) {
      errors.push('title cannot exceed 200 characters');
    }
  }

  const validTypes: AMAType[] = ['TEXT', 'VOICE', 'VIDEO'];
  if (!request.type || !validTypes.includes(request.type)) {
    errors.push(`type must be one of: ${validTypes.join(', ')}`);
  }

  if (!request.scheduled_at || typeof request.scheduled_at !== 'string') {
    errors.push('scheduled_at is required');
  } else {
    const scheduledDate = new Date(request.scheduled_at);
    if (isNaN(scheduledDate.getTime())) {
      errors.push('scheduled_at must be a valid ISO timestamp');
    } else if (scheduledDate <= new Date()) {
      errors.push('scheduled_at must be in the future');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateUpdateAMA(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Invalid request data');
    return { valid: false, errors };
  }

  const request = data as Partial<UpdateAMARequest>;

  // At least one field must be provided
  if (!request.title && !request.description && !request.scheduled_at) {
    errors.push('At least one field (title, description, scheduled_at) must be provided');
  }

  if (request.title !== undefined) {
    if (typeof request.title !== 'string') {
      errors.push('title must be a string');
    } else {
      const titleLength = request.title.trim().length;
      if (titleLength < 5) {
        errors.push('title must be at least 5 characters');
      }
      if (titleLength > 200) {
        errors.push('title cannot exceed 200 characters');
      }
    }
  }

  if (request.scheduled_at !== undefined) {
    const scheduledDate = new Date(request.scheduled_at);
    if (isNaN(scheduledDate.getTime())) {
      errors.push('scheduled_at must be a valid ISO timestamp');
    } else if (scheduledDate <= new Date()) {
      errors.push('scheduled_at must be in the future');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateAMAPay(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Invalid request data');
    return { valid: false, errors };
  }

  const request = data as Partial<AMAPayRequest>;

  if (!request.tx_hash || typeof request.tx_hash !== 'string') {
    errors.push('tx_hash is required');
  } else if (request.tx_hash.length < 10) {
    errors.push('tx_hash appears invalid (too short)');
  }

  return { valid: errors.length === 0, errors };
}

export function validateAMAVerifyToken(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Invalid request data');
    return { valid: false, errors };
  }

  const request = data as Partial<AMAVerifyTokenRequest>;

  if (!request.token || typeof request.token !== 'string') {
    errors.push('token is required');
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// ADMIN/MODERATION VALIDATORS
// ============================================================================

export function validateBanUser(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Invalid request data');
    return { valid: false, errors };
  }

  const request = data as Partial<BanUserRequest>;

  if (!request.reason || typeof request.reason !== 'string') {
    errors.push('reason is required');
  } else if (request.reason.trim().length < 10) {
    errors.push('reason must be at least 10 characters');
  }

  if (request.duration_days !== undefined) {
    if (typeof request.duration_days !== 'number' || request.duration_days <= 0) {
      errors.push('duration_days must be a positive number');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateRevokeBlueCheck(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Invalid request data');
    return { valid: false, errors };
  }

  const request = data as Partial<RevokeBlueCheckRequest>;

  if (!request.reason || typeof request.reason !== 'string') {
    errors.push('reason is required');
  } else if (request.reason.trim().length < 10) {
    errors.push('reason must be at least 10 characters');
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// BUSINESS LOGIC VALIDATORS
// ============================================================================

/**
 * Calculate fee split (70% treasury, 30% referral pool)
 */
export function calculateFeeSplit(totalAmount: bigint): {
  treasury_amount: bigint;
  referral_pool_amount: bigint;
} {
  const treasuryAmount = (totalAmount * 70n) / 100n;
  const referralPoolAmount = (totalAmount * 30n) / 100n;

  // Validate split
  if (treasuryAmount + referralPoolAmount !== totalAmount) {
    throw new Error('Fee split calculation error: amounts do not sum to total');
  }

  return {
    treasury_amount: treasuryAmount,
    referral_pool_amount: referralPoolAmount,
  };
}

/**
 * Validate referral code format
 */
export function validateReferralCodeFormat(code: string): boolean {
  // Alphanumeric, 6-12 characters
  return /^[A-Z0-9]{6,12}$/.test(code);
}

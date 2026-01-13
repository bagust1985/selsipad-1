/**
 * FASE 5: Vesting & Liquidity Lock Types
 * Anti-Rug Layer for investor protection
 */

// ============================================================================
// ENUMS
// ============================================================================

export type VestingStatus = 'PENDING' | 'CONFIRMED' | 'FAILED' | 'PAUSED';
export type VestingIntervalType = 'DAILY' | 'MONTHLY';
export type ClaimStatus = 'PENDING' | 'CONFIRMED' | 'FAILED';

export type LockStatus = 'PENDING' | 'LOCKED' | 'UNLOCKED' | 'FAILED';
export type DexType = 'UNISWAP_V2' | 'PANCAKE' | 'RAYDIUM' | 'ORCA' | 'OTHER';

export type PostFinalizeStepStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export type GateStatus = 'NONE' | 'PENDING' | 'CONFIRMED' | 'FAILED';

// ============================================================================
// VESTING TYPES
// ============================================================================

export interface VestingSchedule {
  id: string;
  round_id: string;

  // Token info
  token_address: string;
  chain: string;
  total_tokens: string; // BigInt as string

  // Vesting parameters
  tge_percentage: number; // 0-100
  tge_at: string; // ISO timestamp
  cliff_months: number;
  vesting_months: number;
  interval_type: VestingIntervalType;

  // Status
  status: VestingStatus;
  contract_address?: string;
  deployment_tx_hash?: string;

  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface VestingAllocation {
  id: string;
  schedule_id: string;
  round_id: string;
  user_id: string;

  // Amounts
  allocation_tokens: string; // BigInt as string
  claimed_tokens: string; // BigInt as string

  // Claim tracking
  last_claim_at?: string;
  total_claims: number;

  // Metadata
  created_at: string;
  updated_at: string;
}

export interface VestingClaim {
  id: string;
  allocation_id: string;
  user_id: string;

  // Claim details
  claim_amount: string; // BigInt as string
  claimed_at: string;

  // Transaction
  chain: string;
  wallet_address: string;
  tx_hash?: string;
  status: ClaimStatus;

  // Idempotency
  idempotency_key: string;

  // Metadata
  created_at: string;
  updated_at: string;
}

// ============================================================================
// LIQUIDITY LOCK TYPES
// ============================================================================

export interface LiquidityLock {
  id: string;
  round_id: string;

  // DEX info
  chain: string;
  dex_type: DexType;
  lp_token_address: string;
  lock_amount: string; // BigInt as string

  // Lock duration (minimum 12 months)
  locked_at?: string;
  locked_until?: string;
  lock_duration_months: number; // >= 12

  // Lock contract
  locker_contract_address?: string;
  lock_tx_hash?: string;
  lock_id?: string; // External locker's ID

  // Status
  status: LockStatus;

  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// ============================================================================
// POST-FINALIZE ORCHESTRATION
// ============================================================================

export interface RoundPostFinalize {
  id: string;
  round_id: string;

  // Vesting setup
  vesting_setup_status: PostFinalizeStepStatus;
  vesting_setup_at?: string;
  vesting_setup_error?: string;

  // Lock setup
  lock_setup_status: PostFinalizeStepStatus;
  lock_setup_at?: string;
  lock_setup_error?: string;

  // Retry tracking
  retry_count: number;
  last_retry_at?: string;
  last_error?: string;

  // Completion
  completed_at?: string;

  // Metadata
  created_at: string;
  updated_at: string;
}

// ============================================================================
// CALCULATION TYPES
// ============================================================================

export interface ClaimableCalculation {
  // Breakdown
  total_allocated: string; // BigInt as string
  tge_unlocked: string;
  cliff_unlocked: string;
  vested_unlocked: string;

  // Totals
  total_claimable: string;
  already_claimed: string;
  available_now: string; // total_claimable - already_claimed

  // Metadata
  calculation_time: string;
  next_claim_date?: string;
  is_cliff_passed: boolean;
}

export interface VestingTimeline {
  tge_date: string;
  cliff_end_date?: string;
  vesting_end_date?: string;
  next_unlock_date?: string;

  // Progress
  days_since_tge: number;
  days_until_fully_vested?: number;
  percent_vested: number; // 0-100
}

// ============================================================================
// SUCCESS GATING TYPES
// ============================================================================

export interface SuccessGateCheck {
  round_success: boolean; // result === 'SUCCESS'
  vesting_confirmed: boolean; // vesting_status === 'CONFIRMED'
  lock_confirmed: boolean; // lock_status === 'LOCKED'
  all_gates_passed: boolean;
  success_gated_at?: string;
}

export interface SuccessGateStatus {
  gates: SuccessGateCheck;
  vesting_schedule?: VestingSchedule;
  liquidity_lock?: LiquidityLock;
  missing_requirements: string[];
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

// Vesting Setup
export interface CreateVestingScheduleRequest {
  round_id: string;
  tge_percentage: number;
  cliff_months: number;
  vesting_months: number;
  interval_type: VestingIntervalType;
  tge_at?: string; // Optional, defaults to round.finalized_at
}

export interface CreateVestingScheduleResponse {
  schedule: VestingSchedule;
  allocations_created: number;
  total_tokens_allocated: string;
}

// Claim Intent
export interface ClaimIntentRequest {
  allocation_id: string;
}

export interface ClaimIntentResponse {
  intent_id: string;
  allocation: VestingAllocation;
  claimable: ClaimableCalculation;
  expires_at: string;
  can_claim: boolean;
  reason?: string; // If can_claim is false
}

// Claim Confirm
export interface ClaimConfirmRequest {
  intent_id: string;
  wallet_address: string;
  tx_hash: string;
}

export interface ClaimConfirmResponse {
  claim: VestingClaim;
  message: string;
}

// Lock Setup
export interface CreateLiquidityLockRequest {
  round_id: string;
  dex_type: DexType;
  lp_token_address: string;
  lock_amount: string;
  lock_duration_months: number; // Must be >= 12
}

export interface CreateLiquidityLockResponse {
  lock: LiquidityLock;
  locker_contract_address: string;
  estimated_unlock_date: string;
}

// Lock Confirm
export interface ConfirmLiquidityLockRequest {
  lock_tx_hash: string;
  lock_id?: string;
}

export interface ConfirmLiquidityLockResponse {
  lock: LiquidityLock;
  message: string;
}

// Emergency Pause
export interface EmergencyPauseVestingRequest {
  round_id: string;
  reason: string;
  two_man_approval_id?: string; // For two-man rule
}

export interface EmergencyPauseVestingResponse {
  schedule: VestingSchedule;
  paused_at: string;
  affected_allocations: number;
}

// Analytics
export interface VestingAnalytics {
  round_id: string;
  total_allocated: string;
  total_claimed: string;
  total_pending: string;
  unique_claimants: number;
  total_claims: number;
  claim_rate: number; // Percentage
  average_claim_amount: string;
}

export interface LiquidityLockAnalytics {
  total_locks: number;
  total_value_locked: string; // USD or native token
  active_locks: number;
  expired_locks: number;
  by_dex: Record<DexType, number>;
  by_chain: Record<string, number>;
}

// ============================================================================
// EXTENDED LAUNCH ROUND TYPE
// ============================================================================

export interface LaunchRoundWithGating {
  // Existing fields from FASE 4
  id: string;
  project_id: string;
  type: 'PRESALE' | 'FAIRLAUNCH';
  status: string;
  result: 'NONE' | 'SUCCESS' | 'FAILED';

  // FASE 5 additions
  vesting_status: SuccessGateStatus;
  lock_status: SuccessGateStatus;
  success_gated_at?: string;

  // Related data
  vesting_schedule?: VestingSchedule;
  liquidity_lock?: LiquidityLock;
  post_finalize?: RoundPostFinalize;
}

/**
 * FASE 7: Solana Bonding Curve + Graduation
 * TypeScript Types
 */

// ============================================================================
// BONDING POOL TYPES
// ============================================================================

export type BondingPoolStatus =
  | 'DRAFT' // Pool created, awaiting deploy fee
  | 'DEPLOYING' // Deploy fee paid, on-chain deployment in progress
  | 'LIVE' // Pool active, swaps enabled
  | 'GRADUATING' // Threshold reached, migration in progress
  | 'GRADUATED' // Migrated to DEX, LP locked
  | 'FAILED'; // Deployment or migration failed

export type DEXType = 'RAYDIUM' | 'ORCA';
export type SwapType = 'BUY' | 'SELL';
export type BondingEventType =
  | 'POOL_CREATED'
  | 'DEPLOY_INTENT_GENERATED'
  | 'DEPLOY_FEE_PAID'
  | 'DEPLOY_STARTED'
  | 'DEPLOY_CONFIRMED'
  | 'DEPLOY_FAILED'
  | 'SWAP_EXECUTED'
  | 'GRADUATION_THRESHOLD_REACHED'
  | 'GRADUATION_STARTED'
  | 'MIGRATION_INTENT_GENERATED'
  | 'MIGRATION_FEE_PAID'
  | 'MIGRATION_COMPLETED'
  | 'MIGRATION_FAILED'
  | 'LP_LOCK_CREATED'
  | 'STATUS_CHANGED'
  | 'POOL_PAUSED'
  | 'POOL_RESUMED'
  | 'POOL_FAILED';

export type DEXMigrationStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface BondingPool {
  id: string;
  project_id: string;
  creator_id: string;

  // Token Info
  token_mint: string;
  token_name: string;
  token_symbol: string;
  token_decimals: number;
  total_supply: string; // bigint as string

  // AMM Configuration
  virtual_sol_reserves: string;
  virtual_token_reserves: string;
  actual_sol_reserves: string;
  actual_token_reserves: string;

  // Fees & Thresholds
  deploy_fee_sol: string;
  deploy_tx_hash: string | null;
  deploy_tx_verified: boolean;
  swap_fee_bps: number; // 150 = 1.5%
  graduation_threshold_sol: string;
  migration_fee_sol: string;
  migration_fee_tx_hash: string | null;
  migration_fee_verified: boolean;

  // Status
  status: BondingPoolStatus;
  failure_reason: string | null;

  // DEX Migration
  target_dex: DEXType | null;
  dex_pool_address: string | null;
  migration_tx_hash: string | null;

  // FASE 5 Integration
  lp_lock_id: string | null;

  // Timestamps
  created_at: string;
  deployed_at: string | null;
  graduated_at: string | null;
  failed_at: string | null;
  updated_at: string;
}

export interface BondingSwap {
  id: string;
  pool_id: string;
  user_id: string;

  // Swap Details
  swap_type: SwapType;
  input_amount: string;
  output_amount: string;
  price_per_token: string;

  // Fees
  swap_fee_amount: string;
  treasury_fee: string; // 50%
  referral_pool_fee: string; // 50%

  // On-chain
  tx_hash: string;
  signature_verified: boolean;

  // Referral
  referrer_id: string | null;

  // Reserves Snapshot
  sol_reserves_before: string;
  token_reserves_before: string;
  sol_reserves_after: string;
  token_reserves_after: string;

  created_at: string;
}

export interface BondingEvent {
  id: string;
  pool_id: string;
  event_type: BondingEventType;
  event_data: Record<string, unknown>;
  triggered_by: string | null;
  created_at: string;
}

export interface DEXMigration {
  id: string;
  pool_id: string;

  // Migration Details
  target_dex: DEXType;
  sol_migrated: string;
  tokens_migrated: string;

  // Fees
  migration_fee_paid: string;
  migration_fee_tx_hash: string | null;

  // DEX Pool
  dex_pool_address: string;
  creation_tx_hash: string;

  // LP Lock
  lp_token_mint: string;
  lp_amount_locked: string;
  lp_lock_id: string | null;
  lp_lock_duration_months: number;

  // Status
  status: DEXMigrationStatus;
  failure_reason: string | null;

  created_at: string;
  completed_at: string | null;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateBondingPoolRequest {
  project_id: string;
  token_name: string;
  token_symbol: string;
  token_decimals?: number;
  total_supply: string;
  virtual_sol_reserves: string;
  virtual_token_reserves: string;
  graduation_threshold_sol: string;
  target_dex?: DEXType;
}

export interface DeployIntentRequest {
  pool_id: string;
}

export interface DeployIntentResponse {
  intent_id: string;
  treasury_address: string;
  required_amount_lamports: string; // 0.5 SOL = 500000000
  expires_at: string;
}

export interface DeployConfirmRequest {
  pool_id: string;
  intent_id: string;
  fee_tx_hash: string;
}

export interface DeployConfirmResponse {
  success: boolean;
  pool_status: BondingPoolStatus;
  deploy_tx_hash?: string;
  message?: string;
}

export interface SwapIntentRequest {
  pool_id: string;
  swap_type: SwapType;
  input_amount: string;
  slippage_tolerance_bps?: number; // Default 100 (1%)
}

export interface SwapIntentResponse {
  intent_id: string;
  estimated_output: string;
  price_per_token: string;
  swap_fee: string;
  treasury_fee: string;
  referral_pool_fee: string;
  minimum_output: string; // After slippage
  expires_at: string; // 30 seconds
}

export interface SwapConfirmRequest {
  pool_id: string;
  intent_id: string;
  tx_hash: string;
}

export interface SwapConfirmResponse {
  success: boolean;
  swap_id: string;
  actual_output: string;
  message?: string;
}

export interface MigrateIntentRequest {
  pool_id: string;
  target_dex: DEXType;
}

export interface MigrateIntentResponse {
  intent_id: string;
  treasury_address: string;
  required_fee_lamports: string; // 2.5 SOL = 2500000000
  expires_at: string;
}

export interface MigrateConfirmRequest {
  pool_id: string;
  intent_id: string;
  fee_tx_hash: string;
}

export interface MigrateConfirmResponse {
  success: boolean;
  dex_pool_address: string;
  migration_tx_hash: string;
  lp_lock_id: string;
  message?: string;
}

export interface GraduationGatesResponse {
  pool_id: string;
  pool_status: BondingPoolStatus;
  gates: {
    sol_threshold_met: boolean;
    lp_lock_created: boolean;
    lp_lock_duration_met: boolean; // >= 12 months
    lp_lock_active: boolean;
    team_vesting_active: boolean;
  };
  can_graduate: boolean;
  graduation_progress_percent: number;
}

// ============================================================================
// CALCULATION TYPES
// ============================================================================

export interface AMMCalculation {
  input_amount: bigint;
  output_amount: bigint;
  price_per_token: bigint;
  swap_fee: bigint;
  treasury_fee: bigint;
  referral_pool_fee: bigint;
  new_sol_reserves: bigint;
  new_token_reserves: bigint;
  price_impact_bps: number;
}

export interface SwapQuote {
  swap_type: SwapType;
  input_amount: string;
  output_amount: string;
  price_per_token: string;
  swap_fee_bps: number;
  treasury_fee: string;
  referral_pool_fee: string;
  minimum_output: string;
  price_impact_percent: number;
  slippage_tolerance_bps: number;
}

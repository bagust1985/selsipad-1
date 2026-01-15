/**
 * FASE 8: SBT Staking v2 Types
 */

export type ChainType = 'solana' | 'evm';
export type SbtClaimStatus = 'PENDING_FEE' | 'PROCESSING' | 'CONFIRMED' | 'FAILED';

export interface SbtRule {
  id: string;
  chain: ChainType;
  collection_id: string; // Mint address (Solana) or Contract address (EVM)
  min_balance: number; // usually 1 for SBT
  name: string;
  is_active: boolean;
  created_at?: string;
}

export interface SbtStake {
  id: string;
  user_id: string;
  rule_id: string;
  wallet_address: string; // The wallet holding the SBT
  staked_at: string;

  // Joins
  rule?: SbtRule;
}

export interface SbtRewardsLedger {
  id: string;
  user_id: string;
  total_accrued: string; // BigInt string
  total_claimed: string; // BigInt string
  last_updated: string;
}

export interface SbtClaim {
  id: string;
  user_id: string;
  amount: string; // BigInt string
  fee_tx_hash: string;
  status: SbtClaimStatus;
  payout_tx_hash?: string; // If payout confirmed
  created_at: string;
  updated_at: string;
}

// API Payloads

export interface StakeSbtRequest {
  rule_id: string;
  wallet_address: string;
}

export interface StakeSbtResponse {
  success: boolean;
  stake_id: string;
  message: string;
}

export interface UnstakeSbtRequest {
  stake_id: string;
}

export interface UnstakeSbtResponse {
  success: boolean;
  message: string;
}

export interface ClaimSbtRewardRequest {
  // Intent generation
}

export interface ClaimSbtRewardResponse {
  intent_id: string;
  amount_sol: string; // $10 equiv
  treasury_address: string;
  expires_at: string;
}

export interface SbtClaimConfirmRequest {
  intent_id: string;
  fee_tx_hash: string;
}

export interface SbtClaimConfirmResponse {
  success: boolean;
  claim_id: string;
  status: SbtClaimStatus;
  message: string;
}

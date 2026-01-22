/**
 * Multi-Chain Stats Types
 */

export interface ChainStats {
  chain: string;
  totalContributed: number;
  nativeToken: string;
  usdEstimate?: number;
}

export interface RewardStats {
  chain: string;
  amount: number;
  token: string;
  usdEstimate?: number;
}

export interface UserStatsMultiChain {
  contributions: ChainStats[];
  rewards: RewardStats[];
  totalContributedUSD: number;
  totalRewardsUSD: number;
}

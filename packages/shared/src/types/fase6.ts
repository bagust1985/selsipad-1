/**
 * FASE 6: Social + Blue Check + Referral + AMA Types
 * Type definitions untuk growth loop features
 */

// ============================================================================
// POSTS & SOCIAL FEED
// ============================================================================

export type PostType = 'POST' | 'REPLY' | 'QUOTE' | 'REPOST';

export interface Post {
  id: string;
  author_id: string;
  project_id: string | null;
  content: string;
  type: PostType;
  parent_post_id: string | null;
  quoted_post_id: string | null;
  reposted_post_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface CreatePostRequest {
  content: string;
  type: PostType;
  project_id?: string;
  parent_post_id?: string; // For REPLY
  quoted_post_id?: string; // For QUOTE
  reposted_post_id?: string; // For REPOST
}

export interface FeedResponse {
  posts: PostWithAuthor[];
  cursor: string | null;
  has_more: boolean;
}

export interface PostWithAuthor extends Post {
  author: {
    user_id: string;
    username: string | null;
    avatar_url: string | null;
    bluecheck_status: string;
  };
  project?: {
    id: string;
    name: string;
    logo_url: string | null;
  };
  engagement?: {
    reply_count: number;
    quote_count: number;
    repost_count: number;
  };
}

// ============================================================================
// BLUE CHECK
// ============================================================================

export type BlueCheckPurchaseStatus = 'INTENT' | 'PENDING' | 'CONFIRMED' | 'FAILED';

export interface BlueCheckPurchase {
  id: string;
  user_id: string;
  price_usd: string; // NUMERIC
  payment_chain: string;
  payment_token: string;
  payment_amount: string; // NUMERIC(78,0)
  payment_tx_hash: string | null;
  status: BlueCheckPurchaseStatus;
  intent_expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface BlueCheckBuyIntentRequest {
  payment_chain: string;
  payment_token: string;
}

export interface BlueCheckBuyIntentResponse {
  purchase_id: string;
  price_usd: string;
  payment_amount: string;
  payment_chain: string;
  payment_token: string;
  intent_expires_at: string;
  payment_address: string; // Treasury address
}

export interface BlueCheckBuyConfirmRequest {
  purchase_id: string;
  tx_hash: string;
}

export interface BlueCheckStatusResponse {
  has_bluecheck: boolean;
  status: string | null; // ACTIVE, REVOKED, etc
  purchase_history: BlueCheckPurchase[];
}

export interface BlueCheckPriceResponse {
  price_usd: string;
  supported_chains: Array<{
    chain: string;
    tokens: Array<{
      address: string;
      symbol: string;
      decimals: number;
    }>;
  }>;
}

// ============================================================================
// REFERRAL
// ============================================================================

export interface ReferralRelationship {
  id: string;
  referrer_id: string;
  referee_id: string;
  code: string;
  activated_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ReferralSourceType = 'PRESALE' | 'FAIRLAUNCH' | 'BONDING' | 'BLUECHECK';
export type ReferralLedgerStatus = 'PENDING' | 'CLAIMABLE' | 'CLAIMED';

export interface ReferralLedger {
  id: string;
  referrer_id: string;
  source_type: ReferralSourceType;
  source_id: string;
  amount: string; // NUMERIC(78,0)
  asset: string;
  chain: string;
  status: ReferralLedgerStatus;
  claimed_at: string | null;
  claim_tx_hash: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReferralRegisterResponse {
  code: string;
  referral_link: string;
}

export interface ReferralActivateRequest {
  code: string;
}

export interface ReferralStatsResponse {
  total_referrals: number;
  active_referrals: number; // activated_at IS NOT NULL
  total_rewards_earned: string; // Sum of claimed rewards
  claimable_rewards: string; // Sum of claimable rewards
  claimable_by_chain: Array<{
    chain: string;
    asset: string;
    amount: string;
  }>;
}

export interface ReferralWithStatus extends ReferralRelationship {
  referee: {
    username: string | null;
    avatar_url: string | null;
    created_at: string;
  };
  is_active: boolean;
  qualifying_event?: {
    type: string;
    timestamp: string;
  };
}

export interface ReferralClaimRequest {
  chain: string;
  asset: string;
}

export interface ReferralClaimResponse {
  claim_id: string;
  amount: string;
  chain: string;
  asset: string;
  tx_hash: string | null; // From Tx Manager
  status: 'PENDING' | 'CONFIRMED';
}

export interface ReferralLeaderboardEntry {
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  active_referral_count: number;
  total_rewards: string;
  rank: number;
}

// ============================================================================
// FEE SPLITS
// ============================================================================

export type FeeSplitSourceType = 'PRESALE' | 'FAIRLAUNCH' | 'BONDING' | 'BLUECHECK';

export interface FeeSplit {
  id: string;
  source_type: FeeSplitSourceType;
  source_id: string;
  total_amount: string; // NUMERIC(78,0)
  treasury_amount: string; // 70%
  referral_pool_amount: string; // 30%
  asset: string;
  chain: string;
  processed: boolean;
  processed_at: string | null;
  created_at: string;
}

// ============================================================================
// AMA SESSIONS
// ============================================================================

export type AMAType = 'TEXT' | 'VOICE' | 'VIDEO';
export type AMAStatus = 'SUBMITTED' | 'PAID' | 'APPROVED' | 'LIVE' | 'ENDED' | 'CANCELLED';

export interface AMASession {
  id: string;
  project_id: string;
  host_id: string;
  title: string;
  description: string | null;
  type: AMAType;
  status: AMAStatus;
  scheduled_at: string;
  started_at: string | null;
  ended_at: string | null;
  payment_tx_hash: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAMARequest {
  project_id: string;
  title: string;
  description?: string;
  type: AMAType;
  scheduled_at: string; // ISO timestamp
}

export interface UpdateAMARequest {
  title?: string;
  description?: string;
  scheduled_at?: string;
}

export interface AMAListResponse {
  sessions: AMASessionWithDetails[];
  total: number;
}

export interface AMASessionWithDetails extends AMASession {
  project: {
    id: string;
    name: string;
    logo_url: string | null;
  };
  host: {
    user_id: string;
    username: string | null;
    avatar_url: string | null;
  };
  participant_count?: number;
}

export interface AMAPayRequest {
  tx_hash: string;
}

export interface AMAJoinToken {
  id: string;
  ama_id: string;
  user_id: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export interface AMAJoinResponse {
  token: string;
  expires_at: string;
  expires_in_seconds: number;
  session: {
    id: string;
    title: string;
    type: AMAType;
    status: AMAStatus;
  };
}

export interface AMAVerifyTokenRequest {
  token: string;
}

export interface AMAVerifyTokenResponse {
  valid: boolean;
  session?: {
    id: string;
    title: string;
    type: AMAType;
  };
  user?: {
    user_id: string;
    username: string | null;
  };
  error?: string;
}

// ============================================================================
// ADMIN/MODERATION
// ============================================================================

export interface ModerationPostsResponse {
  posts: Array<
    PostWithAuthor & {
      reported_count: number;
      reported_reasons: string[];
    }
  >;
  total: number;
}

export interface ModerationStatsResponse {
  total_posts_deleted: number;
  total_users_banned: number;
  total_bluechecks_revoked: number;
  recent_actions: Array<{
    action: string;
    target_type: string;
    target_id: string;
    admin_id: string;
    timestamp: string;
    reason: string | null;
  }>;
}

export interface BanUserRequest {
  reason: string;
  duration_days?: number; // Permanent if not provided
}

export interface RevokeBlueCheckRequest {
  reason: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface QualifyingEvent {
  type: 'PRESALE' | 'FAIRLAUNCH' | 'BONDING' | 'BLUECHECK';
  id: string;
  timestamp: string;
  amount?: string;
}

export interface ClaimEligibility {
  can_claim: boolean;
  reasons: string[];
  checks: {
    is_bluecheck: boolean;
    has_active_referrals: boolean;
    has_claimable_rewards: boolean;
  };
}

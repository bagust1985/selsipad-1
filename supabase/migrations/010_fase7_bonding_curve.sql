-- =====================================================
-- FASE 7: Solana Bonding Curve + Graduation
-- Migration 010
-- =====================================================
-- Description: Implement permissionless token launch with bonding curve,
--              automatic DEX migration, and LP lock enforcement
-- Dependencies: FASE 5 (liquidity_locks), FASE 6 (fee_splits, vesting_schedules)
-- =====================================================

-- =====================================================
-- TABLE 1: bonding_pools
-- =====================================================
-- Purpose: Track Solana bonding curve pool lifecycle
-- Status: DRAFT → DEPLOYING → LIVE → GRADUATING → GRADUATED | FAILED

CREATE TABLE bonding_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  
  -- Token Information
  token_mint TEXT NOT NULL UNIQUE, -- Solana token mint address
  token_name TEXT NOT NULL CHECK (char_length(token_name) <= 32),
  token_symbol TEXT NOT NULL CHECK (char_length(token_symbol) <= 8),
  token_decimals INTEGER NOT NULL DEFAULT 9 CHECK (token_decimals >= 0 AND token_decimals <= 18),
  total_supply BIGINT NOT NULL CHECK (total_supply > 0),
  
  -- Bonding Curve AMM Configuration
  virtual_sol_reserves BIGINT NOT NULL CHECK (virtual_sol_reserves > 0),
  virtual_token_reserves BIGINT NOT NULL CHECK (virtual_token_reserves > 0),
  actual_sol_reserves BIGINT NOT NULL DEFAULT 0 CHECK (actual_sol_reserves >= 0),
  actual_token_reserves BIGINT NOT NULL CHECK (actual_token_reserves >= 0),
  
  -- Fees & Thresholds
  deploy_fee_sol BIGINT NOT NULL DEFAULT 500000000 CHECK (deploy_fee_sol >= 0), -- 0.5 SOL in lamports
  deploy_tx_hash TEXT, -- On-chain deploy transaction hash
  deploy_tx_verified BOOLEAN NOT NULL DEFAULT FALSE,
  
  swap_fee_bps INTEGER NOT NULL DEFAULT 150 CHECK (swap_fee_bps >= 0 AND swap_fee_bps <= 10000), -- 1.5% = 150 basis points
  graduation_threshold_sol BIGINT NOT NULL CHECK (graduation_threshold_sol > 0),
  
  migration_fee_sol BIGINT NOT NULL DEFAULT 2500000000 CHECK (migration_fee_sol >= 0), -- 2.5 SOL in lamports
  migration_fee_tx_hash TEXT,
  migration_fee_verified BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Status Lifecycle
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'DEPLOYING', 'LIVE', 'GRADUATING', 'GRADUATED', 'FAILED')),
  failure_reason TEXT,
  
  -- DEX Migration
  target_dex TEXT CHECK (target_dex IN ('RAYDIUM', 'ORCA')),
  dex_pool_address TEXT, -- DEX LP pool address after graduation
  migration_tx_hash TEXT,
  
  -- Integration with FASE 5 (LP Lock)
  lp_lock_id UUID REFERENCES liquidity_locks(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deployed_at TIMESTAMPTZ,
  graduated_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT bonding_pools_status_transition CHECK (
    (status = 'DRAFT' AND deployed_at IS NULL) OR
    (status IN ('DEPLOYING', 'LIVE', 'GRADUATING', 'GRADUATED') AND deployed_at IS NOT NULL) OR
    (status = 'FAILED' AND failure_reason IS NOT NULL)
  ),
  CONSTRAINT bonding_pools_graduation CHECK (
    (status = 'GRADUATED' AND graduated_at IS NOT NULL AND lp_lock_id IS NOT NULL) OR
    (status != 'GRADUATED')
  )
);

-- Indexes for performance
CREATE INDEX idx_bonding_pools_project ON bonding_pools(project_id);
CREATE INDEX idx_bonding_pools_creator ON bonding_pools(creator_id);
CREATE INDEX idx_bonding_pools_status ON bonding_pools(status);
CREATE INDEX idx_bonding_pools_token_mint ON bonding_pools(token_mint);
CREATE INDEX idx_bonding_pools_graduation_threshold ON bonding_pools(actual_sol_reserves, graduation_threshold_sol) WHERE status = 'LIVE';

-- RLS Policies for bonding_pools
ALTER TABLE bonding_pools ENABLE ROW LEVEL SECURITY;

-- Users can view pools they created or public pools
CREATE POLICY bonding_pools_select ON bonding_pools
FOR SELECT USING (
  auth.uid() = creator_id OR
  status IN ('LIVE', 'GRADUATING', 'GRADUATED')
);

-- Users can insert pools (creator must be themselves)
CREATE POLICY bonding_pools_insert ON bonding_pools
FOR INSERT WITH CHECK (
  auth.uid() = creator_id
);

-- Users can update their own pools (but not status - only workers can)
CREATE POLICY bonding_pools_update ON bonding_pools
FOR UPDATE USING (
  auth.uid() = creator_id AND
  status = 'DRAFT' -- Only draft pools can be edited by users
);

-- Service role can do anything (for workers)
CREATE POLICY bonding_pools_service_role ON bonding_pools
FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- TABLE 2: bonding_swaps
-- =====================================================
-- Purpose: Record all buy/sell swaps on bonding curve

CREATE TABLE bonding_swaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES bonding_pools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  
  -- Swap Details
  swap_type TEXT NOT NULL CHECK (swap_type IN ('BUY', 'SELL')),
  input_amount BIGINT NOT NULL CHECK (input_amount > 0), -- SOL (buy) or tokens (sell) in base units
  output_amount BIGINT NOT NULL CHECK (output_amount > 0), -- Tokens (buy) or SOL (sell) in base units
  price_per_token BIGINT NOT NULL CHECK (price_per_token > 0), -- Price at execution (lamports per token with decimals)
  
  -- Fees (1.5% of input)
  swap_fee_amount BIGINT NOT NULL CHECK (swap_fee_amount >= 0),
  treasury_fee BIGINT NOT NULL CHECK (treasury_fee >= 0), -- 50% of swap_fee
  referral_pool_fee BIGINT NOT NULL CHECK (referral_pool_fee >= 0), -- 50% of swap_fee
  
  -- On-chain Verification
  tx_hash TEXT NOT NULL UNIQUE,
  signature_verified BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Referral Attribution
  referrer_id UUID REFERENCES profiles(user_id),
  
  -- Reserves Snapshot (for audit)
  sol_reserves_before BIGINT NOT NULL,
  token_reserves_before BIGINT NOT NULL,
  sol_reserves_after BIGINT NOT NULL,
  token_reserves_after BIGINT NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT bonding_swaps_fee_split CHECK (
    treasury_fee + referral_pool_fee = swap_fee_amount
  )
);

-- Indexes
CREATE INDEX idx_bonding_swaps_pool ON bonding_swaps(pool_id, created_at DESC);
CREATE INDEX idx_bonding_swaps_user ON bonding_swaps(user_id, created_at DESC);
CREATE INDEX idx_bonding_swaps_tx ON bonding_swaps(tx_hash);
CREATE INDEX idx_bonding_swaps_referrer ON bonding_swaps(referrer_id) WHERE referrer_id IS NOT NULL;

-- RLS Policies
ALTER TABLE bonding_swaps ENABLE ROW LEVEL SECURITY;

-- Users can view swaps for pools they can see
CREATE POLICY bonding_swaps_select ON bonding_swaps
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM bonding_pools
    WHERE bonding_pools.id = bonding_swaps.pool_id
    AND (bonding_pools.status IN ('LIVE', 'GRADUATING', 'GRADUATED') OR bonding_pools.creator_id = auth.uid())
  )
);

-- Service role only can insert (via API after tx verification)
CREATE POLICY bonding_swaps_insert ON bonding_swaps
FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Service role can do anything
CREATE POLICY bonding_swaps_service_role ON bonding_swaps
FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- TABLE 3: bonding_events
-- =====================================================
-- Purpose: Comprehensive audit log for all bonding pool events

CREATE TABLE bonding_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES bonding_pools(id) ON DELETE CASCADE,
  
  event_type TEXT NOT NULL CHECK (event_type IN (
    'POOL_CREATED',
    'DEPLOY_INTENT_GENERATED',
    'DEPLOY_FEE_PAID',
    'DEPLOY_STARTED',
    'DEPLOY_CONFIRMED',
    'DEPLOY_FAILED',
    'SWAP_EXECUTED',
    'GRADUATION_THRESHOLD_REACHED',
    'GRADUATION_STARTED',
    'MIGRATION_INTENT_GENERATED',
    'MIGRATION_FEE_PAID',
    'MIGRATION_COMPLETED',
    'MIGRATION_FAILED',
    'LP_LOCK_CREATED',
    'STATUS_CHANGED',
    'POOL_PAUSED',
    'POOL_RESUMED',
    'POOL_FAILED'
  )),
  
  event_data JSONB NOT NULL DEFAULT '{}', -- Flexible metadata storage
  triggered_by UUID REFERENCES profiles(user_id), -- NULL for system events
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bonding_events_pool ON bonding_events(pool_id, created_at DESC);
CREATE INDEX idx_bonding_events_type ON bonding_events(event_type);
CREATE INDEX idx_bonding_events_triggered_by ON bonding_events(triggered_by) WHERE triggered_by IS NOT NULL;

-- RLS Policies
ALTER TABLE bonding_events ENABLE ROW LEVEL SECURITY;

-- Users can view events for pools they can see
CREATE POLICY bonding_events_select ON bonding_events
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM bonding_pools
    WHERE bonding_pools.id = bonding_events.pool_id
    AND (bonding_pools.status IN ('LIVE', 'GRADUATING', 'GRADUATED') OR bonding_pools.creator_id = auth.uid())
  )
);

-- Service role only can insert
CREATE POLICY bonding_events_insert ON bonding_events
FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Service role can do anything
CREATE POLICY bonding_events_service_role ON bonding_events
FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- TABLE 4: dex_migrations
-- =====================================================
-- Purpose: Track DEX migration process and LP lock creation

CREATE TABLE dex_migrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES bonding_pools(id) ON DELETE CASCADE,
  
  -- Migration Details
  target_dex TEXT NOT NULL CHECK (target_dex IN ('RAYDIUM', 'ORCA')),
  sol_migrated BIGINT NOT NULL CHECK (sol_migrated > 0),
  tokens_migrated BIGINT NOT NULL CHECK (tokens_migrated > 0),
  
  -- Fees
  migration_fee_paid BIGINT NOT NULL CHECK (migration_fee_paid >= 0),
  migration_fee_tx_hash TEXT,
  
  -- DEX Pool Creation
  dex_pool_address TEXT NOT NULL,
  creation_tx_hash TEXT NOT NULL,
  
  -- LP Lock Integration (FASE 5)
  lp_token_mint TEXT NOT NULL,
  lp_amount_locked BIGINT NOT NULL CHECK (lp_amount_locked > 0),
  lp_lock_id UUID REFERENCES liquidity_locks(id),
  lp_lock_duration_months INTEGER NOT NULL CHECK (lp_lock_duration_months >= 12), -- Minimum 12 months
  
  -- Status
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
  failure_reason TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT dex_migrations_completed CHECK (
    (status = 'COMPLETED' AND completed_at IS NOT NULL AND lp_lock_id IS NOT NULL) OR
    (status != 'COMPLETED')
  ),
  CONSTRAINT dex_migrations_failed CHECK (
    (status = 'FAILED' AND failure_reason IS NOT NULL) OR
    (status != 'FAILED')
  )
);

-- Indexes
CREATE INDEX idx_dex_migrations_pool ON dex_migrations(pool_id);
CREATE INDEX idx_dex_migrations_status ON dex_migrations(status);
CREATE INDEX idx_dex_migrations_lp_lock ON dex_migrations(lp_lock_id) WHERE lp_lock_id IS NOT NULL;

-- RLS Policies
ALTER TABLE dex_migrations ENABLE ROW LEVEL SECURITY;

-- Users can view migrations for pools they can see
CREATE POLICY dex_migrations_select ON dex_migrations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM bonding_pools
    WHERE bonding_pools.id = dex_migrations.pool_id
    AND (bonding_pools.status IN ('GRADUATING', 'GRADUATED') OR bonding_pools.creator_id = auth.uid())
  )
);

-- Service role only can insert/update
CREATE POLICY dex_migrations_insert ON dex_migrations
FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY dex_migrations_update ON dex_migrations
FOR UPDATE USING (auth.jwt()->>'role' = 'service_role');

-- Service role can do anything
CREATE POLICY dex_migrations_service_role ON dex_migrations
FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update bonding_pools.updated_at on modification
CREATE TRIGGER update_bonding_pools_updated_at
BEFORE UPDATE ON bonding_pools
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- EXTEND FASE 6: fee_splits
-- =====================================================
-- Add BONDING_SWAP as source_type

-- Note: This is just documentation, actual enum extension happens via migration
-- ALTER TYPE fee_split_source_type ADD VALUE IF NOT EXISTS 'BONDING_SWAP';

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to automatically create bonding_event on status change
CREATE OR REPLACE FUNCTION create_bonding_status_event()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO bonding_events (pool_id, event_type, event_data)
    VALUES (
      NEW.id,
      'STATUS_CHANGED',
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'changed_at', NOW()
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bonding_pools_status_change_event
AFTER UPDATE ON bonding_pools
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION create_bonding_status_event();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE bonding_pools IS 'Solana bonding curve pools with status lifecycle tracking';
COMMENT ON TABLE bonding_swaps IS 'All buy/sell swaps on bonding curves with fee split (1.5% → 50% Treasury / 50% Referral Pool)';
COMMENT ON TABLE bonding_events IS 'Comprehensive audit log for all bonding pool events';
COMMENT ON TABLE dex_migrations IS 'DEX migration tracking with LP lock integration (FASE 5)';

COMMENT ON COLUMN bonding_pools.virtual_sol_reserves IS 'Virtual SOL reserves for constant-product AMM formula';
COMMENT ON COLUMN bonding_pools.virtual_token_reserves IS 'Virtual token reserves for constant-product AMM formula';
COMMENT ON COLUMN bonding_pools.actual_sol_reserves IS 'Real SOL collected from swaps (used for graduation threshold)';
COMMENT ON COLUMN bonding_pools.swap_fee_bps IS 'Swap fee in basis points (150 = 1.5%)';
COMMENT ON COLUMN bonding_swaps.treasury_fee IS '50% of swap fee goes to Treasury';
COMMENT ON COLUMN bonding_swaps.referral_pool_fee IS '50% of swap fee goes to Referral Pool';
COMMENT ON COLUMN dex_migrations.lp_lock_duration_months IS 'LP lock duration in months (minimum 12 enforced)';

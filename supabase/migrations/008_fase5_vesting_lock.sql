-- Migration 008: FASE 5 - Vesting & Liquidity Lock
-- Anti-Rug Layer: Ensures tokens and liquidity are locked before project success

-- ============================================================================
-- TABLE: vesting_schedules
-- Purpose: Vesting configuration per round (TGE, cliff, linear vesting)
-- ============================================================================
CREATE TABLE IF NOT EXISTS vesting_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES launch_rounds(id) ON DELETE CASCADE,
  
  -- Token info
  token_address TEXT NOT NULL,
  chain TEXT NOT NULL,
  total_tokens NUMERIC(78, 0) NOT NULL CHECK (total_tokens > 0),
  
  -- Vesting parameters
  tge_percentage INTEGER NOT NULL CHECK (tge_percentage >= 0 AND tge_percentage <= 100),
  tge_at TIMESTAMPTZ NOT NULL, -- Token Generation Event timestamp
  
  cliff_months INTEGER NOT NULL DEFAULT 0 CHECK (cliff_months >= 0),
  vesting_months INTEGER NOT NULL CHECK (vesting_months >= 0),
  interval_type TEXT NOT NULL CHECK (interval_type IN ('DAILY', 'MONTHLY')),
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'FAILED', 'PAUSED')),
  contract_address TEXT, -- Vesting contract address (if deployed)
  deployment_tx_hash TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  UNIQUE(round_id), -- One vesting schedule per round
  CHECK (tge_percentage + (CASE WHEN vesting_months > 0 THEN 1 ELSE 0 END) <= 100) -- TGE + vesting must not exceed 100%
);

-- Indexes
CREATE INDEX idx_vesting_schedules_round ON vesting_schedules(round_id);
CREATE INDEX idx_vesting_schedules_status ON vesting_schedules(status);
CREATE INDEX idx_vesting_schedules_chain ON vesting_schedules(chain);

-- ============================================================================
-- TABLE: vesting_allocations
-- Purpose: Individual user token allocations from vesting schedule
-- ============================================================================
CREATE TABLE IF NOT EXISTS vesting_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES vesting_schedules(id) ON DELETE CASCADE,
  round_id UUID NOT NULL REFERENCES launch_rounds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Allocation amounts
  allocation_tokens NUMERIC(78, 0) NOT NULL CHECK (allocation_tokens > 0),
  claimed_tokens NUMERIC(78, 0) NOT NULL DEFAULT 0 CHECK (claimed_tokens >= 0),
  
  -- Claim tracking
  last_claim_at TIMESTAMPTZ,
  total_claims INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(schedule_id, user_id), -- One allocation per user per schedule
  CHECK (claimed_tokens <= allocation_tokens) -- Cannot claim more than allocated
);

-- Indexes
CREATE INDEX idx_vesting_allocations_schedule ON vesting_allocations(schedule_id);
CREATE INDEX idx_vesting_allocations_user ON vesting_allocations(user_id);
CREATE INDEX idx_vesting_allocations_round ON vesting_allocations(round_id);

-- ============================================================================
-- TABLE: vesting_claims
-- Purpose: Claim transaction history for audit and idempotency
-- ============================================================================
CREATE TABLE IF NOT EXISTS vesting_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  allocation_id UUID NOT NULL REFERENCES vesting_allocations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Claim details
  claim_amount NUMERIC(78, 0) NOT NULL CHECK (claim_amount > 0),
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Transaction info
  chain TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'FAILED')),
  
  -- Idempotency protection
  idempotency_key TEXT NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(idempotency_key) -- Prevent duplicate claims
);

-- Indexes
CREATE INDEX idx_vesting_claims_allocation ON vesting_claims(allocation_id);
CREATE INDEX idx_vesting_claims_user ON vesting_claims(user_id);
CREATE INDEX idx_vesting_claims_status ON vesting_claims(status);
CREATE INDEX idx_vesting_claims_tx_hash ON vesting_claims(tx_hash) WHERE tx_hash IS NOT NULL;
CREATE INDEX idx_vesting_claims_idempotency ON vesting_claims(idempotency_key);

-- ============================================================================
-- TABLE: liquidity_locks
-- Purpose: Liquidity lock records (12+ month minimum)
-- ============================================================================
CREATE TABLE IF NOT EXISTS liquidity_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES launch_rounds(id) ON DELETE CASCADE,
  
  -- DEX and token info
  chain TEXT NOT NULL,
  dex_type TEXT NOT NULL CHECK (dex_type IN ('UNISWAP_V2', 'PANCAKE', 'RAYDIUM', 'ORCA', 'OTHER')),
  lp_token_address TEXT NOT NULL,
  lock_amount NUMERIC(78, 0) NOT NULL CHECK (lock_amount > 0),
  
  -- Lock duration (MINIMUM 12 months enforced)
  locked_at TIMESTAMPTZ,
  locked_until TIMESTAMPTZ,
  lock_duration_months INTEGER NOT NULL CHECK (lock_duration_months >= 12), -- HARD REQUIREMENT
  
  -- Lock contract info
  locker_contract_address TEXT,
  lock_tx_hash TEXT,
  lock_id TEXT, -- External locker contract's lock ID
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'LOCKED', 'UNLOCKED', 'FAILED')),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CHECK (locked_until IS NULL OR locked_until > locked_at), -- Unlock must be after lock
  CHECK (locked_until IS NULL OR locked_until >= locked_at + INTERVAL '12 months') -- Minimum 12 months
);

-- Indexes
CREATE INDEX idx_liquidity_locks_round ON liquidity_locks(round_id);
CREATE INDEX idx_liquidity_locks_status ON liquidity_locks(status);
CREATE INDEX idx_liquidity_locks_chain ON liquidity_locks(chain);
CREATE INDEX idx_liquidity_locks_tx_hash ON liquidity_locks(lock_tx_hash) WHERE lock_tx_hash IS NOT NULL;

-- ============================================================================
-- TABLE: round_post_finalize
-- Purpose: Track orchestration progress after round finalization
-- ============================================================================
CREATE TABLE IF NOT EXISTS round_post_finalize (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES launch_rounds(id) ON DELETE CASCADE,
  
  -- Progress tracking
  vesting_setup_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (vesting_setup_status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED')),
  vesting_setup_at TIMESTAMPTZ,
  vesting_setup_error TEXT,
  
  lock_setup_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (lock_setup_status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED')),
  lock_setup_at TIMESTAMPTZ,
  lock_setup_error TEXT,
  
  -- Retry tracking
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_retry_at TIMESTAMPTZ,
  last_error TEXT,
  
  -- Completion
  completed_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(round_id) -- One progress tracker per round
);

-- Indexes
CREATE INDEX idx_round_post_finalize_round ON round_post_finalize(round_id);
CREATE INDEX idx_round_post_finalize_vesting_status ON round_post_finalize(vesting_setup_status);
CREATE INDEX idx_round_post_finalize_lock_status ON round_post_finalize(lock_setup_status);

-- ============================================================================
-- EXTEND: launch_rounds table
-- Purpose: Add vesting and lock status columns for success gating
-- ============================================================================
ALTER TABLE launch_rounds 
  ADD COLUMN IF NOT EXISTS vesting_status TEXT DEFAULT 'NONE' CHECK (vesting_status IN ('NONE', 'PENDING', 'CONFIRMED', 'FAILED')),
  ADD COLUMN IF NOT EXISTS lock_status TEXT DEFAULT 'NONE' CHECK (lock_status IN ('NONE', 'PENDING', 'LOCKED', 'FAILED')),
  ADD COLUMN IF NOT EXISTS success_gated_at TIMESTAMPTZ;

-- Index for success gating queries
CREATE INDEX idx_launch_rounds_success_gates ON launch_rounds(vesting_status, lock_status);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vesting_schedules_updated_at BEFORE UPDATE ON vesting_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vesting_allocations_updated_at BEFORE UPDATE ON vesting_allocations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vesting_claims_updated_at BEFORE UPDATE ON vesting_claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_liquidity_locks_updated_at BEFORE UPDATE ON liquidity_locks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_round_post_finalize_updated_at BEFORE UPDATE ON round_post_finalize
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION: Auto-mark round as SUCCESS when all gates pass
-- ============================================================================
CREATE OR REPLACE FUNCTION check_and_mark_round_success()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if all three gates are passed
  IF NEW.result = 'SUCCESS' 
     AND NEW.vesting_status = 'CONFIRMED' 
     AND NEW.lock_status = 'LOCKED'
     AND NEW.success_gated_at IS NULL THEN
    
    -- Mark round as successfully gated
    NEW.success_gated_at = NOW();
    
    -- TODO: Trigger badge awards and other success actions
    -- This would typically be done by a worker job listening to this event
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_round_success 
  BEFORE UPDATE ON launch_rounds
  FOR EACH ROW 
  WHEN (NEW.vesting_status IS DISTINCT FROM OLD.vesting_status 
        OR NEW.lock_status IS DISTINCT FROM OLD.lock_status
        OR NEW.result IS DISTINCT FROM OLD.result)
  EXECUTE FUNCTION check_and_mark_round_success();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE vesting_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE vesting_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vesting_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE liquidity_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_post_finalize ENABLE ROW LEVEL SECURITY;

-- Vesting Schedules: Public read for approved rounds, admin write
CREATE POLICY vesting_schedules_public_read ON vesting_schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM launch_rounds lr
      WHERE lr.id = vesting_schedules.round_id
        AND lr.status IN ('LIVE', 'ENDED', 'FINALIZED')
    )
  );

-- TODO: Replace with proper FASE 2 admin check when available
CREATE POLICY vesting_schedules_admin_all ON vesting_schedules
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Vesting Allocations: Users see own, admins see all
CREATE POLICY vesting_allocations_own_read ON vesting_allocations
  FOR SELECT USING (user_id = auth.uid());

-- TODO: Replace with proper FASE 2 admin check when available
CREATE POLICY vesting_allocations_admin_all ON vesting_allocations
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Vesting Claims: Users see own, admins see all
CREATE POLICY vesting_claims_own_read ON vesting_claims
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY vesting_claims_own_insert ON vesting_claims
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- TODO: Replace with proper FASE 2 admin check when available
CREATE POLICY vesting_claims_admin_all ON vesting_claims
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Liquidity Locks: Public read, admin write
CREATE POLICY liquidity_locks_public_read ON liquidity_locks
  FOR SELECT USING (true); -- All locks are publicly visible for transparency

-- TODO: Replace with proper FASE 2 admin check when available
CREATE POLICY liquidity_locks_admin_all ON liquidity_locks
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Round Post Finalize: Admin only
-- TODO: Replace with proper FASE 2 admin check when available
CREATE POLICY round_post_finalize_admin_all ON round_post_finalize
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE vesting_schedules IS 'Vesting configuration for token distribution (TGE, cliff, linear vesting)';
COMMENT ON TABLE vesting_allocations IS 'Individual user token allocations from vesting schedule';
COMMENT ON TABLE vesting_claims IS 'Claim transaction history for audit trail and idempotency';
COMMENT ON TABLE liquidity_locks IS 'Liquidity lock records with 12-month minimum enforcement';
COMMENT ON TABLE round_post_finalize IS 'Orchestration progress tracker for post-finalization setup';

COMMENT ON COLUMN liquidity_locks.lock_duration_months IS 'HARD REQUIREMENT: Minimum 12 months enforced at database level';
COMMENT ON COLUMN vesting_schedules.tge_at IS 'Token Generation Event timestamp - defaults to round.finalized_at';
COMMENT ON COLUMN launch_rounds.success_gated_at IS 'Timestamp when all three success gates (round, vesting, lock) were passed';

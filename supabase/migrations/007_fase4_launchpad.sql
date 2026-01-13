-- Migration: 007_fase4_launchpad.sql
-- Created: 2026-01-13
-- Description: FASE 4 - Launchpad (Presale + Fairlaunch Pools)

-- ============================================
-- LAUNCH ROUNDS TABLE (Main Pool Configuration)
-- ============================================
CREATE TABLE launch_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Pool type
  type TEXT NOT NULL CHECK (type IN ('PRESALE', 'FAIRLAUNCH')),
  
  -- Chain and token info
  chain TEXT NOT NULL, -- EVM chain_id or 'SOLANA'
  token_address TEXT NOT NULL,
  raise_asset TEXT NOT NULL, -- USDC, ETH, SOL, BNB, etc.
  
  -- Timing
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  
  -- Status flow: DRAFT -> SUBMITTED -> APPROVED -> LIVE -> ENDED -> FINALIZED
  status TEXT DEFAULT 'DRAFT' CHECK (status IN (
    'DRAFT', 'SUBMITTED', 'APPROVED', 'LIVE', 'ENDED', 'FINALIZED', 'REJECTED'
  )),
  
  -- Result after finalization
  result TEXT DEFAULT 'NONE' CHECK (result IN (
    'NONE', 'SUCCESS', 'FAILED', 'CANCELED'
  )),
  
  -- Gate snapshots (eligibility requirements from FASE 3)
  kyc_status_at_submit TEXT,
  scan_status_at_submit TEXT,
  
  -- Financial parameters (JSONB for flexibility between pool types)
  params JSONB NOT NULL DEFAULT '{}',
  -- PRESALE params: {price, hardcap, softcap, token_for_sale, min_contribution, max_contribution}
  -- FAIRLAUNCH params: {softcap, token_for_sale, final_price (null until finalized), listing_premium_bps}
  
  -- Denormalized totals (updated by triggers/workers)
  total_raised NUMERIC DEFAULT 0 CHECK (total_raised >= 0),
  total_participants INTEGER DEFAULT 0 CHECK (total_participants >= 0),
  
  -- Admin fields
  rejection_reason TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  finalized_by UUID REFERENCES auth.users(id),
  finalized_at TIMESTAMPTZ,
  
  -- Metadata
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Validation constraints
  CONSTRAINT valid_timing CHECK (end_at > start_at),
  CONSTRAINT valid_chain CHECK (
    chain ~ '^[0-9]+$' OR chain = 'SOLANA' -- EVM chain IDs are numeric strings
  )
);

COMMENT ON TABLE launch_rounds IS 'Main pool configuration for presale and fairlaunch rounds';
COMMENT ON COLUMN launch_rounds.type IS 'Pool type: PRESALE (fixed price) or FAIRLAUNCH (price discovery)';
COMMENT ON COLUMN launch_rounds.params IS 'Pool-specific JSON parameters';
COMMENT ON COLUMN launch_rounds.kyc_status_at_submit IS 'Snapshot of project KYC status when round submitted';
COMMENT ON COLUMN launch_rounds.scan_status_at_submit IS 'Snapshot of SC scan status when round submitted';

-- ============================================
-- CONTRIBUTIONS TABLE (User Participation)
-- ============================================
CREATE TABLE contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES launch_rounds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Wallet and transaction details
  wallet_address TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  chain TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  
  -- Link to transaction manager (if available)
  tx_id UUID, -- Can be NULL initially, updated by indexer
  
  -- Status tracking
  status TEXT DEFAULT 'PENDING' CHECK (status IN (
    'PENDING',    -- Initial state, waiting for confirmation
    'CONFIRMED',  -- Transaction confirmed on-chain
    'FAILED',     -- Transaction failed or invalid
    'REFUNDED'    -- Already refunded
  )),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  
  -- Unique constraints
  CONSTRAINT unique_tx_hash UNIQUE(chain, tx_hash),
  CONSTRAINT unique_round_tx UNIQUE(round_id, tx_id)
);

COMMENT ON TABLE contributions IS 'User contributions to launch rounds';
COMMENT ON COLUMN contributions.status IS 'Contribution lifecycle: PENDING -> CONFIRMED/FAILED/REFUNDED';

-- ============================================
-- ROUND ALLOCATIONS TABLE (Post-Finalization)
-- ============================================
CREATE TABLE round_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES launch_rounds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Financial details
  contributed_amount NUMERIC NOT NULL CHECK (contributed_amount >= 0),
  allocation_tokens NUMERIC NOT NULL CHECK (allocation_tokens >= 0),
  claimable_tokens NUMERIC DEFAULT 0 CHECK (claimable_tokens >= 0),
  refund_amount NUMERIC DEFAULT 0 CHECK (refund_amount >= 0),
  
  -- Claim status (for vesting integration in FASE 5)
  claim_status TEXT DEFAULT 'PENDING',
  refund_status TEXT DEFAULT 'NONE',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One allocation per user per round
  CONSTRAINT unique_round_user_allocation UNIQUE(round_id, user_id)
);

COMMENT ON TABLE round_allocations IS 'Final token allocations after round finalization';
COMMENT ON COLUMN round_allocations.contributed_amount IS 'Total amount user contributed';
COMMENT ON COLUMN round_allocations.allocation_tokens IS 'Total tokens allocated to user';
COMMENT ON COLUMN round_allocations.claimable_tokens IS 'Tokens available to claim (vesting)';
COMMENT ON COLUMN round_allocations.refund_amount IS 'Amount to refund (over-cap or failed round)';

-- ============================================
-- REFUNDS TABLE (Failed Rounds or Over-Cap)
-- ============================================
CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES launch_rounds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Refund details
  amount NUMERIC NOT NULL CHECK (amount > 0),
  status TEXT DEFAULT 'PENDING' CHECK (status IN (
    'PENDING',     -- Refund eligible, not yet processed
    'PROCESSING',  -- Transaction being prepared
    'COMPLETED',   -- Refund transaction confirmed
    'FAILED'       -- Refund transaction failed
  )),
  
  -- Transaction tracking
  tx_id UUID, -- Link to transaction manager
  tx_hash TEXT,
  chain TEXT,
  
  -- Idempotency protection
  idempotency_key TEXT UNIQUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- One refund per user per round
  CONSTRAINT unique_round_user_refund UNIQUE(round_id, user_id)
);

COMMENT ON TABLE refunds IS 'Refund tracking for failed rounds or over-cap scenarios';
COMMENT ON COLUMN refunds.status IS 'Refund lifecycle: PENDING -> PROCESSING -> COMPLETED/FAILED';
COMMENT ON COLUMN refunds.idempotency_key IS 'Prevents duplicate refund requests';

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Launch rounds indexes
CREATE INDEX idx_rounds_project ON launch_rounds(project_id);
CREATE INDEX idx_rounds_status ON launch_rounds(status);
CREATE INDEX idx_rounds_type ON launch_rounds(type);
CREATE INDEX idx_rounds_chain ON launch_rounds(chain);
CREATE INDEX idx_rounds_timing ON launch_rounds(start_at, end_at);
CREATE INDEX idx_rounds_result ON launch_rounds(result);
CREATE INDEX idx_rounds_created_by ON launch_rounds(created_by);

-- Contributions indexes
CREATE INDEX idx_contributions_round ON contributions(round_id);
CREATE INDEX idx_contributions_user ON contributions(user_id);
CREATE INDEX idx_contributions_status ON contributions(status);
CREATE INDEX idx_contributions_wallet ON contributions(wallet_address);
CREATE INDEX idx_contributions_chain_hash ON contributions(chain, tx_hash);

-- Allocations indexes
CREATE INDEX idx_allocations_round ON round_allocations(round_id);
CREATE INDEX idx_allocations_user ON round_allocations(user_id);
CREATE INDEX idx_allocations_claim_status ON round_allocations(claim_status);

-- Refunds indexes
CREATE INDEX idx_refunds_round ON refunds(round_id);
CREATE INDEX idx_refunds_user ON refunds(user_id);
CREATE INDEX idx_refunds_status ON refunds(status);
CREATE INDEX idx_refunds_idempotency ON refunds(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp on launch_rounds
CREATE TRIGGER update_rounds_updated_at 
  BEFORE UPDATE ON launch_rounds
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at timestamp on round_allocations
CREATE TRIGGER update_allocations_updated_at 
  BEFORE UPDATE ON round_allocations
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- ============================================

-- Function to increment round totals when contribution confirmed
CREATE OR REPLACE FUNCTION increment_round_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'CONFIRMED' AND (OLD.status IS NULL OR OLD.status != 'CONFIRMED') THEN
    -- Increment total_raised and total_participants
    UPDATE launch_rounds
    SET 
      total_raised = total_raised + NEW.amount,
      total_participants = total_participants + 1
    WHERE id = NEW.round_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_round_totals
  AFTER INSERT OR UPDATE ON contributions
  FOR EACH ROW
  EXECUTE FUNCTION increment_round_totals();

-- Function to decrement round totals when contribution refunded
CREATE OR REPLACE FUNCTION decrement_round_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'REFUNDED' AND OLD.status = 'CONFIRMED' THEN
    -- Decrement total_raised
    UPDATE launch_rounds
    SET 
      total_raised = total_raised - NEW.amount,
      total_participants = GREATEST(total_participants - 1, 0)
    WHERE id = NEW.round_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_round_totals
  AFTER UPDATE ON contributions
  FOR EACH ROW
  EXECUTE FUNCTION decrement_round_totals();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE launch_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- Public read for approved/live rounds
CREATE POLICY "Public can view approved rounds" ON launch_rounds
  FOR SELECT
  USING (status IN ('APPROVED', 'LIVE', 'ENDED', 'FINALIZED'));

-- Owners can view their own rounds
CREATE POLICY "Owners can view own rounds" ON launch_rounds
  FOR SELECT
  USING (created_by = auth.uid());

-- Owners can insert/update their own draft rounds
CREATE POLICY "Owners can manage own draft rounds" ON launch_rounds
  FOR ALL
  USING (created_by = auth.uid() AND status = 'DRAFT');

-- Users can view their own contributions
CREATE POLICY "Users can view own contributions" ON contributions
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert contributions (confirmation handled server-side)
CREATE POLICY "Users can create contributions" ON contributions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can view their own allocations
CREATE POLICY "Users can view own allocations" ON round_allocations
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can view their own refunds
CREATE POLICY "Users can view own refunds" ON refunds
  FOR SELECT
  USING (user_id = auth.uid());

-- Note: Admin policies will be handled via service role key bypass
-- All sensitive operations (approve, finalize, admin queries) use service role

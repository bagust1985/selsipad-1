-- Migration 009: FASE 6 - Social + Blue Check + Referral + AMA
-- Growth loop dengan fitur sosial ter-gating dan sistem referral anti-farming

-- ============================================================================
-- TABLE: posts (Social Feed Core)
-- Purpose: User-generated content dengan Blue Check gating
-- ============================================================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  
  -- Content
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 5000),
  type TEXT NOT NULL CHECK (type IN ('POST', 'REPLY', 'QUOTE', 'REPOST')),
  
  -- Threading & References
  parent_post_id UUID REFERENCES posts(id) ON DELETE CASCADE, -- For REPLY
  quoted_post_id UUID REFERENCES posts(id) ON DELETE SET NULL, -- For QUOTE
  reposted_post_id UUID REFERENCES posts(id) ON DELETE SET NULL, -- For REPOST
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Soft delete (admin moderation)
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CHECK (
    (type = 'POST' AND parent_post_id IS NULL AND quoted_post_id IS NULL AND reposted_post_id IS NULL) OR
    (type = 'REPLY' AND parent_post_id IS NOT NULL AND quoted_post_id IS NULL AND reposted_post_id IS NULL) OR
    (type = 'QUOTE' AND parent_post_id IS NULL AND quoted_post_id IS NOT NULL AND reposted_post_id IS NULL) OR
    (type = 'REPOST' AND parent_post_id IS NULL AND quoted_post_id IS NULL AND reposted_post_id IS NOT NULL)
  )
);

-- Indexes for posts
CREATE INDEX idx_posts_author ON posts(author_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_project ON posts(project_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_created ON posts(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_parent ON posts(parent_post_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_quoted ON posts(quoted_post_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_reposted ON posts(reposted_post_id) WHERE deleted_at IS NULL;

-- ============================================================================
-- TABLE: referral_relationships (PATCH Modul 10)
-- Purpose: Track referrer-referee relationships dengan activation status
-- ============================================================================
CREATE TABLE IF NOT EXISTS referral_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  
  -- Activation (NEW from patch) - set when referee makes first qualifying event
  activated_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(referrer_id, referee_id),
  CHECK (referrer_id != referee_id) -- Cannot refer yourself
);

-- Indexes for referral_relationships
CREATE INDEX idx_referral_referrer ON referral_relationships(referrer_id);
CREATE INDEX idx_referral_referee ON referral_relationships(referee_id);
CREATE INDEX idx_referral_code ON referral_relationships(code);
CREATE INDEX idx_referral_activated ON referral_relationships(activated_at) WHERE activated_at IS NOT NULL;

-- ============================================================================
-- TABLE: referral_ledger
-- Purpose: Track referral rewards from various sources
-- ============================================================================
CREATE TABLE IF NOT EXISTS referral_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Source of reward
  source_type TEXT NOT NULL CHECK (source_type IN ('PRESALE', 'FAIRLAUNCH', 'BONDING', 'BLUECHECK')),
  source_id UUID NOT NULL, -- contribution_id, swap_id, purchase_id, etc
  
  -- Reward details
  amount NUMERIC(78, 0) NOT NULL CHECK (amount > 0),
  asset TEXT NOT NULL, -- token address
  chain TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'CLAIMABLE' CHECK (status IN ('PENDING', 'CLAIMABLE', 'CLAIMED')),
  claimed_at TIMESTAMPTZ,
  claim_tx_hash TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicate rewards from same source
  UNIQUE(source_type, source_id)
);

-- Indexes for referral_ledger
CREATE INDEX idx_referral_ledger_referrer ON referral_ledger(referrer_id);
CREATE INDEX idx_referral_ledger_status ON referral_ledger(status);
CREATE INDEX idx_referral_ledger_chain ON referral_ledger(chain);
CREATE INDEX idx_referral_ledger_source ON referral_ledger(source_type, source_id);

-- ============================================================================
-- TABLE: fee_splits
-- Purpose: Track 70/30 fee distribution (Treasury vs Referral Pool)
-- ============================================================================
CREATE TABLE IF NOT EXISTS fee_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source of fees
  source_type TEXT NOT NULL CHECK (source_type IN ('PRESALE', 'FAIRLAUNCH', 'BONDING', 'BLUECHECK')),
  source_id UUID NOT NULL, -- contribution_id, swap_id, purchase_id, etc
  
  -- Fee amounts
  total_amount NUMERIC(78, 0) NOT NULL CHECK (total_amount > 0),
  treasury_amount NUMERIC(78, 0) NOT NULL CHECK (treasury_amount > 0), -- 70%
  referral_pool_amount NUMERIC(78, 0) NOT NULL CHECK (referral_pool_amount > 0), -- 30%
  
  -- Asset details
  asset TEXT NOT NULL,
  chain TEXT NOT NULL,
  
  -- Processing status
  processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicate splits from same source
  UNIQUE(source_type, source_id),
  
  -- Validate split percentages (70/30)
  CHECK (treasury_amount = (total_amount * 70) / 100),
  CHECK (referral_pool_amount = (total_amount * 30) / 100),
  CHECK (treasury_amount + referral_pool_amount = total_amount)
);

-- Indexes for fee_splits
CREATE INDEX idx_fee_splits_source ON fee_splits(source_type, source_id);
CREATE INDEX idx_fee_splits_processed ON fee_splits(processed) WHERE NOT processed;

-- ============================================================================
-- TABLE: bluecheck_purchases
-- Purpose: Track Blue Check purchase flow ($10 lifetime)
-- ============================================================================
CREATE TABLE IF NOT EXISTS bluecheck_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Pricing
  price_usd NUMERIC(10, 2) NOT NULL DEFAULT 10.00,
  
  -- Payment details
  payment_chain TEXT NOT NULL,
  payment_token TEXT NOT NULL, -- token address
  payment_amount NUMERIC(78, 0) NOT NULL CHECK (payment_amount > 0),
  payment_tx_hash TEXT,
  
  -- Status flow: INTENT -> PENDING -> CONFIRMED/FAILED
  status TEXT NOT NULL DEFAULT 'INTENT' CHECK (status IN ('INTENT', 'PENDING', 'CONFIRMED', 'FAILED')),
  
  -- Intent expiry (10 minutes)
  intent_expires_at TIMESTAMPTZ NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One purchase per user at a time
  UNIQUE(user_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- Indexes for bluecheck_purchases
CREATE INDEX idx_bluecheck_user ON bluecheck_purchases(user_id);
CREATE INDEX idx_bluecheck_status ON bluecheck_purchases(status);
CREATE INDEX idx_bluecheck_tx_hash ON bluecheck_purchases(payment_tx_hash) WHERE payment_tx_hash IS NOT NULL;

-- ============================================================================
-- TABLE: ama_sessions
-- Purpose: AMA live sessions (TEXT/VOICE/VIDEO)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ama_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Session details
  title TEXT NOT NULL CHECK (char_length(title) >= 5 AND char_length(title) <= 200),
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('TEXT', 'VOICE', 'VIDEO')),
  
  -- Status flow: SUBMITTED -> PAID -> APPROVED -> LIVE -> ENDED
  status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'PAID', 'APPROVED', 'LIVE', 'ENDED', 'CANCELLED')),
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  
  -- Payment
  payment_tx_hash TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CHECK (ended_at IS NULL OR ended_at > started_at),
  CHECK (started_at IS NULL OR started_at >= scheduled_at)
);

-- Indexes for ama_sessions
CREATE INDEX idx_ama_project ON ama_sessions(project_id);
CREATE INDEX idx_ama_host ON ama_sessions(host_id);
CREATE INDEX idx_ama_status ON ama_sessions(status);
CREATE INDEX idx_ama_scheduled ON ama_sessions(scheduled_at);

-- ============================================================================
-- TABLE: ama_join_tokens
-- Purpose: Secure join tokens untuk VOICE/VIDEO AMA (TTL 5-15 min)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ama_join_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ama_id UUID NOT NULL REFERENCES ama_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Token
  token TEXT NOT NULL UNIQUE,
  
  -- TTL enforcement
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CHECK (expires_at <= created_at + INTERVAL '15 minutes'), -- Max TTL 15 min
  CHECK (expires_at >= created_at + INTERVAL '5 minutes'),  -- Min TTL 5 min
  CHECK (used_at IS NULL OR used_at <= expires_at) -- Cannot use after expiry
);

-- Indexes for ama_join_tokens
CREATE INDEX idx_ama_tokens_ama ON ama_join_tokens(ama_id);
CREATE INDEX idx_ama_tokens_user ON ama_join_tokens(user_id);
CREATE INDEX idx_ama_tokens_token ON ama_join_tokens(token);
CREATE INDEX idx_ama_tokens_expires ON ama_join_tokens(expires_at) WHERE used_at IS NULL;

-- ============================================================================
-- EXTEND: profiles table
-- Purpose: Add active_referral_count for claim gating
-- ============================================================================
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS active_referral_count INTEGER NOT NULL DEFAULT 0 CHECK (active_referral_count >= 0);

CREATE INDEX idx_profiles_active_referrals ON profiles(active_referral_count) WHERE active_referral_count > 0;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_relationships_updated_at BEFORE UPDATE ON referral_relationships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_ledger_updated_at BEFORE UPDATE ON referral_ledger
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bluecheck_purchases_updated_at BEFORE UPDATE ON bluecheck_purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ama_sessions_updated_at BEFORE UPDATE ON ama_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE bluecheck_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE ama_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ama_join_tokens ENABLE ROW LEVEL SECURITY;

-- Posts: CRITICAL - Blue Check gating on INSERT
CREATE POLICY posts_public_read ON posts
  FOR SELECT USING (deleted_at IS NULL);

-- CRITICAL: Only Blue Check ACTIVE users can create posts
CREATE POLICY posts_bluecheck_insert ON posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
        AND p.bluecheck_status = 'ACTIVE'
    )
  );

-- Users can update/delete own posts (soft delete)
CREATE POLICY posts_own_update ON posts
  FOR UPDATE USING (author_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY posts_own_delete ON posts
  FOR DELETE USING (author_id = auth.uid());

-- TODO: Admin can delete any post (needs FASE 2 admin check)
CREATE POLICY posts_admin_all ON posts
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Referral Relationships: Users see own relationships
CREATE POLICY referral_relationships_own_read ON referral_relationships
  FOR SELECT USING (
    referrer_id = auth.uid() OR referee_id = auth.uid()
  );

CREATE POLICY referral_relationships_own_insert ON referral_relationships
  FOR INSERT WITH CHECK (referee_id = auth.uid());

-- TODO: Admin sees all (needs FASE 2 admin check)
CREATE POLICY referral_relationships_admin_all ON referral_relationships
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Referral Ledger: Users only see own rewards
CREATE POLICY referral_ledger_own_read ON referral_ledger
  FOR SELECT USING (referrer_id = auth.uid());

-- TODO: Admin sees all (needs FASE 2 admin check)
CREATE POLICY referral_ledger_admin_all ON referral_ledger
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Fee Splits: Admin only
CREATE POLICY fee_splits_admin_all ON fee_splits
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Blue Check Purchases: Users see own purchases
CREATE POLICY bluecheck_purchases_own_read ON bluecheck_purchases
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY bluecheck_purchases_own_insert ON bluecheck_purchases
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- TODO: Admin sees all (needs FASE 2 admin check)
CREATE POLICY bluecheck_purchases_admin_all ON bluecheck_purchases
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- AMA Sessions: Public read for APPROVED/LIVE, creator/admin manage
CREATE POLICY ama_sessions_public_read ON ama_sessions
  FOR SELECT USING (status IN ('APPROVED', 'LIVE', 'ENDED'));

CREATE POLICY ama_sessions_own_manage ON ama_sessions
  FOR ALL USING (host_id = auth.uid());

-- TODO: Admin manage all (needs FASE 2 admin check)
CREATE POLICY ama_sessions_admin_all ON ama_sessions
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- AMA Join Tokens: Users only see own tokens
CREATE POLICY ama_join_tokens_own_read ON ama_join_tokens
  FOR SELECT USING (user_id = auth.uid());

-- TODO: System creates tokens (needs service role)
CREATE POLICY ama_join_tokens_system_insert ON ama_join_tokens
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE posts IS 'User-generated content dengan Blue Check RLS gating';
COMMENT ON TABLE referral_relationships IS 'Referrer-referee relationships dengan activation tracking';
COMMENT ON TABLE referral_ledger IS 'Referral reward ledger (30% dari fee splits)';
COMMENT ON TABLE fee_splits IS '70/30 fee distribution (Treasury vs Referral Pool)';
COMMENT ON TABLE bluecheck_purchases IS 'Blue Check purchase flow ($10 lifetime)';
COMMENT ON TABLE ama_sessions IS 'AMA live sessions (TEXT/VOICE/VIDEO)';
COMMENT ON TABLE ama_join_tokens IS 'Secure join tokens dengan TTL enforcement';

COMMENT ON COLUMN referral_relationships.activated_at IS 'Set when referee makes first qualifying event (Presale/Fairlaunch/BlueCheck/Bonding)';
COMMENT ON COLUMN profiles.active_referral_count IS 'Count of activated referrals - required >= 1 for claim gating';
COMMENT ON COLUMN fee_splits.treasury_amount IS 'Always 70% of total_amount';
COMMENT ON COLUMN fee_splits.referral_pool_amount IS 'Always 30% of total_amount';
COMMENT ON COLUMN ama_join_tokens.expires_at IS 'TTL 5-15 minutes enforced at database level';

-- Migration: 001_core_tables.sql
-- Created: 2026-01-13
-- Description: Core tables for SELSIPAD (profiles, wallets, transactions, projects, audit logs)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  bluecheck_status TEXT DEFAULT 'NONE' CHECK (bluecheck_status IN ('NONE', 'PENDING', 'ACTIVE', 'VERIFIED', 'REVOKED')),
  privacy_hide_address BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'User profiles with Blue Check status and privacy settings';
COMMENT ON COLUMN profiles.bluecheck_status IS 'Blue Check verification status';
COMMENT ON COLUMN profiles.privacy_hide_address IS 'If true, hide wallet addresses from public view';

-- ============================================
-- WALLETS TABLE (Multi-wallet support)
-- ============================================
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chain TEXT NOT NULL, -- 'EVM_1', 'EVM_56', 'EVM_137', 'SOLANA', etc.
  address TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_chain_address UNIQUE(user_id, chain, address)
);

COMMENT ON TABLE wallets IS 'User wallet addresses with multi-chain and primary wallet support';

-- ============================================
-- WALLET LINK NONCES (Signature challenge for auth)
-- ============================================
CREATE TABLE wallet_link_nonces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  chain TEXT NOT NULL,
  nonce TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE wallet_link_nonces IS 'Nonces for wallet signature challenge (single-use, expire after 5 minutes)';

-- ============================================
-- TRANSACTIONS TABLE (Tx Manager tracking)
-- ============================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chain TEXT NOT NULL,
  tx_hash TEXT,
  type TEXT, -- 'CONTRIBUTE', 'CLAIM', 'LOCK', 'REFUND', 'DEPLOY', etc.
  status TEXT DEFAULT 'CREATED' CHECK (status IN ('CREATED', 'SUBMITTED', 'PENDING', 'CONFIRMED', 'FAILED')),
  user_id UUID REFERENCES auth.users(id),
  project_id UUID,
  round_id UUID,
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
  
  -- Indexes will enforce uniqueness where needed
);

COMMENT ON TABLE transactions IS 'Transaction tracking for Tx Manager (multi-chain)';
COMMENT ON COLUMN transactions.status IS 'CREATED -> SUBMITTED -> PENDING -> CONFIRMED/FAILED';

-- ============================================
-- PROJECTS TABLE (basic structure)
-- ============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  symbol TEXT,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  website TEXT,
  twitter TEXT,
  telegram TEXT,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'LIVE', 'ENDED')),
  chains_supported TEXT[] DEFAULT '{}', -- ['EVM_56', 'SOLANA']
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE projects IS 'Project listings (will expand in FASE 3 with KYC, scan, etc)';

-- ============================================
-- AUDIT LOGS TABLE (append-only for admin actions)
-- ============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  before_data JSONB,
  after_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  trace_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE audit_logs IS 'Append-only audit log for admin actions (no UPDATE/DELETE allowed)';

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_username ON profiles(username);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_address ON wallets(address);
CREATE INDEX idx_wallets_chain ON wallets(chain);

-- Partial unique index: only one primary wallet per chain per user
CREATE UNIQUE INDEX idx_wallets_unique_primary_per_chain 
  ON wallets(user_id, chain) 
  WHERE is_primary = TRUE;

CREATE INDEX idx_nonces_nonce ON wallet_link_nonces(nonce);
CREATE INDEX idx_nonces_expires ON wallet_link_nonces(expires_at);

CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_chain ON transactions(chain);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);

-- Partial unique index: one tx_hash per chain (when tx_hash is not null)
CREATE UNIQUE INDEX idx_transactions_unique_chain_tx_hash 
  ON transactions(chain, tx_hash) 
  WHERE tx_hash IS NOT NULL;

CREATE INDEX idx_projects_owner ON projects(owner_user_id);
CREATE INDEX idx_projects_status ON projects(status);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_admin_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Prevent audit_logs deletion/update (append-only)
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are append-only. Modifications not allowed.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_audit_log_update BEFORE UPDATE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

CREATE TRIGGER prevent_audit_log_delete BEFORE DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

-- Add chain tracking to contributions and referral ledger
-- This enables multi-chain contribution and reward tracking
-- Phase 1 of Multi-Chain Implementation

-- ==============================================
-- CONTRIBUTIONS TABLE
-- ==============================================

-- Add chain column to contributions table
ALTER TABLE contributions 
ADD COLUMN IF NOT EXISTS chain text NOT NULL DEFAULT 'BSC';

-- Add comment
COMMENT ON COLUMN contributions.chain IS 'Blockchain where contribution was made (BSC, ETHEREUM, SOLANA, etc.)';

-- Create indexes for chain-based queries
CREATE INDEX IF NOT EXISTS idx_contributions_chain ON contributions(chain);
CREATE INDEX IF NOT EXISTS idx_contributions_user_chain ON contributions(user_id, chain);

-- ==============================================
-- REFERRAL LEDGER TABLE
-- ==============================================

-- Add chain column to referral_ledger table
ALTER TABLE referral_ledger 
ADD COLUMN IF NOT EXISTS chain text NOT NULL DEFAULT 'BSC';

-- Add comment
COMMENT ON COLUMN referral_ledger.chain IS 'Blockchain where reward is claimable (BSC, ETHEREUM, SOLANA, etc.)';

-- Create indexes for chain-based queries
CREATE INDEX IF NOT EXISTS idx_referral_ledger_chain ON referral_ledger(chain);
CREATE INDEX IF NOT EXISTS idx_referral_ledger_referrer_chain ON referral_ledger(referrer_id, chain);

-- ==============================================
-- NOTES
-- ==============================================

-- Future contributions will be recorded with correct chain from round/project data
-- Referral rewards will inherit chain from the contribution that triggered them
-- Default 'BSC' is used for backward compatibility with existing records

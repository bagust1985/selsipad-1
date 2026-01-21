-- Migration: Add wallet_id to auth_sessions for direct wallet tracking
-- Purpose: Enable wallet-isolated sessions and proper wallet switching

-- ============================================
-- Add wallet_id column to auth_sessions
-- ============================================
ALTER TABLE auth_sessions 
  ADD COLUMN IF NOT EXISTS wallet_id UUID;

-- ============================================
-- Add foreign key constraint
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_auth_sessions_wallet_id'
  ) THEN
    ALTER TABLE auth_sessions
      ADD CONSTRAINT fk_auth_sessions_wallet_id
      FOREIGN KEY (wallet_id)
      REFERENCES wallets(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================
-- Create index for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_auth_sessions_wallet_id ON auth_sessions(wallet_id);

-- ============================================
-- Backfill existing sessions (one-time migration)
-- ============================================
UPDATE auth_sessions 
SET wallet_id = (
  SELECT id FROM wallets 
  WHERE wallets.address = auth_sessions.wallet_address 
    AND wallets.chain = auth_sessions.chain 
  LIMIT 1
)
WHERE wallet_id IS NULL;

-- ============================================
-- Add function to invalidate other wallet sessions
-- ============================================
CREATE OR REPLACE FUNCTION invalidate_other_wallet_sessions(
  p_user_id UUID,
  p_current_wallet_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete all sessions for this user except the current wallet
  DELETE FROM auth_sessions 
  WHERE wallet_id IN (
    SELECT id FROM wallets 
    WHERE user_id = p_user_id 
      AND id != p_current_wallet_id
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Comments for Documentation
-- ============================================
COMMENT ON COLUMN auth_sessions.wallet_id IS 'Direct reference to the wallet used for this session, enables wallet-isolated authentication';
COMMENT ON FUNCTION invalidate_other_wallet_sessions IS 'Invalidates all sessions for a user except the specified wallet, ensures single-wallet session isolation';

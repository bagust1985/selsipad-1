-- Migration: 007_wallet_only_auth.sql
-- Pure Wallet-Only Authentication System
-- Removes dependency on Supabase Auth email requirement

-- ============================================
-- Custom Auth Sessions Table
-- ============================================
CREATE TABLE IF NOT EXISTS auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  chain TEXT NOT NULL, -- 'SOLANA' or 'EVM_1', etc
  session_token TEXT NOT NULL UNIQUE,
  nonce TEXT, -- For future challenge-response auth
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP DEFAULT NOW(),
  
  -- Metadata
  user_agent TEXT,
  ip_address TEXT
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX idx_auth_sessions_token ON auth_sessions(session_token);
CREATE INDEX idx_auth_sessions_wallet ON auth_sessions(wallet_address, chain);
CREATE INDEX idx_auth_sessions_expires ON auth_sessions(expires_at);

-- ============================================
-- Cleanup Function for Expired Sessions
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM auth_sessions 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own sessions
CREATE POLICY "Users can view own sessions"
  ON auth_sessions
  FOR SELECT
  USING (
    wallet_address IN (
      SELECT address FROM wallets WHERE user_id = auth.uid()
    )
  );

-- Only system can insert/update/delete sessions
CREATE POLICY "System can manage sessions"
  ON auth_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT ON auth_sessions TO authenticated;
GRANT ALL ON auth_sessions TO service_role;

-- ============================================
-- Comments for Documentation
-- ============================================
COMMENT ON TABLE auth_sessions IS 'Custom authentication sessions using wallet addresses only, no email required';
COMMENT ON COLUMN auth_sessions.wallet_address IS 'Wallet address (normalized: lowercase for EVM, original for Solana)';
COMMENT ON COLUMN auth_sessions.chain IS 'Blockchain network identifier (SOLANA, EVM_1, etc)';
COMMENT ON COLUMN auth_sessions.session_token IS 'Secure random token stored in HTTP-only cookie';
COMMENT ON COLUMN auth_sessions.expires_at IS 'Session expiration timestamp (default 30 days)';

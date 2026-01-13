-- Migration: 003_admin_mfa.sql
-- Created: 2026-01-13
-- Description: MFA TOTP system for admin security

-- Extend profiles table for admin MFA
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mfa_secret_encrypted TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mfa_verified_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN profiles.mfa_enabled IS 'Whether MFA is enabled for this admin user';
COMMENT ON COLUMN profiles.mfa_secret_encrypted IS 'Encrypted TOTP secret';
COMMENT ON COLUMN profiles.is_admin IS 'Whether this user has admin privileges';

-- Recovery codes table (for account recovery if device lost)
CREATE TABLE admin_recovery_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recovery_codes_user ON admin_recovery_codes(user_id);
CREATE INDEX idx_recovery_codes_used ON admin_recovery_codes(used) WHERE NOT used;

COMMENT ON TABLE admin_recovery_codes IS 'Recovery codes for MFA account recovery (hashed, single-use)';

-- Admin sessions (optional: track active admin sessions)
CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  mfa_verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_sessions_user ON admin_sessions(user_id);
CREATE INDEX idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_active ON admin_sessions(expires_at) WHERE NOT revoked;

COMMENT ON TABLE admin_sessions IS 'Track active admin sessions for security monitoring';

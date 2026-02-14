-- Migration: Add security_badges column to launch_rounds
-- Purpose: Store auto-assigned security badges from GoPlus scan or factory tokens
-- Examples: ['SAFU', 'SC_PASS', 'NO_MINT', 'NO_HONEYPOT', 'NO_PAUSE', 'TAX_LOCKED']

ALTER TABLE launch_rounds 
ADD COLUMN IF NOT EXISTS security_badges TEXT[] DEFAULT '{}';

COMMENT ON COLUMN launch_rounds.security_badges IS 
'Array of security badge slugs automatically assigned based on token source and security scan results. Factory tokens get SAFU badge, scanned tokens get badges based on GoPlus API checks.';

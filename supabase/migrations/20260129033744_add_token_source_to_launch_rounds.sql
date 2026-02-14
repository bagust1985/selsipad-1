-- Migration: Add token_source column to launch_rounds
-- Purpose: Track whether token was created via TokenFactory or provided by user
-- Values: 'factory' (platform-created, auto-SAFU) or 'existing' (user-provided, requires scan)

ALTER TABLE launch_rounds 
ADD COLUMN IF NOT EXISTS token_source TEXT 
CHECK (token_source IN ('factory', 'existing'));

COMMENT ON COLUMN launch_rounds.token_source IS 
'Source of the token contract. ''factory'' = created via platform TokenFactory (auto-approved, SAFU badge). ''existing'' = user-provided existing contract (requires GoPlus security scan).';

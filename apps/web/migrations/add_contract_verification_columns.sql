-- Add verification status columns to launch_rounds table
-- Migration: add_contract_verification_columns

ALTER TABLE launch_rounds
ADD COLUMN IF NOT EXISTS fairlaunch_contract_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS token_contract_verified BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS vesting_contract_verified BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;

-- Add comments
COMMENT ON COLUMN launch_rounds.fairlaunch_contract_verified IS 'Whether Fairlaunch contract is verified on BSCScan';
COMMENT ON COLUMN launch_rounds.token_contract_verified IS 'Whether Token contract is verified on BSCScan (NULL if no platform token)';
COMMENT ON COLUMN launch_rounds.vesting_contract_verified IS 'Whether TeamVesting contract is verified on BSCScan (NULL if no vesting)';
COMMENT ON COLUMN launch_rounds.verified_at IS 'Timestamp when contracts were verified';

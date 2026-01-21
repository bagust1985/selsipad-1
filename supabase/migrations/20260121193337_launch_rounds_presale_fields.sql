-- Update launch_rounds table for presale integration
-- Adds fields for on-chain integration and merkle root storage

-- Add presale-specific columns
ALTER TABLE launch_rounds 
  ADD COLUMN IF NOT EXISTS chain_id INT DEFAULT 97,
  ADD COLUMN IF NOT EXISTS round_address TEXT,
  ADD COLUMN IF NOT EXISTS vesting_vault_address TEXT,
  ADD COLUMN IF NOT EXISTS schedule_salt TEXT,
  ADD COLUMN IF NOT EXISTS merkle_root TEXT,
  ADD COLUMN IF NOT EXISTS tge_timestamp BIGINT,
  ADD COLUMN IF NOT EXISTS total_raised NUMERIC,
  ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMPTZ;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_launch_rounds_round_address 
  ON launch_rounds(round_address) WHERE round_address IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_launch_rounds_chain 
  ON launch_rounds(chain_id);

COMMENT ON COLUMN launch_rounds.chain_id IS 'Blockchain chain ID (97 = BSC Testnet, 56 = BSC Mainnet)';
COMMENT ON COLUMN launch_rounds.round_address IS 'PresaleRound contract address';
COMMENT ON COLUMN launch_rounds.vesting_vault_address IS 'MerkleVesting contract address';
COMMENT ON COLUMN launch_rounds.merkle_root IS 'Merkle root for token allocations (set during finalization)';
COMMENT ON COLUMN launch_rounds.tge_timestamp IS 'Token Generation Event timestamp';

-- Create presale_merkle_proofs table
-- Stores merkle proofs for token allocations
-- SECURITY: Allocation stored as TEXT to avoid precision loss

CREATE TABLE IF NOT EXISTS presale_merkle_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID REFERENCES launch_rounds(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  allocation TEXT NOT NULL, -- Store as TEXT, not NUMERIC, to avoid precision loss
  proof JSONB NOT NULL, -- Array of hex strings: ["0x...", "0x..."]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT presale_merkle_proofs_unique UNIQUE(round_id, wallet_address)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_merkle_proofs_round 
  ON presale_merkle_proofs(round_id);

CREATE INDEX IF NOT EXISTS idx_merkle_proofs_wallet 
  ON presale_merkle_proofs(wallet_address);

-- RLS Policies
ALTER TABLE presale_merkle_proofs ENABLE ROW LEVEL SECURITY;

-- Public read (anyone can get their proof)
CREATE POLICY "Anyone can read merkle proofs"
  ON presale_merkle_proofs
  FOR SELECT
  USING (true);

-- Only service role can insert/update (admin API only)
CREATE POLICY "Service role can insert proofs"
  ON presale_merkle_proofs
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update proofs"
  ON presale_merkle_proofs
  FOR UPDATE
  USING (auth.role() = 'service_role');

COMMENT ON TABLE presale_merkle_proofs IS 
  'Merkle proofs for presale token allocations. Generated server-side only. Allocation stored as TEXT to prevent precision loss.';

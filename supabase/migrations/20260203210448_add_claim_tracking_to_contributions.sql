-- Add claim tracking columns to contributions table
ALTER TABLE contributions
ADD COLUMN claimed_at timestamptz,
ADD COLUMN claim_tx_hash text;

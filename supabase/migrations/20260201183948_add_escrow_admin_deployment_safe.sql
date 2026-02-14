-- Add escrow tracking columns
ALTER TABLE launch_rounds
ADD COLUMN IF NOT EXISTS escrow_tx_hash TEXT,
ADD COLUMN IF NOT EXISTS escrow_amount NUMERIC(78, 0),
ADD COLUMN IF NOT EXISTS creation_fee_paid NUMERIC(78, 0),
ADD COLUMN IF NOT EXISTS creation_fee_tx_hash TEXT;

-- Add admin deployment tracking
ALTER TABLE launch_rounds  
ADD COLUMN IF NOT EXISTS admin_deployer_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS deployed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS pause_reason TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_launch_rounds_escrow_tx ON launch_rounds(escrow_tx_hash);
CREATE INDEX IF NOT EXISTS idx_launch_rounds_admin_deployer ON launch_rounds(admin_deployer_id);
CREATE INDEX IF NOT EXISTS idx_launch_rounds_deployed_at ON launch_rounds(deployed_at);

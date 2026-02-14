-- Prevent duplicate token fairlaunch submissions

-- Partial unique index: one token address per chain for active rounds
CREATE UNIQUE INDEX IF NOT EXISTS idx_launch_rounds_unique_active_token
  ON launch_rounds(token_address, chain)
  WHERE status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'LIVE');

-- Comment
COMMENT ON INDEX idx_launch_rounds_unique_active_token IS 
  'Prevents duplicate fairlaunch submissions with same token address on same chain for active rounds';

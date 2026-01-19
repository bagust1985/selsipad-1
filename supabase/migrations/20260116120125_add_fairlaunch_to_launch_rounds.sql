-- Migration: Add fairlaunch support to launch_rounds
-- Created: 2026-01-16
-- Description: Add sale_type column to differentiate presale from fairlaunch

-- Add sale_type column
ALTER TABLE launch_rounds 
ADD COLUMN IF NOT EXISTS sale_type TEXT DEFAULT 'presale' 
CHECK (sale_type IN ('presale', 'fairlaunch'));

-- Add index for filtering
CREATE INDEX IF NOT EXISTS idx_launch_rounds_sale_type 
ON launch_rounds(sale_type);

-- Add comment
COMMENT ON COLUMN launch_rounds.sale_type IS 'Type of sale: presale (fixed price + hardcap) or fairlaunch (no hardcap, final price = total_raised / tokens_for_sale)';

-- For fairlaunch rounds, hardcap should be NULL
-- This is enforced at application level (not DB constraint to maintain flexibility)

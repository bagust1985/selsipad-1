-- Migration: Add performance indexes for fairlaunch queries
-- Purpose: Optimize queries for filtering by sale_type and searching by security badges

-- Index for filtering fairlaunch vs presale rounds
CREATE INDEX IF NOT EXISTS idx_launch_rounds_sale_type 
ON launch_rounds(sale_type);

-- GIN index for security badges array queries
CREATE INDEX IF NOT EXISTS idx_launch_rounds_security_badges 
ON launch_rounds USING GIN(security_badges);

-- Composite index for active fairlaunch rounds
CREATE INDEX IF NOT EXISTS idx_launch_rounds_fairlaunch_active 
ON launch_rounds(sale_type, status, start_at DESC) 
WHERE sale_type = 'fairlaunch' AND status IN ('UPCOMING', 'ACTIVE');

COMMENT ON INDEX idx_launch_rounds_sale_type IS 
'Optimizes queries filtering by presale vs fairlaunch';

COMMENT ON INDEX idx_launch_rounds_security_badges IS 
'Optimizes queries searching for specific security badges using array containment operators';

COMMENT ON INDEX idx_launch_rounds_fairlaunch_active IS 
'Optimizes homepage queries for active fairlaunch rounds sorted by start date';

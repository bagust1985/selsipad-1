-- =====================================================
-- FASE 7.6: Admin Pause Support
-- Migration 011
-- =====================================================
-- Description: Add 'PAUSED' to bonding_pools status check constraint
--              to support admin emergency pause functionality.
-- =====================================================

BEGIN;

-- 1. Drop existing status check constraint
-- Note: Constraint name is usually `bonding_pools_status_check` for inline checks
-- We verify existence or just try dropping.
ALTER TABLE bonding_pools DROP CONSTRAINT IF EXISTS bonding_pools_status_check;

-- 2. Add new check constraint with PAUSED included
ALTER TABLE bonding_pools ADD CONSTRAINT bonding_pools_status_check 
  CHECK (status IN ('DRAFT', 'DEPLOYING', 'LIVE', 'GRADUATING', 'GRADUATED', 'FAILED', 'PAUSED'));

-- 3. Update status transition constraint to handle PAUSED
-- Previous constraint:
--   CONSTRAINT bonding_pools_status_transition CHECK (
--     (status = 'DRAFT' AND deployed_at IS NULL) OR
--     (status IN ('DEPLOYING', 'LIVE', 'GRADUATING', 'GRADUATED') AND deployed_at IS NOT NULL) OR
--     (status = 'FAILED' AND failure_reason IS NOT NULL)
--   )

ALTER TABLE bonding_pools DROP CONSTRAINT IF EXISTS bonding_pools_status_transition;

ALTER TABLE bonding_pools ADD CONSTRAINT bonding_pools_status_transition CHECK (
  (status = 'DRAFT' AND deployed_at IS NULL) OR
  (status IN ('DEPLOYING', 'LIVE', 'GRADUATING', 'GRADUATED', 'PAUSED') AND deployed_at IS NOT NULL) OR
  (status = 'FAILED' AND failure_reason IS NOT NULL)
);

COMMIT;

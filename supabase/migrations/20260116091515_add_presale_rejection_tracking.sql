-- Migration: Add presale rejection tracking
-- Created: 2026-01-16
-- Description: Add fields to track admin review decisions (rejection reason, reviewer, timestamp)

-- Add rejection tracking columns
ALTER TABLE launch_rounds
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(user_id),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Add index for admin queries (filter by submitted status)
CREATE INDEX IF NOT EXISTS idx_launch_rounds_status_submitted 
  ON launch_rounds(status) 
  WHERE status = 'SUBMITTED_FOR_REVIEW';

-- Add index for reviewed presales
CREATE INDEX IF NOT EXISTS idx_launch_rounds_reviewed_by 
  ON launch_rounds(reviewed_by) 
  WHERE reviewed_by IS NOT NULL;

-- Add comments
COMMENT ON COLUMN launch_rounds.rejection_reason IS 'Admin rejection reason (visible to owner for resubmission)';
COMMENT ON COLUMN launch_rounds.reviewed_by IS 'Profile user_id of admin who approved/rejected this presale';
COMMENT ON COLUMN launch_rounds.reviewed_at IS 'Timestamp when admin made review decision';

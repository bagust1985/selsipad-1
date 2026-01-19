-- Migration: 20260118053000_sync_kyc_profile_to_badges.sql
-- Created: 2026-01-18
-- Description: Sync profiles.kyc_status to badge_instances (DEVELOPER_KYC_VERIFIED)
--              Fixes issue where users have verified KYC status but no badge

-- ============================================
-- 1. AWARD MISSING BADGES TO VERIFIED USERS
-- ============================================

-- Award DEVELOPER_KYC_VERIFIED badge to all users with verified KYC status
-- who don't already have the badge
INSERT INTO badge_instances (user_id, badge_id, awarded_at, awarded_by, award_reason)
SELECT 
  p.user_id,
  (SELECT id FROM badge_definitions WHERE badge_key = 'DEVELOPER_KYC_VERIFIED'),
  COALESCE(p.kyc_submitted_at, p.updated_at, NOW()),
  NULL, -- Auto-award, no specific admin
  'Synced from profiles.kyc_status'
FROM profiles p
WHERE p.kyc_status IN ('verified', 'VERIFIED', 'CONFIRMED')
AND NOT EXISTS (
  -- Don't create duplicates
  SELECT 1 FROM badge_instances bi
  JOIN badge_definitions bd ON bi.badge_id = bd.id
  WHERE bi.user_id = p.user_id
  AND bd.badge_key = 'DEVELOPER_KYC_VERIFIED'
);

-- ============================================
-- 2. CREATE TRIGGER FOR AUTOMATIC SYNC
-- ============================================

-- Function to auto-award DEVELOPER_KYC_VERIFIED badge when profile KYC status changes
CREATE OR REPLACE FUNCTION auto_award_dev_kyc_badge()
RETURNS TRIGGER AS $$
DECLARE
  dev_kyc_badge_id UUID;
BEGIN
  -- Only proceed if kyc_status changed to verified
  IF NEW.kyc_status IN ('verified', 'VERIFIED', 'CONFIRMED') 
     AND (OLD.kyc_status IS NULL OR OLD.kyc_status NOT IN ('verified', 'VERIFIED', 'CONFIRMED')) THEN
    
    -- Get DEVELOPER_KYC_VERIFIED badge ID
    SELECT id INTO dev_kyc_badge_id
    FROM badge_definitions
    WHERE badge_key = 'DEVELOPER_KYC_VERIFIED';

    -- Only insert if badge exists and user doesn't already have it
    IF dev_kyc_badge_id IS NOT NULL THEN
      INSERT INTO badge_instances (user_id, badge_id, awarded_at, awarded_by, award_reason)
      VALUES (NEW.user_id, dev_kyc_badge_id, NOW(), NULL, 'Auto-awarded from profile KYC verification')
      ON CONFLICT DO NOTHING; -- Avoid duplicates
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS trigger_auto_award_dev_kyc_badge ON profiles;

CREATE TRIGGER trigger_auto_award_dev_kyc_badge
  AFTER UPDATE OF kyc_status ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_award_dev_kyc_badge();

-- ============================================
-- 3. VERIFY SYNC
-- ============================================

-- Verification query (commented out - run manually to check):
-- Check users with verified KYC status and their badge status
/*
SELECT 
  p.user_id,
  p.username,
  p.kyc_status as profile_kyc_status,
  CASE 
    WHEN bi.id IS NOT NULL THEN 'HAS_BADGE'
    ELSE 'MISSING_BADGE'
  END as badge_status,
  bi.awarded_at,
  bi.awarded_by
FROM profiles p
LEFT JOIN badge_instances bi ON bi.user_id = p.user_id
LEFT JOIN badge_definitions bd ON bi.badge_id = bd.id AND bd.badge_key = 'DEVELOPER_KYC_VERIFIED'
WHERE p.kyc_status IN ('verified', 'VERIFIED', 'CONFIRMED')
ORDER BY p.user_id;
*/

COMMENT ON FUNCTION auto_award_dev_kyc_badge IS 'Automatically awards DEVELOPER_KYC_VERIFIED badge when profiles.kyc_status is set to verified';

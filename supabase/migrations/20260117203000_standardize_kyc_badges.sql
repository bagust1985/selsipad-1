-- Migration: 20260117203000_standardize_kyc_badges.sql
-- Created: 2026-01-17
-- Description: Cleanup duplicate KYC badges - keep only DEVELOPER_KYC_VERIFIED

-- ============================================
-- 1. MIGRATE EXISTING BADGE INSTANCES
-- ============================================

-- Migrate DEV_KYC_VERIFIED instances to DEVELOPER_KYC_VERIFIED
-- First, get the IDs of both badges
DO $$
DECLARE
  dev_kyc_id UUID;
  developer_kyc_id UUID;
BEGIN
  -- Get DEV_KYC_VERIFIED badge ID
  SELECT id INTO dev_kyc_id 
  FROM badge_definitions 
  WHERE badge_key = 'DEV_KYC_VERIFIED';

  -- Get DEVELOPER_KYC_VERIFIED badge ID
  SELECT id INTO developer_kyc_id 
  FROM badge_definitions 
  WHERE badge_key = 'DEVELOPER_KYC_VERIFIED';

  -- If both exist, migrate instances
  IF dev_kyc_id IS NOT NULL AND developer_kyc_id IS NOT NULL THEN
    -- Update badge_instances to point to DEVELOPER_KYC_VERIFIED
    UPDATE badge_instances
    SET badge_id = developer_kyc_id
    WHERE badge_id = dev_kyc_id
    AND NOT EXISTS (
      -- Avoid duplicates: only migrate if user doesn't already have DEVELOPER_KYC_VERIFIED
      SELECT 1 FROM badge_instances bi2
      WHERE bi2.user_id = badge_instances.user_id
      AND bi2.badge_id = developer_kyc_id
    );

    -- Delete any remaining DEV_KYC_VERIFIED instances (duplicates)
    DELETE FROM badge_instances
    WHERE badge_id = dev_kyc_id;
  END IF;
END $$;

-- Migrate KYC_VERIFIED instances to DEVELOPER_KYC_VERIFIED
DO $$
DECLARE
  kyc_id UUID;
  developer_kyc_id UUID;
BEGIN
  -- Get KYC_VERIFIED badge ID
  SELECT id INTO kyc_id 
  FROM badge_definitions 
  WHERE badge_key = 'KYC_VERIFIED';

  -- Get DEVELOPER_KYC_VERIFIED badge ID
  SELECT id INTO developer_kyc_id 
  FROM badge_definitions 
  WHERE badge_key = 'DEVELOPER_KYC_VERIFIED';

  -- If both exist, migrate instances
  IF kyc_id IS NOT NULL AND developer_kyc_id IS NOT NULL THEN
    -- Update badge_instances to point to DEVELOPER_KYC_VERIFIED
    UPDATE badge_instances
    SET badge_id = developer_kyc_id
    WHERE badge_id = kyc_id
    AND NOT EXISTS (
      -- Avoid duplicates
      SELECT 1 FROM badge_instances bi2
      WHERE bi2.user_id = badge_instances.user_id
      AND bi2.badge_id = developer_kyc_id
    );

    -- Delete any remaining KYC_VERIFIED instances (duplicates)
    DELETE FROM badge_instances
    WHERE badge_id = kyc_id;
  END IF;
END $$;

-- ============================================
-- 2. DELETE OLD BADGE DEFINITIONS
-- ============================================

-- Delete DEV_KYC_VERIFIED badge definition
DELETE FROM badge_definitions
WHERE badge_key = 'DEV_KYC_VERIFIED';

-- Delete KYC_VERIFIED badge definition
DELETE FROM badge_definitions
WHERE badge_key = 'KYC_VERIFIED';

-- ============================================
-- 3. VERIFY CLEANUP
-- ============================================

-- Verification queries (run after migration):

-- Check that only DEVELOPER_KYC_VERIFIED exists
-- SELECT badge_key, name, description FROM badge_definitions WHERE badge_key LIKE '%KYC%';

-- Check badge instances count
-- SELECT COUNT(*) FROM badge_instances bi 
-- JOIN badge_definitions bd ON bi.badge_id = bd.id 
-- WHERE bd.badge_key = 'DEVELOPER_KYC_VERIFIED';

COMMENT ON COLUMN badge_definitions.badge_key IS 'Standardized badge keys. For developer KYC verification, use DEVELOPER_KYC_VERIFIED only.';

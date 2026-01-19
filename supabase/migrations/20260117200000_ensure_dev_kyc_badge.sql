-- Migration: 20260117200000_ensure_dev_kyc_badge.sql
-- Created: 2026-01-17
-- Description: Ensure DEVELOPER_KYC_VERIFIED badge exists for presale creation gating

-- ============================================
-- ENSURE DEVELOPER KYC BADGE EXISTS
-- ============================================

-- Insert or update the DEVELOPER_KYC_VERIFIED badge
-- This is the gate requirement for accessing presale creation
INSERT INTO badge_definitions (badge_key, name, description, icon_url, badge_type, scope)
VALUES 
  ('DEVELOPER_KYC_VERIFIED', 'Developer KYC Verified', 'Verified developer eligible to create launchpad projects', '/badges/dev-kyc.svg', 'KYC', 'USER')
ON CONFLICT (badge_key) DO UPDATE SET
  description = EXCLUDED.description,
  scope = 'USER',
  name = EXCLUDED.name;

-- Add comment
COMMENT ON COLUMN badge_definitions.scope IS 'Badge scope: USER (attached to user profile) or PROJECT (attached to project). DEVELOPER_KYC_VERIFIED is a USER badge.';

-- Verification query (run after migration)
-- SELECT badge_key, name, description, scope FROM badge_definitions WHERE badge_key = 'DEVELOPER_KYC_VERIFIED';

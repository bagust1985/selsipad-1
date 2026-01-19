-- Migration: 20260117103000_add_user_badges.sql
-- Created: 2026-01-17
-- Description: Add badge_instances table for user badges and update badge_definitions with scope

-- ============================================
-- ADD SCOPE TO BADGE DEFINITIONS
-- ============================================

-- Add scope column to distinguish user badges from project badges
ALTER TABLE badge_definitions
  ADD COLUMN scope TEXT DEFAULT 'PROJECT' CHECK (scope IN ('USER', 'PROJECT'));

COMMENT ON COLUMN badge_definitions.scope IS 'Badge scope: USER (attached to user profile) or PROJECT (attached to project)';

-- Update existing badges with correct scope
UPDATE badge_definitions SET scope = 'PROJECT' 
WHERE badge_key IN ('KYC_VERIFIED', 'SC_AUDIT_PASSED', 'DEV_KYC_VERIFIED', 'SC_AUDIT_PASS', 'FIRST_PROJECT', 'TRENDING_PROJECT', 'VERIFIED_TEAM');

UPDATE badge_definitions SET scope = 'USER' 
WHERE badge_key IN ('REFERRAL_PRO', 'WHALE', 'INFLUENCER', 'TEAM_ADMIN', 'TEAM_MOD', 'TEAM_IT_PROGRAMMER', 'TEAM_CEO', 'TEAM_MARKETING', 'EARLY_ADOPTER', 'ACTIVE_CONTRIBUTOR', 'DIAMOND_HANDS', 'EARLY_BIRD');

-- ============================================
-- CREATE BADGE_INSTANCES TABLE (User Badges)
-- ============================================

CREATE TABLE badge_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badge_definitions(id) ON DELETE CASCADE,
  
  -- Status tracking
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'REVOKED')),
  
  -- Metadata
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  awarded_by UUID REFERENCES auth.users(id), -- NULL for auto-awards, admin user_id for manual
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ, -- NULL for permanent badges
  
  -- Reason/notes
  award_reason TEXT,
  revoke_reason TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Constraints: One badge instance per user per badge (can be revoked/expired and re-awarded)
  -- But we want to track all instances, so no unique constraint
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE badge_instances IS 'User badge instances - awarded badges with status tracking (ACTIVE/EXPIRED/REVOKED)';
COMMENT ON COLUMN badge_instances.status IS 'Badge status: ACTIVE (currently valid), EXPIRED (time-based expiry), REVOKED (manually removed)';
COMMENT ON COLUMN badge_instances.awarded_by IS 'NULL for auto-awards, admin user_id for manual awards';
COMMENT ON COLUMN badge_instances.expires_at IS 'NULL for permanent badges, timestamp for time-limited badges';

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_badge_instances_user ON badge_instances(user_id);
CREATE INDEX idx_badge_instances_badge ON badge_instances(badge_id);
CREATE INDEX idx_badge_instances_status ON badge_instances(status);
CREATE INDEX idx_badge_instances_user_badge ON badge_instances(user_id, badge_id);

-- Partial index for active badges only (most common query)
CREATE INDEX idx_badge_instances_active ON badge_instances(user_id, badge_id) 
WHERE status = 'ACTIVE';

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE TRIGGER update_badge_instances_updated_at 
  BEFORE UPDATE ON badge_instances
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE badge_instances ENABLE ROW LEVEL SECURITY;

-- Users can view their own badges
CREATE POLICY "Users can view own badges" ON badge_instances
  FOR SELECT
  USING (user_id = auth.uid());

-- Public can view active badges (for profile display)
CREATE POLICY "Public can view active badges" ON badge_instances
  FOR SELECT
  USING (status = 'ACTIVE');

-- Admin operations use service role (bypass RLS)

-- ============================================
-- HELPER FUNCTION: Get active user badges
-- ============================================

CREATE OR REPLACE FUNCTION get_user_active_badges(target_user_id UUID)
RETURNS TABLE (
  badge_key TEXT,
  badge_name TEXT,
  badge_description TEXT,
  badge_type TEXT,
  icon_url TEXT,
  awarded_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bd.badge_key,
    bd.name,
    bd.description,
    bd.badge_type,
    bd.icon_url,
    bi.awarded_at
  FROM badge_instances bi
  JOIN badge_definitions bd ON bi.badge_id = bd.id
  WHERE bi.user_id = target_user_id
    AND bi.status = 'ACTIVE'
    AND bd.is_active = TRUE
  ORDER BY bi.awarded_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_active_badges IS 'Get all active badges for a user with badge details';

-- Migration: Add SAFU Badge for Platform Token Creation
-- Created: 2026-01-23
-- Description: Add SAFU badge definition for projects using platform-created tokens

-- ============================================
-- ADD SAFU BADGE DEFINITION
-- ============================================

-- Insert SAFU badge for PROJECT scope (use SECURITY type)
INSERT INTO badge_definitions (
  badge_key,
  name,
  description,
  badge_type,
  icon_url,
  scope,
  auto_award_criteria,
  is_active
) VALUES (
  'SAFU_TOKEN',
  'SAFU',
  'Token created via Selsipad TokenFactory with standard security features',
  'SECURITY',
  '/badges/safu.svg',
  'PROJECT',
  jsonb_build_object(
    'requirement', 'Token created through platform TokenFactory',
    'trust_level', 'PLATFORM_VERIFIED'
  ),
  true
)
ON CONFLICT (badge_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ============================================
-- HELPER FUNCTION: Auto-assign SAFU badge
-- ============================================

CREATE OR REPLACE FUNCTION assign_safu_badge_if_eligible()
RETURNS TRIGGER AS $$
DECLARE
  v_badge_id UUID;
  v_project_id UUID;
BEGIN
  -- Only proceed if created_token_id is set (platform token)
  IF NEW.created_token_id IS NOT NULL THEN
    
    -- Get SAFU badge ID
    SELECT id INTO v_badge_id
    FROM badge_definitions
    WHERE badge_key = 'SAFU_TOKEN' AND is_active = TRUE;
    
    -- Get project ID from launch_rounds
    v_project_id := NEW.project_id;
    
    -- Only auto-assign if badge exists and project doesn't already have it
    IF v_badge_id IS NOT NULL AND v_project_id IS NOT NULL THEN
      -- Check if badge already exists for this project
      IF NOT EXISTS (
        SELECT 1 FROM project_badges 
        WHERE project_id = v_project_id AND badge_id = v_badge_id
      ) THEN
        -- Insert SAFU badge for the project
        INSERT INTO project_badges (
          project_id,
          badge_id,
          awarded_at,
          awarded_by,
          award_reason
        ) VALUES (
          v_project_id,
          v_badge_id,
          NOW(),
          NULL,  -- Auto-assigned
          'Platform token creation via TokenFactory'
        );
        
        RAISE NOTICE 'SAFU badge auto-assigned to project %', v_project_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION assign_safu_badge_if_eligible IS 'Auto-assign SAFU badge when launch_round uses platform-created token';

-- ============================================
-- TRIGGER: Auto-assign SAFU on token creation link
-- ============================================

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_assign_safu_badge ON launch_rounds;

-- Trigger when created_token_id is set (INSERT or UPDATE)
CREATE TRIGGER trigger_assign_safu_badge
  AFTER INSERT OR UPDATE OF created_token_id ON launch_rounds
  FOR EACH ROW
  WHEN (NEW.created_token_id IS NOT NULL)
  EXECUTE FUNCTION assign_safu_badge_if_eligible();

COMMENT ON TRIGGER trigger_assign_safu_badge ON launch_rounds IS 'Auto-assign SAFU badge when project uses platform token';

-- Migration: 011_add_missing_badges.sql
-- Created: 2026-01-17
-- Description: Add missing badge definitions from Modul 11 specification

-- ============================================
-- ADD MISSING BADGE DEFINITIONS
-- ============================================

-- Auto-award User Badges
INSERT INTO badge_definitions (badge_key, name, description, icon_url, badge_type, auto_award_criteria) VALUES
  -- REFERRAL_PRO: Auto-awarded when user has >= 20 active referrals
  ('REFERRAL_PRO', 'Referral Pro', 'Has 20+ active referrals who made contributions', '/badges/referral-pro.svg', 'MILESTONE', 
   '{"threshold": "20_active_referrals", "logic": "counted_by_worker"}'),
  
  -- WHALE: Auto-awarded when total contributions >= $20,000 USD
  ('WHALE', 'Whale', 'Total contributions across all rounds >= $20,000 USD', '/badges/whale.svg', 'MILESTONE', 
   '{"threshold": "20000_usd", "logic": "normalized_to_usd"}'),

  -- INFLUENCER: Manual award for community influencers
  ('INFLUENCER', 'Influencer', 'Recognized community influencer and advocate', '/badges/influencer.svg', 'SPECIAL', 
   '{"manual": true}')

ON CONFLICT (badge_key) DO NOTHING;

-- Project-specific Badges (improved naming)  
INSERT INTO badge_definitions (badge_key, name, description, icon_url, badge_type, auto_award_criteria) VALUES
  -- DEV_KYC_VERIFIED: Same as KYC_VERIFIED but clearer naming
  ('DEV_KYC_VERIFIED', 'Developer KYC Verified', 'Project developer completed full KYC verification', '/badges/dev-kyc.svg', 'KYC', 
   '{"trigger": "kyc_approved_and_fees_paid"}'),
  
  -- SC_AUDIT_PASS: Alias for SC_AUDIT_PASSED
  ('SC_AUDIT_PASS', 'Smart Contract Audited', 'Smart contract passed professional security audit', '/badges/sc-audit.svg', 'SECURITY', 
   '{"trigger": "audit_passed"}')

ON CONFLICT (badge_key) DO NOTHING;

-- Manual Team Badges (for SELSI internal team only)
INSERT INTO badge_definitions (badge_key, name, description, icon_url, badge_type, auto_award_criteria) VALUES
  ('TEAM_ADMIN', 'Team Admin', 'SELSIPAD Platform Administrator', '/badges/team-admin.svg', 'SPECIAL', 
   '{"manual": true, "internal_only": true}'),
  
  ('TEAM_MOD', 'Team Moderator', 'SELSIPAD Community Moderator', '/badges/team-mod.svg', 'SPECIAL', 
   '{"manual": true, "internal_only": true}'),
  
  ('TEAM_IT_PROGRAMMER', 'Team Developer', 'SELSIPAD Platform Developer', '/badges/team-dev.svg', 'SPECIAL', 
   '{"manual": true, "internal_only": true}'),
  
  ('TEAM_CEO', 'Team CEO', 'SELSIPAD Chief Executive Officer', '/badges/team-ceo.svg', 'SPECIAL', 
   '{"manual": true, "internal_only": true}'),
  
  ('TEAM_MARKETING', 'Team Marketing', 'SELSIPAD Marketing Team', '/badges/team-marketing.svg', 'SPECIAL', 
   '{"manual": true, "internal_only": true}')

ON CONFLICT (badge_key) DO NOTHING;

-- Additional useful badges
INSERT INTO badge_definitions (badge_key, name, description, icon_url, badge_type, auto_award_criteria) VALUES
  ('ACTIVE_CONTRIBUTOR', 'Active Contributor', 'Participated in 5+ successful rounds', '/badges/active-contributor.svg', 'MILESTONE', 
   '{"threshold": "5_successful_rounds"}'),
  
  ('DIAMOND_HANDS', 'Diamond Hands', 'Never sold early - held tokens through vesting', '/badges/diamond-hands.svg', 'SPECIAL', 
   '{"manual": true}'),
  
  ('EARLY_BIRD', 'Early Bird', 'Contributed in first 24 hours of round', '/badges/early-bird.svg', 'MILESTONE', 
   '{"auto": true}')

ON CONFLICT (badge_key) DO NOTHING;

-- ============================================
-- UPDATE EXISTING BADGE DESCRIPTIONS
-- ============================================

-- Make existing badges more descriptive
UPDATE badge_definitions 
SET description = 'Project owner completed KYC verification with liveness check and fee payment'
WHERE badge_key = 'KYC_VERIFIED';

UPDATE badge_definitions 
SET description = 'Smart contract passed professional security audit (CertiK, Hacken, or equivalent)'
WHERE badge_key = 'SC_AUDIT_PASSED';

UPDATE badge_definitions
SET name = 'Pioneer', 
    description = 'Created first project on SELSIPAD platform'
WHERE badge_key = 'FIRST_PROJECT';

UPDATE badge_definitions
SET name = 'OG Member',
    description = 'Early platform member - joined before public launch'
WHERE badge_key = 'EARLY_ADOPTER';

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE badge_definitions IS 'Master catalog of all available badges (user badges + project badges)';

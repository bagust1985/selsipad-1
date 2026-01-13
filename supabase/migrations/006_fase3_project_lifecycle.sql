-- Migration: 006_fase3_project_lifecycle.sql
-- Created: 2026-01-13
-- Description: FASE 3 - Project Lifecycle Management (KYC, SC Scan, Badge System)

-- ============================================
-- EXTEND PROJECTS TABLE
-- ============================================
ALTER TABLE projects
  ADD COLUMN kyc_status TEXT DEFAULT 'NONE' CHECK (kyc_status IN ('NONE', 'PENDING', 'VERIFIED', 'REJECTED')),
  ADD COLUMN sc_scan_status TEXT DEFAULT 'NONE' CHECK (sc_scan_status IN ('NONE', 'PENDING', 'PASSED', 'FAILED', 'WARNING')),
  ADD COLUMN rejection_reason TEXT,
  ADD COLUMN submitted_at TIMESTAMPTZ,
  ADD COLUMN approved_at TIMESTAMPTZ;

COMMENT ON COLUMN projects.kyc_status IS 'KYC verification status for project owner';
COMMENT ON COLUMN projects.sc_scan_status IS 'Smart contract audit status';
COMMENT ON COLUMN projects.submitted_at IS 'Timestamp when project submitted for review';
COMMENT ON COLUMN projects.approved_at IS 'Timestamp when project approved by admin';

-- ============================================
-- KYC SUBMISSIONS TABLE
-- ============================================
CREATE TABLE kyc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  submission_type TEXT NOT NULL CHECK (submission_type IN ('INDIVIDUAL', 'BUSINESS')),
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  documents_url TEXT NOT NULL,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE kyc_submissions IS 'KYC document submissions for project owners';
COMMENT ON COLUMN kyc_submissions.submission_type IS 'Type: INDIVIDUAL for personal, BUSINESS for company';
COMMENT ON COLUMN kyc_submissions.documents_url IS 'URL to encrypted KYC documents storage';
COMMENT ON COLUMN kyc_submissions.reviewed_by IS 'Admin user who reviewed the submission';

CREATE INDEX idx_kyc_user_id ON kyc_submissions(user_id);
CREATE INDEX idx_kyc_project_id ON kyc_submissions(project_id);
CREATE INDEX idx_kyc_status ON kyc_submissions(status);
CREATE INDEX idx_kyc_created ON kyc_submissions(created_at DESC);

-- ============================================
-- SMART CONTRACT SCAN RESULTS TABLE
-- ============================================
CREATE TABLE sc_scan_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  contract_address TEXT NOT NULL,
  chain TEXT NOT NULL,
  scan_provider TEXT NOT NULL, -- 'CERTIK', 'HACKEN', 'SLOWMIST', etc.
  score INTEGER CHECK (score >= 0 AND score <= 100),
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PASSED', 'FAILED', 'WARNING')),
  report_url TEXT,
  findings_summary JSONB DEFAULT '{}',
  scan_requested_at TIMESTAMPTZ DEFAULT NOW(),
  scan_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE sc_scan_results IS 'Smart contract security audit scan results';
COMMENT ON COLUMN sc_scan_results.score IS 'Security score from 0-100, higher is better';
COMMENT ON COLUMN sc_scan_results.findings_summary IS 'JSON summary of critical/high/medium/low findings';

CREATE INDEX idx_scan_project_id ON sc_scan_results(project_id);
CREATE INDEX idx_scan_contract ON sc_scan_results(contract_address, chain);
CREATE INDEX idx_scan_status ON sc_scan_results(status);

-- ============================================
-- BADGE DEFINITIONS TABLE
-- ============================================
CREATE TABLE badge_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('KYC', 'SECURITY', 'MILESTONE', 'SPECIAL')),
  auto_award_criteria JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE badge_definitions IS 'Master list of available badges';
COMMENT ON COLUMN badge_definitions.badge_key IS 'Unique identifier like KYC_VERIFIED, SC_AUDIT_PASSED';
COMMENT ON COLUMN badge_definitions.auto_award_criteria IS 'JSON rules for automatic badge awarding';

CREATE INDEX idx_badge_key ON badge_definitions(badge_key);
CREATE INDEX idx_badge_type ON badge_definitions(badge_type);

-- ============================================
-- PROJECT BADGES TABLE (Junction)
-- ============================================
CREATE TABLE project_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badge_definitions(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  awarded_by UUID REFERENCES auth.users(id), -- NULL for auto-awards
  reason TEXT,
  
  -- Constraints
  CONSTRAINT unique_project_badge UNIQUE(project_id, badge_id)
);

COMMENT ON TABLE project_badges IS 'Badges awarded to projects';
COMMENT ON COLUMN project_badges.awarded_by IS 'NULL for auto-awards, admin user_id for manual awards';

CREATE INDEX idx_project_badges_project ON project_badges(project_id);
CREATE INDEX idx_project_badges_badge ON project_badges(badge_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_kyc_updated_at BEFORE UPDATE ON kyc_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scan_updated_at BEFORE UPDATE ON sc_scan_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-award KYC badge when KYC approved
CREATE OR REPLACE FUNCTION auto_award_kyc_badge()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'APPROVED' AND OLD.status != 'APPROVED' THEN
    -- Update user's project KYC status if project_id is present
    IF NEW.project_id IS NOT NULL THEN
      UPDATE projects
      SET kyc_status = 'VERIFIED'
      WHERE id = NEW.project_id;
      
      -- Award KYC_VERIFIED badge
      INSERT INTO project_badges (project_id, badge_id, awarded_by, reason)
      SELECT 
        NEW.project_id,
        bd.id,
        NEW.reviewed_by,
        'KYC verification approved'
      FROM badge_definitions bd
      WHERE bd.badge_key = 'KYC_VERIFIED'
      ON CONFLICT (project_id, badge_id) DO NOTHING;
    END IF;
  ELSIF NEW.status = 'REJECTED' AND OLD.status != 'REJECTED' THEN
    -- Update KYC status to rejected
    IF NEW.project_id IS NOT NULL THEN
      UPDATE projects
      SET kyc_status = 'REJECTED'
      WHERE id = NEW.project_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_award_kyc_badge
  AFTER UPDATE ON kyc_submissions
  FOR EACH ROW
  EXECUTE FUNCTION auto_award_kyc_badge();

-- Auto-award SC audit badge when scan passes
CREATE OR REPLACE FUNCTION auto_award_scan_badge()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'PASSED' AND (OLD.status IS NULL OR OLD.status != 'PASSED') THEN
    -- Update project SC scan status
    UPDATE projects
    SET sc_scan_status = 'PASSED'
    WHERE id = NEW.project_id;
    
    -- Award SC_AUDIT_PASSED badge
    INSERT INTO project_badges (project_id, badge_id, reason)
    SELECT 
      NEW.project_id,
      bd.id,
      CONCAT('Smart contract audit passed - ', NEW.scan_provider)
    FROM badge_definitions bd
    WHERE bd.badge_key = 'SC_AUDIT_PASSED'
    ON CONFLICT (project_id, badge_id) DO NOTHING;
  ELSIF NEW.status IN ('FAILED', 'WARNING') THEN
    -- Update project SC scan status
    UPDATE projects
    SET sc_scan_status = NEW.status
    WHERE id = NEW.project_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_award_scan_badge
  AFTER INSERT OR UPDATE ON sc_scan_results
  FOR EACH ROW
  EXECUTE FUNCTION auto_award_scan_badge();

-- Auto-award FIRST_PROJECT badge
CREATE OR REPLACE FUNCTION auto_award_first_project_badge()
RETURNS TRIGGER AS $$
DECLARE
  project_count INTEGER;
BEGIN
  -- Check if this is the user's first project
  SELECT COUNT(*) INTO project_count
  FROM projects
  WHERE owner_user_id = NEW.owner_user_id;
  
  IF project_count = 1 THEN
    -- Award FIRST_PROJECT badge
    INSERT INTO project_badges (project_id, badge_id, reason)
    SELECT 
      NEW.id,
      bd.id,
      'First project created'
    FROM badge_definitions bd
    WHERE bd.badge_key = 'FIRST_PROJECT'
    ON CONFLICT (project_id, badge_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_award_first_project_badge
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION auto_award_first_project_badge();

-- ============================================
-- SEED DATA - Badge Definitions
-- ============================================
INSERT INTO badge_definitions (badge_key, name, description, icon_url, badge_type, auto_award_criteria) VALUES
  ('KYC_VERIFIED', 'KYC Verified', 'Project owner has completed KYC verification', '/badges/kyc-verified.svg', 'KYC', '{"trigger": "kyc_approved"}'),
  ('SC_AUDIT_PASSED', 'Security Audited', 'Smart contract passed security audit', '/badges/audit-passed.svg', 'SECURITY', '{"trigger": "scan_passed"}'),
  ('FIRST_PROJECT', 'First Launch', 'First project created on Selsipad', '/badges/first-project.svg', 'MILESTONE', '{"trigger": "first_project"}'),
  ('EARLY_ADOPTER', 'Early Adopter', 'Joined Selsipad in early phase', '/badges/early-adopter.svg', 'SPECIAL', '{"manual": true}'),
  ('TRENDING_PROJECT', 'Trending', 'Featured in trending projects', '/badges/trending.svg', 'SPECIAL', '{"manual": true}'),
  ('VERIFIED_TEAM', 'Verified Team', 'Team members verified and doxxed', '/badges/verified-team.svg', 'KYC', '{"manual": true}')
ON CONFLICT (badge_key) DO NOTHING;

-- Migration: 015_contract_audit_system.sql
-- Created: 2026-01-17
-- Description: Smart Contract Audit & Security System - Database Foundation
-- Strategy: EXTEND_EXISTING (reuse existing tables, minimal new tables)

-- ============================================
-- 1. EXTEND PROJECTS TABLE
-- ============================================

-- Add contract tracking columns
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS contract_mode TEXT CHECK (contract_mode IN ('EXTERNAL_CONTRACT', 'LAUNCHPAD_TEMPLATE')),
  ADD COLUMN IF NOT EXISTS contract_network TEXT CHECK (contract_network IN ('EVM', 'SOLANA')),
  ADD COLUMN IF NOT EXISTS contract_address TEXT,
  ADD COLUMN IF NOT EXISTS factory_address TEXT,
  ADD COLUMN IF NOT EXISTS template_version TEXT,
  ADD COLUMN IF NOT EXISTS implementation_hash TEXT,
  ADD COLUMN IF NOT EXISTS sc_scan_last_run_id UUID;

COMMENT ON COLUMN projects.contract_mode IS 'EXTERNAL_CONTRACT (user brings own) or LAUNCHPAD_TEMPLATE (factory deploy)';
COMMENT ON COLUMN projects.contract_network IS 'Network where contract is deployed: EVM or SOLANA';
COMMENT ON COLUMN projects.contract_address IS 'EVM address or Solana program ID';
COMMENT ON COLUMN projects.factory_address IS 'Factory contract address for template deployments';
COMMENT ON COLUMN projects.template_version IS 'Template version for LAUNCHPAD_TEMPLATE mode';
COMMENT ON COLUMN projects.implementation_hash IS 'Implementation bytecode hash for verification';
COMMENT ON COLUMN projects.sc_scan_last_run_id IS 'FK to sc_scan_results for latest scan run';

-- Update sc_scan_status enum to match new workflow
ALTER TABLE projects
  DROP CONSTRAINT IF EXISTS projects_sc_scan_status_check;

ALTER TABLE projects
  ADD CONSTRAINT projects_sc_scan_status_check 
  CHECK (sc_scan_status IN ('IDLE', 'PENDING', 'RUNNING', 'PASS', 'FAIL', 'NEEDS_REVIEW'));

CREATE INDEX IF NOT EXISTS idx_projects_contract_mode ON projects(contract_mode);
CREATE INDEX IF NOT EXISTS idx_projects_scan_status ON projects(sc_scan_status);

-- ============================================
-- 2. EXTEND SC_SCAN_RESULTS TABLE
-- ============================================

-- Add missing columns for detailed scan tracking
ALTER TABLE sc_scan_results
  ADD COLUMN IF NOT EXISTS network TEXT CHECK (network IN ('EVM', 'SOLANA')),
  ADD COLUMN IF NOT EXISTS target_address TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RUNNING', 'PASS', 'FAIL', 'NEEDS_REVIEW')),
  ADD COLUMN IF NOT EXISTS risk_flags JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS raw_findings JSONB DEFAULT '{}',
  
  -- Admin override fields
  ADD COLUMN IF NOT EXISTS override_status TEXT CHECK (override_status IN ('PASS', 'FAIL')),
  ADD COLUMN IF NOT EXISTS override_reason TEXT,
  ADD COLUMN IF NOT EXISTS override_by UUID,
  ADD COLUMN IF NOT EXISTS override_at TIMESTAMPTZ,
  
  -- Timing fields
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS finished_at TIMESTAMPTZ;

COMMENT ON COLUMN sc_scan_results.network IS 'Network: EVM or SOLANA';
COMMENT ON COLUMN sc_scan_results.target_address IS 'Contract address being scanned';
COMMENT ON COLUMN sc_scan_results.status IS 'Scan execution status';
COMMENT ON COLUMN sc_scan_results.risk_flags IS 'Array of detected risk patterns: ["reentrancy", "owner_backdoor", ...]';
COMMENT ON COLUMN sc_scan_results.summary IS 'Human-readable summary of scan results';
COMMENT ON COLUMN sc_scan_results.raw_findings IS 'Detailed findings from scan runner';
COMMENT ON COLUMN sc_scan_results.override_status IS 'Admin override decision: PASS or FAIL';
COMMENT ON COLUMN sc_scan_results.override_reason IS 'Admin reason for override (required)';

-- Add indexes for scan tracking
CREATE INDEX IF NOT EXISTS idx_scan_project_network ON sc_scan_results(project_id, network);
CREATE INDEX IF NOT EXISTS idx_scan_status ON sc_scan_results(status);
CREATE INDEX IF NOT EXISTS idx_scan_status_needs_review ON sc_scan_results(status) WHERE status = 'NEEDS_REVIEW';
CREATE INDEX IF NOT EXISTS idx_scan_target_address ON sc_scan_results(target_address);

-- ============================================
-- 3. CONTRACT AUDIT PROOFS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS contract_audit_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Audit information
  auditor_name TEXT NOT NULL,
  report_url TEXT NOT NULL,
  report_hash TEXT, -- SHA256 for verification
  audit_date DATE,
  scope JSONB DEFAULT '{}',
  
  -- Verification status
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE contract_audit_proofs IS 'Professional audit report submissions for SECURITY_AUDITED badge';
COMMENT ON COLUMN contract_audit_proofs.auditor_name IS 'Name of auditing firm (e.g., Certik, Hacken)';
COMMENT ON COLUMN contract_audit_proofs.report_url IS 'URL to audit report PDF or public page';
COMMENT ON COLUMN contract_audit_proofs.report_hash IS 'SHA256 hash of report for verification';
COMMENT ON COLUMN contract_audit_proofs.scope IS 'JSON: which contracts/functions were audited';
COMMENT ON COLUMN contract_audit_proofs.status IS 'PENDING (awaiting review), VERIFIED (approved), REJECTED (denied)';

CREATE INDEX IF NOT EXISTS idx_audit_proofs_project ON contract_audit_proofs(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_proofs_status ON contract_audit_proofs(status);
CREATE INDEX IF NOT EXISTS idx_audit_proofs_pending ON contract_audit_proofs(status) WHERE status = 'PENDING';

-- ============================================
-- 4. TEMPLATE AUDITS TABLE (STRICT Registry)
-- ============================================

CREATE TABLE IF NOT EXISTS template_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Template identification
  network TEXT NOT NULL CHECK (network IN ('EVM', 'SOLANA')),
  factory_address TEXT,
  template_version TEXT NOT NULL,
  implementation_hash TEXT NOT NULL,
  
  -- Audit details
  audit_report_ref TEXT NOT NULL, -- URL or IPFS hash
  audit_provider TEXT,
  audited_at DATE,
  
  -- Status (STRICT mode enforcement)
  status TEXT DEFAULT 'VALID' CHECK (status IN ('VALID', 'REVOKED')),
  revoked_reason TEXT,
  
  -- Admin tracking
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint for STRICT enforcement
  CONSTRAINT unique_template_audit UNIQUE(network, template_version, implementation_hash)
);

COMMENT ON TABLE template_audits IS 'Registry of audited template versions for STRICT PROJECT_AUDITED inheritance';
COMMENT ON COLUMN template_audits.network IS 'Network: EVM or SOLANA';
COMMENT ON COLUMN template_audits.template_version IS 'Semantic version of template (e.g., 1.0.0)';
COMMENT ON COLUMN template_audits.implementation_hash IS 'Bytecode hash for verification';
COMMENT ON COLUMN template_audits.audit_report_ref IS 'URL or IPFS hash of audit report';
COMMENT ON COLUMN template_audits.status IS 'VALID = can issue PROJECT_AUDITED, REVOKED = removed from eligible list';
COMMENT ON COLUMN template_audits.revoked_reason IS 'Why template audit was revoked (security issue found, etc.)';

CREATE INDEX IF NOT EXISTS idx_template_audits_network ON template_audits(network, status);
CREATE INDEX IF NOT EXISTS idx_template_audits_version ON template_audits(template_version);
CREATE INDEX IF NOT EXISTS idx_template_audits_valid ON template_audits(network, template_version) WHERE status = 'VALID';

-- ============================================
-- 5. ADMIN AUDIT LOGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_admin_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'SCAN_OVERRIDE_PASS', 'SCAN_OVERRIDE_FAIL', 'AUDIT_PROOF_VERIFY', etc.
  entity_type TEXT NOT NULL, -- 'PROJECT', 'SCAN_RUN', 'AUDIT_PROOF', 'TEMPLATE_AUDIT', etc.
  entity_id TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE admin_audit_logs IS 'Comprehensive audit trail for all admin actions on contract security system';
COMMENT ON COLUMN admin_audit_logs.action IS 'Specific admin action taken';
COMMENT ON COLUMN admin_audit_logs.entity_type IS 'Type of entity being acted upon';
COMMENT ON COLUMN admin_audit_logs.entity_id IS 'ID of entity (UUID as text for flexibility)';
COMMENT ON COLUMN admin_audit_logs.metadata IS 'Additional context (reason, previous values, etc.)';

CREATE INDEX IF NOT EXISTS idx_admin_logs_actor ON admin_audit_logs(actor_admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_entity ON admin_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_audit_logs(created_at DESC);

-- ============================================
-- 6. TRIGGERS
-- ============================================

-- Auto-update updated_at for audit proofs
DROP TRIGGER IF EXISTS update_audit_proofs_updated_at ON contract_audit_proofs;
CREATE TRIGGER update_audit_proofs_updated_at 
  BEFORE UPDATE ON contract_audit_proofs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for template audits
DROP TRIGGER IF EXISTS update_template_audits_updated_at ON template_audits;
CREATE TRIGGER update_template_audits_updated_at 
  BEFORE UPDATE ON template_audits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- 7. BADGE DEFINITIONS (ensure required badges exist)
-- ============================================

-- Insert PROJECT_AUDITED and SECURITY_AUDITED if not exists
INSERT INTO badge_definitions (badge_key, name, description, icon_url, badge_type, scope)
VALUES 
  ('PROJECT_AUDITED', 'Project Audited', 'Smart contract has passed security audit or is deployed from audited template', '/badges/project-audited.svg', 'SECURITY', 'PROJECT'),
  ('SECURITY_AUDITED', 'Security Audited', 'Professional security audit completed by recognized firm', '/badges/security-audited.svg', 'SECURITY', 'PROJECT')
ON CONFLICT (badge_key) DO NOTHING;

-- ============================================
-- MIGRATION VERIFICATION QUERIES
-- ============================================

-- Run these queries after migration to verify:

-- 1. Check projects table extensions
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'projects' AND column_name LIKE 'contract%';

-- 2. Check sc_scan_results extensions
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'sc_scan_results' AND column_name IN ('network', 'target_address', 'risk_flags', 'override_status');

-- 3. Verify new tables exist
-- SELECT table_name FROM information_schema.tables WHERE table_name IN ('contract_audit_proofs', 'template_audits', 'admin_audit_logs');

-- 4. Check badge definitions
-- SELECT badge_key, name, scope FROM badge_definitions WHERE badge_key IN ('PROJECT_AUDITED', 'SECURITY_AUDITED');

-- Migration: create_two_man_rule_tables
-- Created: 2026-01-26
-- Description: Create admin_actions and admin_action_approvals for two-man rule

-- Create admin_actions table
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'role_grant', 'role_revoke', 'payout', 'fee_change', 'scan_override', 'lp_unlock', etc.
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'EXECUTED')),
  requested_by UUID NOT NULL REFERENCES profiles(user_id),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  executed_at TIMESTAMPTZ,
  execution_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_status ON admin_actions(status);
CREATE INDEX IF NOT EXISTS idx_admin_actions_requester ON admin_actions(requested_by);
CREATE INDEX IF NOT EXISTS idx_admin_actions_type ON admin_actions(type);
CREATE INDEX IF NOT EXISTS idx_admin_actions_expires ON admin_actions(expires_at) WHERE status = 'PENDING';

COMMENT ON TABLE admin_actions IS 'Two-man rule: critical actions requiring approval - Modul 12';
COMMENT ON COLUMN admin_actions.type IS 'Action type identifier';
COMMENT ON COLUMN admin_actions.payload IS 'Action-specific parameters (JSON)';

-- Create admin_action_approvals table
CREATE TABLE IF NOT EXISTS admin_action_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id UUID NOT NULL REFERENCES admin_actions(id) ON DELETE CASCADE,
  approved_by UUID NOT NULL REFERENCES profiles(user_id),
  decision TEXT NOT NULL CHECK (decision IN ('APPROVE', 'REJECT')),
  reason TEXT,
  approved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(action_id, approved_by)
);

CREATE INDEX IF NOT EXISTS idx_action_approvals_action ON admin_action_approvals(action_id);
CREATE INDEX IF NOT EXISTS idx_action_approvals_approver ON admin_action_approvals(approved_by);

COMMENT ON TABLE admin_action_approvals IS 'Approval/rejection records for two-man rule actions';

-- Enable RLS
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_action_approvals ENABLE ROW LEVEL SECURITY;

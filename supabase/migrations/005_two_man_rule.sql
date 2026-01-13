-- Migration: 005_two_man_rule.sql
-- Created: 2026-01-13
-- Description: Two-Man Rule workflow for critical admin actions

-- Admin action requests (pending approval)
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL, -- 'role_grant', 'role_revoke', 'payout', 'fee_change', 'scan_override', 'lp_unlock', etc.
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'EXECUTED')),
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  executed_at TIMESTAMPTZ,
  execution_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_actions_status ON admin_actions(status);
CREATE INDEX idx_admin_actions_requester ON admin_actions(requested_by);
CREATE INDEX idx_admin_actions_type ON admin_actions(type);
CREATE INDEX idx_admin_actions_expires ON admin_actions(expires_at) WHERE status = 'PENDING';

COMMENT ON TABLE admin_actions IS 'Two-man rule: critical actions requiring approval';
COMMENT ON COLUMN admin_actions.type IS 'Action type identifier';
COMMENT ON COLUMN admin_actions.payload IS 'Action-specific parameters (JSON)';

-- Admin action approvals (who approved/rejected)
CREATE TABLE admin_action_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_id UUID NOT NULL REFERENCES admin_actions(id) ON DELETE CASCADE,
  approved_by UUID NOT NULL REFERENCES auth.users(id),
  decision TEXT NOT NULL CHECK (decision IN ('APPROVE', 'REJECT')),
  reason TEXT,
  approved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(action_id, approved_by)
);

CREATE INDEX idx_action_approvals_action ON admin_action_approvals(action_id);
CREATE INDEX idx_action_approvals_approver ON admin_action_approvals(approved_by);

COMMENT ON TABLE admin_action_approvals IS 'Approval/rejection records for two-man rule actions';

-- Trigger: Auto-expire pending actions
CREATE OR REPLACE FUNCTION expire_pending_actions()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE admin_actions
  SET status = 'EXPIRED'
  WHERE status = 'PENDING'
    AND expires_at < NOW();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Run expiration check periodically (activated by worker/cron)
CREATE OR REPLACE FUNCTION check_expired_actions()
RETURNS void AS $$
BEGIN
  UPDATE admin_actions
  SET status = 'EXPIRED'
  WHERE status = 'PENDING'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- RLS policies
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_action_approvals ENABLE ROW LEVEL SECURITY;

-- Service role only (admin endpoints use service role)

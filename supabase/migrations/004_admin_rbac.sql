-- Migration: 004_admin_rbac.sql
-- Created: 2026-01-13
-- Description: Role-Based Access Control for admin users

-- Admin roles table
CREATE TABLE admin_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'reviewer', 'ops', 'finance', 'support')),
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

CREATE INDEX idx_admin_roles_user ON admin_roles(user_id);
CREATE INDEX idx_admin_roles_role ON admin_roles(role);

COMMENT ON TABLE admin_roles IS 'Admin user roles (one user can have multiple roles)';
COMMENT ON COLUMN admin_roles.role IS 'super_admin, reviewer, ops, finance, support';

-- Admin permissions matrix (defines what each role can do)
CREATE TABLE admin_permissions (
  role TEXT NOT NULL,
  permission TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (role, permission)
);

COMMENT ON TABLE admin_permissions IS 'Permission matrix defining what each role can do';

-- Seed base permissions
INSERT INTO admin_permissions (role, permission, description) VALUES
  -- Super Admin (all permissions)
  ('super_admin', '*', 'All permissions'),
  
  -- Reviewer permissions
  ('reviewer', 'kyc:view', 'View KYC submissions'),
  ('reviewer', 'kyc:review', 'Approve/reject KYC'),
  ('reviewer', 'scan:view', 'View smart contract scans'),
  ('reviewer', 'scan:review', 'Approve/reject/override SC scans'),
  ('reviewer', 'project:view', 'View all projects'),
  ('reviewer', 'project:approve', 'Approve projects for listing'),
  
  -- Ops permissions
  ('ops', 'project:view', 'View all projects'),
  ('ops', 'project:pause', 'Pause active projects'),
  ('ops', 'project:cancel', 'Cancel projects'),
  ('ops', 'round:pause', 'Pause active rounds'),
  ('ops', 'user:view', 'View user details'),
  
  -- Finance permissions
  ('finance', 'round:view', 'View all rounds'),
  ('finance', 'round:finalize', 'Finalize rounds (mark success/failed)'),
  ('finance', 'payout:view', 'View payout requests'),
  ('finance', 'payout:approve', 'Approve payouts'),
  ('finance', 'treasury:view', 'View treasury balances'),
  ('finance', 'ledger:view', 'View complete ledger'),
  
  -- Support permissions
  ('support', 'user:view', 'View user profiles'),
  ('support', 'user:ban', 'Ban/unban users'),
  ('support', 'bluecheck:view', 'View Blue Check requests'),
  ('support', 'bluecheck:revoke', 'Revoke Blue Check'),
  ('support', 'post:moderate', 'Moderate social feed posts');

-- RLS policies for admin tables
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;

-- Only admins can view roles (via service role in practice)
-- No client-side access to these tables

-- Migration: create_admin_rbac_tables
-- Created: 2026-01-26
-- Description: Create admin_roles and admin_permissions tables for wallet-only auth

-- Create admin_roles table
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'kyc_reviewer', 'moderator', 'finance', 'reviewer', 'ops', 'support')),
  granted_by UUID REFERENCES profiles(user_id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_admin_roles_user ON admin_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_role ON admin_roles(role);

COMMENT ON TABLE admin_roles IS 'Admin user roles (one user can have multiple roles) - Modul 12';
COMMENT ON COLUMN admin_roles.role IS 'Admin role types: super_admin, admin, kyc_reviewer, moderator, finance, reviewer, ops, support';

-- Create admin_permissions table
CREATE TABLE IF NOT EXISTS admin_permissions (
  role TEXT NOT NULL,
  permission TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (role, permission)
);

COMMENT ON TABLE admin_permissions IS 'Permission matrix defining what each admin role can do (Modul 12 spec)';

-- Seed permission matrix
INSERT INTO admin_permissions (role, permission, description) VALUES
  -- Super Admin
  ('super_admin', '*', 'All permissions'),
  
  -- Admin
  ('admin', 'kyc:view', 'View KYC submissions'),
  ('admin', 'kyc:review', 'Approve/reject KYC'),
  ('admin', 'project:view', 'View all projects'),
  ('admin', 'project:approve', 'Approve projects for listing'),
  ('admin', 'project:reject', 'Reject projects'),
  ('admin', 'badge:view', 'View all badges'),
  ('admin', 'badge:grant', 'Grant badges manually'),
  ('admin', 'badge:revoke', 'Revoke badges'),
  ('admin', 'user:view', 'View user details'),
  ('admin', 'user:ban', 'Ban/unban users'),
  ('admin', 'post:moderate', 'Moderate social feed posts'),
  ('admin', 'audit:view', 'View audit logs'),
  
  -- KYC Reviewer
  ('kyc_reviewer', 'kyc:view', 'View KYC submissions'),
  ('kyc_reviewer', 'kyc:review', 'Approve/reject KYC'),
  ('kyc_reviewer', 'scan:view', 'View smart contract scans'),
  ('kyc_reviewer', 'audit:view', 'View audit logs'),
  
  -- Moderator
  ('moderator', 'post:view', 'View all posts'),
  ('moderator', 'post:moderate', 'Moderate social feed posts'),
  ('moderator', 'post:delete', 'Delete posts'),
  ('moderator', 'user:view', 'View user details'),
  ('moderator', 'user:ban', 'Ban/unban users'),
  ('moderator', 'audit:view', 'View audit logs'),
  
  -- Finance
  ('finance', 'round:view', 'View all rounds'),
  ('finance', 'round:finalize', 'Finalize rounds'),
  ('finance', 'payout:view', 'View payout requests'),
  ('finance', 'payout:approve', 'Approve payouts'),
  ('finance', 'treasury:view', 'View treasury balances'),
  ('finance', 'ledger:view', 'View complete ledger'),
  ('finance', 'fee:view', 'View fee rules'),
  ('finance', 'audit:view', 'View audit logs'),
  
  -- Reviewer
  ('reviewer', 'kyc:view', 'View KYC submissions'),
  ('reviewer', 'kyc:review', 'Approve/reject KYC'),
  ('reviewer', 'scan:view', 'View smart contract scans'),
  ('reviewer', 'scan:review', 'Approve/reject/override SC scans'),
  ('reviewer', 'project:view', 'View all projects'),
  ('reviewer', 'project:approve', 'Approve projects for listing'),
  ('reviewer', 'project:reject', 'Reject projects'),
  ('reviewer', 'audit:view', 'View audit logs'),
  
  -- Ops
  ('ops', 'project:view', 'View all projects'),
  ('ops', 'project:pause', 'Pause active projects'),
  ('ops', 'project:cancel', 'Cancel projects'),
  ('ops', 'round:view', 'View all rounds'),
  ('ops', 'round:pause', 'Pause active rounds'),
  ('ops', 'user:view', 'View user details'),
  ('ops', 'audit:view', 'View audit logs'),
  
  -- Support
  ('support', 'user:view', 'View user profiles'),
  ('support', 'user:ban', 'Ban/unban users'),
  ('support', 'bluecheck:view', 'View Blue Check requests'),
  ('support', 'bluecheck:revoke', 'Revoke Blue Check'),
  ('support', 'post:moderate', 'Moderate social feed posts'),
  ('support', 'audit:view', 'View audit logs')
ON CONFLICT (role, permission) DO NOTHING;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_admin_permissions_role_permission ON admin_permissions(role, permission);

-- Enable RLS
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;

-- Migration: admin_security_policies
-- Created: 2026-01-26
-- Description: RLS policies untuk admin security

-- admin_permissions: Read-only for all admins
CREATE POLICY "Admins can view permission matrix"
ON admin_permissions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_roles ar
    WHERE ar.user_id = auth.uid()
  )
);

-- admin_roles: Super admin can view
CREATE POLICY "Super admin can view roles"
ON admin_roles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_roles ar
    WHERE ar.user_id = auth.uid()
    AND ar.role = 'super_admin'
  )
);

-- admin_actions: Service role manages, admins can view
CREATE POLICY "Service role can manage actions"
ON admin_actions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view pending actions"
ON admin_actions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_roles ar
    WHERE ar.user_id = auth.uid()
  )
);

-- admin_action_approvals: Service role manages, admins can view
CREATE POLICY "Service role can manage approvals"
ON admin_action_approvals FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view approvals"
ON admin_action_approvals FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_roles ar
    WHERE ar.user_id = auth.uid()
  )
);

-- admin_audit_logs: Service role inserts, RBAC for reading
CREATE POLICY "Service role can insert audit logs"
ON admin_audit_logs FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Admin can view audit logs with permission"
ON admin_audit_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_roles ar
    JOIN admin_permissions ap ON ap.role = ar.role
    WHERE ar.user_id = auth.uid()
    AND (ap.permission = 'audit:view' OR ap.permission = '*')
  )
);

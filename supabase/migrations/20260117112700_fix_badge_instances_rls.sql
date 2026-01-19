-- Fix RLS policies for badge_instances to allow admin operations
-- This fixes the "new row violates row-level security policy" error

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own badges" ON badge_instances;
DROP POLICY IF EXISTS "Public can view active badges" ON badge_instances;

-- Recreate policies with proper admin access

-- 1. Public read for active badges (for display)
CREATE POLICY "Public can view active user badges" ON badge_instances
  FOR SELECT
  USING (status = 'ACTIVE');

-- 2. Users can view their own badges (all statuses)
CREATE POLICY "Users can view own badge instances" ON badge_instances
  FOR SELECT
  USING (user_id = auth.uid());

-- 3. Service role bypass (admins use service role key)
-- Note: Service role automatically bypasses RLS, no policy needed

-- But for safety, let's add a policy for authenticated admins too
CREATE POLICY "Admins can manage all badge instances" ON badge_instances
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

COMMENT ON POLICY "Admins can manage all badge instances" ON badge_instances 
IS 'Allows admins to insert, update, delete badge instances';

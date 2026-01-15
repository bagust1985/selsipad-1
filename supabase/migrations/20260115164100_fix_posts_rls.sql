-- Migration: Update RLS policies for wallet-only authentication
-- Remove auth.uid() dependency since we're not using Supabase Auth anymore

-- Drop old RLS policies that depend on auth.uid()
DROP POLICY IF EXISTS posts_bluecheck_insert ON posts;
DROP POLICY IF EXISTS posts_own_update ON posts;
DROP POLICY IF EXISTS posts_own_delete ON posts;
DROP POLICY IF EXISTS posts_admin_all ON posts;

-- Temporarily disable RLS for posts table (will use application-level checks)
-- OR keep it disabled if using service role for insert
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;

-- Alternative: Keep RLS enabled but allow service_role to bypass
-- Uncomment if you want to keep RLS:
-- ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY posts_service_role_all ON posts
--   FOR ALL USING (
--     auth.jwt() ->> 'role' = 'service_role'
--   );

-- Note: Application will check Blue Check status in createPost action
-- This is more flexible for wallet-only auth

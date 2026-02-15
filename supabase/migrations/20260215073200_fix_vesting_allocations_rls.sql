-- Fix vesting_allocations RLS policy to allow server-side queries
-- Problem: Previous policy (user_id = auth.uid()) blocked server actions
-- Solution: Allow service_role OR users reading their own data

-- Drop existing restrictive policy
DROP POLICY IF EXISTS vesting_allocations_own_read ON vesting_allocations;

-- Create new policy that works with server actions
CREATE POLICY vesting_allocations_user_read ON vesting_allocations
FOR SELECT
TO public
USING (
  -- Allow service_role (server actions, admin queries)
  (auth.jwt() ->> 'role'::text = 'service_role'::text)
  OR
  -- Allow users to read their own allocations (direct client queries)
  (user_id = auth.uid())
);

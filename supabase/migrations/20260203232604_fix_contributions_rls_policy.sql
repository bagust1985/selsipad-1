-- Drop old INSERT policy
DROP POLICY IF EXISTS "Users can create contributions" ON contributions;

-- Create new INSERT policy that allows NULL user_id for wallet-only auth
CREATE POLICY "Allow contributions insert"
ON contributions
FOR INSERT
TO public
WITH CHECK (
  -- Allow if user_id matches auth OR user_id is NULL (wallet-only)
  user_id = auth.uid() OR user_id IS NULL
);

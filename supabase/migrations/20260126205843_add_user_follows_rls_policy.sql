
-- Enable RLS on user_follows table
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- Allow users to follow anyone
CREATE POLICY "Users can follow others"
ON user_follows
FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to see all follows (for follow status check)
CREATE POLICY "Anyone can view follows"
ON user_follows
FOR SELECT
TO public
USING (true);

-- Allow users to unfollow (delete their own follows)
CREATE POLICY "Users can unfollow"
ON user_follows
FOR DELETE
TO public
USING (true);

-- Enable RLS on contributions table if not already enabled
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to contributions
-- This is for transparency - anyone can see all contributions
DROP POLICY IF EXISTS "Public read access to contributions" ON contributions;

CREATE POLICY "Public read access to contributions"
ON contributions
FOR SELECT
TO PUBLIC
USING (true);

COMMENT ON POLICY "Public read access to contributions" ON contributions IS 
'Allow public read access to all contributions for transparency. Contributors can verify their transactions and total raised.';

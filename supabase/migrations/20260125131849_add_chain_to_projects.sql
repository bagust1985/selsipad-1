-- Add chain column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS chain TEXT;

-- Add index for filtering by chain
CREATE INDEX IF NOT EXISTS idx_projects_chain ON projects(chain);

-- Comment
COMMENT ON COLUMN projects.chain IS 'Primary chain for single-chain projects (fairlaunch). For multi-chain, use chains_supported array.';

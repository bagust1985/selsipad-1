-- Fix projects FK for wallet-only auth
-- Change owner_user_id FK from auth.users to profiles

-- Drop old FK constraint
ALTER TABLE projects
DROP CONSTRAINT IF EXISTS projects_owner_user_id_fkey;

-- Add new FK constraint pointing to profiles
ALTER TABLE projects
ADD CONSTRAINT projects_owner_user_id_fkey 
  FOREIGN KEY (owner_user_id) 
  REFERENCES profiles(user_id)
  ON DELETE CASCADE;

-- Comment
COMMENT ON COLUMN projects.owner_user_id IS 'FK to profiles.user_id (wallet-only auth compatible)';

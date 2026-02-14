-- Fix launch_rounds FK for wallet-only auth

-- Drop old FK constraint
ALTER TABLE launch_rounds
DROP CONSTRAINT IF EXISTS launch_rounds_created_by_fkey;

-- Add new FK constraint pointing to profiles
ALTER TABLE launch_rounds
ADD CONSTRAINT launch_rounds_created_by_fkey 
  FOREIGN KEY (created_by) 
  REFERENCES profiles(user_id)
  ON DELETE CASCADE;

-- Comment
COMMENT ON COLUMN launch_rounds.created_by IS 'FK to profiles.user_id (wallet-only auth compatible)';

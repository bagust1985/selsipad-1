
-- Fix FK constraints to reference profiles(user_id) instead of auth.users(id)
-- since our system uses custom wallet-based auth, not Supabase Auth

-- 1. Fix projects.creator_id FK
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_creator_id_fkey;
ALTER TABLE projects ADD CONSTRAINT projects_creator_id_fkey 
  FOREIGN KEY (creator_id) REFERENCES profiles(user_id) ON DELETE SET NULL;

-- 2. Fix launch_rounds.approved_by FK
ALTER TABLE launch_rounds DROP CONSTRAINT IF EXISTS launch_rounds_approved_by_fkey;
ALTER TABLE launch_rounds ADD CONSTRAINT launch_rounds_approved_by_fkey 
  FOREIGN KEY (approved_by) REFERENCES profiles(user_id) ON DELETE SET NULL;

-- 3. Fix launch_rounds.finalized_by FK if exists
ALTER TABLE launch_rounds DROP CONSTRAINT IF EXISTS launch_rounds_finalized_by_fkey;
ALTER TABLE launch_rounds ADD CONSTRAINT launch_rounds_finalized_by_fkey 
  FOREIGN KEY (finalized_by) REFERENCES profiles(user_id) ON DELETE SET NULL;

-- Migration: Remove auth.users foreign keys from posts table
-- Required for wallet-only authentication

-- Drop foreign key constraints that reference auth.users
ALTER TABLE posts 
DROP CONSTRAINT IF EXISTS posts_author_id_fkey;

ALTER TABLE posts 
DROP CONSTRAINT IF EXISTS posts_deleted_by_fkey;

-- Comments
COMMENT ON COLUMN posts.author_id IS 'User identifier - references profiles.user_id for wallet-only auth';
COMMENT ON COLUMN posts.deleted_by IS 'Admin user who deleted - references profiles.user_id';

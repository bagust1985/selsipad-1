-- Make user_id nullable in contributions table
-- This allows contributions to be saved even if auth.users is not populated
-- (wallet-only auth doesn't create auth.users records)

ALTER TABLE contributions
ALTER COLUMN user_id DROP NOT NULL;

-- Add comment explaining why this is nullable
COMMENT ON COLUMN contributions.user_id IS 'User ID - nullable for wallet-only auth where auth.users may not be populated';

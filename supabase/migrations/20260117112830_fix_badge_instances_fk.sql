-- Fix badge_instances foreign key constraint for wallet-only auth
-- The user_id should not require auth.users since we use wallet-only authentication

-- Drop the existing foreign key constraint
ALTER TABLE badge_instances
  DROP CONSTRAINT IF EXISTS badge_instances_user_id_fkey;

-- Add new constraint that allows user_id to exist without auth.users entry
-- Just ensure the UUID format is valid
-- Note: We rely on application logic to ensure valid user_ids from wallets table

-- Optionally, we can add a foreign key to wallets(user_id) instead if that's the source of truth
-- But since wallets can have multiple entries per user_id, we'll just remove the constraint
-- and rely on application-level validation

-- Add check to ensure user has at least one wallet (optional, for data integrity)
-- This will be enforced at application level instead

COMMENT ON COLUMN badge_instances.user_id IS 'User ID from wallets table (wallet-only auth, no auth.users dependency)';

-- Recreate the awarded_by and revoked_by constraints similarly
ALTER TABLE badge_instances
  DROP CONSTRAINT IF EXISTS badge_instances_awarded_by_fkey;

ALTER TABLE badge_instances
  DROP CONSTRAINT IF EXISTS badge_instances_revoked_by_fkey;

COMMENT ON COLUMN badge_instances.awarded_by IS 'Admin user ID who awarded the badge (NULL for auto-awards)';
COMMENT ON COLUMN badge_instances.revoked_by IS 'Admin user ID who revoked the badge';

-- Ensure the table structure is correct
-- user_id should exist in wallets table, so let's verify that relationship at query time

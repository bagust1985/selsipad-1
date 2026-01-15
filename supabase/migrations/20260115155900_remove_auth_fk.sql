-- Migration: Remove foreign key constraint from profiles.user_id
-- Required for wallet-only authentication without Supabase Auth

-- Drop the foreign key constraint that references auth.users
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Also drop from wallets table if it exists
ALTER TABLE wallets 
DROP CONSTRAINT IF EXISTS wallets_user_id_fkey;

-- Add comments
COMMENT ON COLUMN profiles.user_id IS 'User identifier - no longer references auth.users for wallet-only auth';
COMMENT ON COLUMN wallets.user_id IS 'References profiles.user_id for wallet-only auth';

-- Add self-referential constraint: wallets.user_id should reference profiles.user_id
-- Comment out if you want completely independent tables
-- ALTER TABLE wallets ADD CONSTRAINT wallets_user_id_fkey 
--   FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

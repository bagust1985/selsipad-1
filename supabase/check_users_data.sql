-- Quick check: See what users/wallets exist in database
-- Run this in Supabase SQL Editor to see if you have data

-- Check wallets
SELECT 
  w.user_id,
  w.address,
  w.chain,
  w.is_primary,
  w.created_at
FROM wallets w
ORDER BY w.created_at DESC
LIMIT 10;

-- Check profiles
SELECT 
  p.user_id,
  p.username,
  p.created_at
FROM profiles p
ORDER BY p.created_at DESC
LIMIT 10;

-- Check if wallets have matching profiles
SELECT 
  w.user_id,
  w.address,
  w.chain,
  p.username
FROM wallets w
LEFT JOIN profiles p ON w.user_id = p.user_id
WHERE w.is_primary = true
ORDER BY w.created_at DESC
LIMIT 10;

-- If no results, you need to:
-- 1. Connect a wallet on the frontend (this creates wallet + profile)
-- 2. Or create test data manually:

/*
-- Example: Create test user with wallet
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Create user in auth.users
  INSERT INTO auth.users (id, email)
  VALUES (gen_random_uuid(), 'test@example.com')
  RETURNING id INTO test_user_id;
  
  -- Create profile
  INSERT INTO profiles (user_id, username)
  VALUES (test_user_id, 'TestUser');
  
  -- Create wallet
  INSERT INTO wallets (user_id, address, chain, is_primary)
  VALUES (
    test_user_id,
    'GHSR2CagHRvB6n4PGchVEjmNeFUo8HBFdpiE7feC1o2p',
    'SOLANA',
    true
  );
  
  RAISE NOTICE 'Test user created with ID: %', test_user_id;
END $$;
*/

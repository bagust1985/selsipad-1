-- =====================================================
-- FASE 7: Bonding Curve RLS & Constraint Tests
-- =====================================================
-- Description: Tests for RLS policies, constraints, and triggers
-- Run with authenticated Supabase client
-- =====================================================

-- Setup: Create test users and profiles
-- Note: Run these as service_role

BEGIN;

-- Create test data
DO $$
DECLARE
  v_user1_id UUID := gen_random_uuid();
  v_user2_id UUID := gen_random_uuid();
  v_project_id UUID := gen_random_uuid();
  v_pool_id UUID;
BEGIN
  -- Insert test profiles
  INSERT INTO profiles (user_id, username, wallet_address)
  VALUES 
    (v_user1_id, 'test_creator', 'CREATOR_WALLET'),
    (v_user2_id, 'test_other', 'OTHER_WALLET');

  -- Insert test project
  INSERT INTO projects (id, name, creator_id)
  VALUES (v_project_id, 'Test Project', v_user1_id);

  -- Insert test pool
  INSERT INTO bonding_pools (
    id,
    project_id,
    creator_id,
    token_mint,
    token_name,
    token_symbol,
    total_supply,
    virtual_sol_reserves,
    virtual_token_reserves,
    actual_token_reserves,
    graduation_threshold_sol,
    status
  ) VALUES (
    gen_random_uuid(),
    v_project_id,
    v_user1_id,
    'TOKEN_MINT_123',
    'Test Token',
    'TEST',
    '1000000000000000',
    '10000000000',
    '500000000000000',
    '500000000000000',
    '100000000000',
    'DRAFT'
  ) RETURNING id INTO v_pool_id;

  RAISE NOTICE 'Test pool created: %', v_pool_id;
END $$;

COMMIT;

-- =====================================================
-- TEST 1: RLS Policy - Users can view their own pools
-- =====================================================

-- Test as creator (should see pool)
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "<v_user1_id>"}';

SELECT 'TEST 1.1: Creator can view own pool' AS test_name,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM bonding_pools WHERE creator_id = '<v_user1_id>'
    ) THEN 'PASS'
    ELSE 'FAIL'
  END AS result;

-- Test as other user (should NOT see DRAFT pools)
SET LOCAL "request.jwt.claims" TO '{"sub": "<v_user2_id>"}';

SELECT 'TEST 1.2: Other user cannot view DRAFT pools' AS test_name,
  CASE
    WHEN NOT EXISTS (
      SELECT 1 FROM bonding_pools 
      WHERE creator_id = '<v_user1_id>' 
      AND status = 'DRAFT'
    ) THEN 'PASS'
    ELSE 'FAIL'
  END AS result;

-- =====================================================
-- TEST 2: RLS Policy - Public pools visible to all
-- =====================================================

-- Update pool to LIVE status (as service role)
RESET ROLE;

UPDATE bonding_pools
SET status = 'LIVE', deployed_at = NOW()
WHERE creator_id = '<v_user1_id>';

-- Test as other user (should NOW see LIVE pools)
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "<v_user2_id>"}';

SELECT 'TEST 2.1: Other user can view LIVE pools' AS test_name,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM bonding_pools 
      WHERE status = 'LIVE'
    ) THEN 'PASS'
    ELSE 'FAIL'
  END AS result;

-- =====================================================
-- TEST 3: Fee Split Constraint (50/50)
-- =====================================================

RESET ROLE;

-- Valid 50/50 split (should succeed)
INSERT INTO bonding_swaps (
  pool_id,
  user_id,
  swap_type,
  input_amount,
  output_amount,
  price_per_token,
  swap_fee_amount,
  treasury_fee,
  referral_pool_fee,
  tx_hash,
  sol_reserves_before,
  token_reserves_before,
  sol_reserves_after,
  token_reserves_after
)
SELECT 
  id,
  '<v_user1_id>',
  'BUY',
  '100000000',
  '5000000000',
  '20',
  '1500000',
  '750000',
  '750000',
  'TX_VALID_SPLIT',
  '10000000000',
  '500000000000000',
  '10098500000',
  '495000000000000'
FROM bonding_pools
WHERE creator_id = '<v_user1_id>'
LIMIT 1;

SELECT 'TEST 3.1: Valid 50/50 fee split accepted' AS test_name,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM bonding_swaps WHERE tx_hash = 'TX_VALID_SPLIT'
    ) THEN 'PASS'
    ELSE 'FAIL'
  END AS result;

-- Invalid split (should fail)
DO $$
BEGIN
  INSERT INTO bonding_swaps (
    pool_id,
    user_id,
    swap_type,
    input_amount,
    output_amount,
    price_per_token,
    swap_fee_amount,
    treasury_fee,
    referral_pool_fee,
    tx_hash,
    sol_reserves_before,
    token_reserves_before,
    sol_reserves_after,
    token_reserves_after
  )
  SELECT 
    id,
    '<v_user1_id>',
    'BUY',
    '100000000',
    '5000000000',
    '20',
    '1500000',
    '1000000', -- 66.7% (invalid)
    '500000',  -- 33.3% (invalid)
    'TX_INVALID_SPLIT',
    '10000000000',
    '500000000000000',
    '10098500000',
    '495000000000000'
  FROM bonding_pools
  WHERE creator_id = '<v_user1_id>'
  LIMIT 1;

  RAISE NOTICE 'TEST 3.2: FAIL - Invalid fee split was accepted';
EXCEPTION WHEN check_violation THEN
  RAISE NOTICE 'TEST 3.2: PASS - Invalid fee split rejected';
END $$;

-- =====================================================
-- TEST 4: Graduation Constraint (requires LP Lock)
-- =====================================================

-- Try to set status to GRADUATED without LP Lock (should fail)
DO $$
BEGIN
  UPDATE bonding_pools
  SET status = 'GRADUATED', graduated_at = NOW()
  WHERE creator_id = '<v_user1_id>';

  RAISE NOTICE 'TEST 4.1: FAIL - GRADUATED without LP Lock was accepted';
EXCEPTION WHEN check_violation THEN
  RAISE NOTICE 'TEST 4.1: PASS - GRADUATED without LP Lock rejected';
END $$;

-- Create LP Lock and set GRADUATED (should succeed)
DO $$
DECLARE
  v_pool_id UUID;
  v_lock_id UUID;
BEGIN
  SELECT id INTO v_pool_id FROM bonding_pools WHERE creator_id = '<v_user1_id>' LIMIT 1;

  -- Create LP Lock
  INSERT INTO liquidity_locks (
    manager_id,
    project_id,
    token_address,
    token_symbol,
    locked_amount,
    chain,
    lock_start,
    lock_end,
    status
  )
  SELECT
    creator_id,
    project_id,
    'LP_TOKEN_MINT',
    'TEST-LP',
    '1000000000',
    'solana',
    NOW(),
    NOW() + INTERVAL '12 months',
    'ACTIVE'
  FROM bonding_pools
  WHERE id = v_pool_id
  RETURNING id INTO v_lock_id;

  -- Now set GRADUATED (should work)
  UPDATE bonding_pools
  SET 
    status = 'GRADUATED',
    lp_lock_id = v_lock_id,
    graduated_at = NOW()
  WHERE id = v_pool_id;

  RAISE NOTICE 'TEST 4.2: PASS - GRADUATED with LP Lock accepted';
END $$;

-- =====================================================
-- TEST 5: Status Transition Constraints
-- =====================================================

-- Test DRAFT → must not have deployed_at
INSERT INTO bonding_pools (
  project_id,
  creator_id,
  token_mint,
  token_name,
  token_symbol,
  total_supply,
  virtual_sol_reserves,
  virtual_token_reserves,
  actual_token_reserves,
  graduation_threshold_sol,
  status,
  deployed_at
)
SELECT
  project_id,
  creator_id,
  'TOKEN_MINT_456',
  'Test Token 2',
  'TEST2',
  '1000000000000000',
  '10000000000',
  '500000000000000',
  '500000000000000',
  '100000000000',
  'DRAFT',
  NULL  -- Correct: DRAFT has no deployed_at
FROM bonding_pools
WHERE creator_id = '<v_user1_id>'
LIMIT 1;

SELECT 'TEST 5.1: DRAFT status with NULL deployed_at accepted' AS test_name,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM bonding_pools WHERE token_mint = 'TOKEN_MINT_456'
    ) THEN 'PASS'
    ELSE 'FAIL'
  END AS result;

-- =====================================================
-- TEST 6: LP Lock Duration Minimum (12 months)
-- =====================================================

-- Valid 12-month lock (should succeed)
INSERT INTO dex_migrations (
  pool_id,
  target_dex,
  sol_migrated,
  tokens_migrated,
  migration_fee_paid,
  dex_pool_address,
  creation_tx_hash,
  lp_token_mint,
  lp_amount_locked,
  lp_lock_duration_months,
  status
)
SELECT
  id,
  'RAYDIUM',
  '100000000000',
  '500000000000000',
  '2500000000',
  'DEX_POOL_123',
  'TX_MIGRATION_123',
  'LP_MINT_123',
  '1000000000',
  12,  -- Valid: 12 months
  'COMPLETED'
FROM bonding_pools
WHERE creator_id = '<v_user1_id>'
LIMIT 1;

SELECT 'TEST 6.1: 12-month LP lock accepted' AS test_name,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM dex_migrations WHERE lp_lock_duration_months = 12
    ) THEN 'PASS'
    ELSE 'FAIL'
  END AS result;

-- Invalid 6-month lock (should fail)
DO $$
BEGIN
  INSERT INTO dex_migrations (
    pool_id,
    target_dex,
    sol_migrated,
    tokens_migrated,
    migration_fee_paid,
    dex_pool_address,
    creation_tx_hash,
    lp_token_mint,
    lp_amount_locked,
    lp_lock_duration_months,
    status
  )
  SELECT
    id,
    'RAYDIUM',
    '100000000000',
    '500000000000000',
    '2500000000',
    'DEX_POOL_456',
    'TX_MIGRATION_456',
    'LP_MINT_456',
    '1000000000',
    6,  -- Invalid: < 12 months
    'COMPLETED'
  FROM bonding_pools
  WHERE creator_id = '<v_user1_id>'
  LIMIT 1;

  RAISE NOTICE 'TEST 6.2: FAIL - 6-month LP lock was accepted';
EXCEPTION WHEN check_violation THEN
  RAISE NOTICE 'TEST 6.2: PASS - 6-month LP lock rejected (minimum 12 months)';
END $$;

-- =====================================================
-- TEST 7: Status Change Trigger (bonding_events)
-- =====================================================

-- Update pool status and check event creation
UPDATE bonding_pools
SET status = 'LIVE'
WHERE creator_id = '<v_user1_id>'
AND token_mint = 'TOKEN_MINT_456';

SELECT 'TEST 7.1: Status change creates bonding_event' AS test_name,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM bonding_events
      WHERE event_type = 'STATUS_CHANGED'
      AND event_data->>'new_status' = 'LIVE'
      AND event_data->>'old_status' = 'DRAFT'
    ) THEN 'PASS'
    ELSE 'FAIL'
  END AS result;

-- =====================================================
-- TEST SUMMARY
-- =====================================================

SELECT '==================' AS separator;
SELECT 'FASE 7 RLS TESTS COMPLETE' AS summary;
SELECT 'Run results above to verify all tests passed' AS note;
SELECT '==================' AS separator;

-- Cleanup
ROLLBACK;

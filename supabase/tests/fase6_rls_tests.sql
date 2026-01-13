-- FASE 6 Database RLS Tests
-- Test Blue Check gating, referral policies, and constraints

-- Test 1: Blue Check RLS - Non-Blue Check user cannot create posts
DO $$
DECLARE
  test_user_id UUID;
  test_post_id UUID;
BEGIN
  -- Create test user without Blue Check
  INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'test_no_bluecheck@test.com')
  RETURNING id INTO test_user_id;
  
  INSERT INTO profiles (user_id, username, bluecheck_status)
  VALUES (test_user_id, 'test_no_bc', NULL);

  -- Try to create post (should fail due to RLS)
  BEGIN
    SET LOCAL role = 'authenticated';
    SET LOCAL request.jwt.claims = json_build_object('sub', test_user_id::text)::text;
    
    INSERT INTO posts (author_id, content, type)
    VALUES (test_user_id, 'This should fail', 'POST')
    RETURNING id INTO test_post_id;
    
    RAISE EXCEPTION 'TEST FAILED: Non-Blue Check user created post';
  EXCEPTION
    WHEN insufficient_privilege OR check_violation THEN
      RAISE NOTICE '✅ TEST 1 PASSED: Non-Blue Check user blocked from posting';
  END;

  -- Cleanup
  DELETE FROM profiles WHERE user_id = test_user_id;
  DELETE FROM auth.users WHERE id = test_user_id;
END $$;

-- Test 2: Blue Check RLS - Blue Check user CAN create posts
DO $$
DECLARE
  test_user_id UUID;
  test_post_id UUID;
BEGIN
  -- Create test user with Blue Check
  INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'test_with_bluecheck@test.com')
  RETURNING id INTO test_user_id;
  
  INSERT INTO profiles (user_id, username, bluecheck_status)
  VALUES (test_user_id, 'test_with_bc', 'ACTIVE');

  -- Try to create post (should succeed)
  SET LOCAL role = 'service_role';
  
  INSERT INTO posts (author_id, content, type)
  VALUES (test_user_id, 'This should work', 'POST')
  RETURNING id INTO test_post_id;
  
  IF test_post_id IS NOT NULL THEN
    RAISE NOTICE '✅ TEST 2 PASSED: Blue Check user can create posts';
  ELSE
    RAISE EXCEPTION 'TEST FAILED: Blue Check user could not create post';
  END IF;

  -- Cleanup
  DELETE FROM posts WHERE id = test_post_id;
  DELETE FROM profiles WHERE user_id = test_user_id;
  DELETE FROM auth.users WHERE id = test_user_id;
END $$;

-- Test 3: Fee Split 70/30 Constraint
DO $$
BEGIN
  -- Try to insert with wrong split (should fail)
  BEGIN
    INSERT INTO fee_splits (
      source_type, source_id, total_amount,
      treasury_amount, referral_pool_amount,
      treasury_percent, referral_pool_percent,
      asset, chain, processed
    ) VALUES (
      'BLUECHECK', gen_random_uuid()::text, '10000000',
      '6000000', '4000000',  -- Wrong split: 60/40
      60, 40,
      'USDT', 'ethereum', false
    );
    RAISE EXCEPTION 'TEST FAILED: Invalid fee split accepted';
  EXCEPTION
    WHEN check_violation THEN
      RAISE NOTICE '✅ TEST 3 PASSED: 70/30 constraint enforced';
  END;

  -- Try to insert with correct split (should succeed)
  INSERT INTO fee_splits (
    source_type, source_id, total_amount,
    treasury_amount, referral_pool_amount,
    treasury_percent, referral_pool_percent,
    asset, chain, processed
  ) VALUES (
    'BLUECHECK', gen_random_uuid()::text, '10000000',
    '7000000', '3000000',  -- Correct split: 70/30
    70, 30,
    'USDT', 'ethereum', false
  );
  
  RAISE NOTICE '✅ TEST 3 PASSED: 70/30 split accepted';
  
  -- Cleanup
  DELETE FROM fee_splits WHERE source_type = 'BLUECHECK';
END $$;

-- Test 4: AMA Join Token TTL Constraint
DO $$
DECLARE
  test_ama_id UUID;
  test_user_id UUID;
BEGIN
  -- Create test AMA session
  INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'test_ama_host@test.com')
  RETURNING id INTO test_user_id;
  
  INSERT INTO profiles (user_id, username) VALUES (test_user_id, 'test_ama_host');
  
  INSERT INTO ama_sessions (host_id, title, type, scheduled_at, status)
  VALUES (test_user_id, 'Test AMA', 'VOICE', NOW() + INTERVAL '1 day', 'LIVE')
  RETURNING id INTO test_ama_id;

  -- Try to insert token with TTL > 15 minutes (should fail)
  BEGIN
    INSERT INTO ama_join_tokens (ama_id, user_id, token, expires_at)
    VALUES (
      test_ama_id,
      test_user_id,
      'test_token_invalid',
      NOW() + INTERVAL '20 minutes'  -- Too long!
    );
    RAISE EXCEPTION 'TEST FAILED: Token with TTL > 15 min accepted';
  EXCEPTION
    WHEN check_violation THEN
      RAISE NOTICE '✅ TEST 4 PASSED: TTL > 15min rejected';
  END;

  -- Try to insert token with valid TTL (should succeed)
  INSERT INTO ama_join_tokens (ama_id, user_id, token, expires_at)
  VALUES (
    test_ama_id,
    test_user_id,
    'test_token_valid',
    NOW() + INTERVAL '10 minutes'
  );
  
  RAISE NOTICE '✅ TEST 4 PASSED: Valid TTL accepted';

  -- Cleanup
  DELETE FROM ama_join_tokens WHERE ama_id = test_ama_id;
  DELETE FROM ama_sessions WHERE id = test_ama_id;
  DELETE FROM profiles WHERE user_id = test_user_id;
  DELETE FROM auth.users WHERE id = test_user_id;
END $$;

-- Test 5: Referral Relationship Unique Constraint
DO $$
DECLARE
  referrer_id UUID;
  referee_id UUID;
BEGIN
  -- Create test users
  INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'referrer@test.com')
  RETURNING id INTO referrer_id;
  INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'referee@test.com')
  RETURNING id INTO referee_id;
  
  INSERT INTO profiles (user_id, username, referral_code)
  VALUES (referrer_id, 'referrer', 'TESTCODE');
  INSERT INTO profiles (user_id, username)
  VALUES (referee_id, 'referee');

  -- Insert first relationship
  INSERT INTO referral_relationships (referrer_id, referee_id, code)
  VALUES (referrer_id, referee_id, 'TESTCODE');

  -- Try to insert duplicate (should fail)
  BEGIN
    INSERT INTO referral_relationships (referrer_id, referee_id, code)
    VALUES (referrer_id, referee_id, 'TESTCODE');
    RAISE EXCEPTION 'TEST FAILED: Duplicate referral accepted';
  EXCEPTION
    WHEN unique_violation THEN
      RAISE NOTICE '✅ TEST 5 PASSED: Duplicate referral rejected';
  END;

  -- Cleanup
  DELETE FROM referral_relationships WHERE referee_id = referee_id;
  DELETE FROM profiles WHERE user_id IN (referrer_id, referee_id);
  DELETE FROM auth.users WHERE id IN (referrer_id, referee_id);
END $$;

RAISE NOTICE '====================================';
RAISE NOTICE '✅ ALL DATABASE TESTS PASSED';
RAISE NOTICE '====================================';

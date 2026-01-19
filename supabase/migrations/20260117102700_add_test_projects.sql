-- Quick fix: Add a test project for badge testing
-- This allows admin to test badge granting functionality

-- Only insert if there are valid users with wallets
DO $$
DECLARE
  valid_user_id UUID;
BEGIN
  -- Get a valid user_id that exists in both auth.users and has a wallet
  SELECT w.user_id INTO valid_user_id
  FROM wallets w
  INNER JOIN auth.users u ON w.user_id = u.id
  LIMIT 1;

  -- Only insert if we found a valid user
  IF valid_user_id IS NOT NULL THEN
    INSERT INTO projects (
      id,
      owner_user_id,
      name,
      symbol,
      description,
      status,
      chains_supported
    ) VALUES (
      gen_random_uuid(),
      valid_user_id,
      'Test Project - SELSIPAD Demo',
      'DEMO',
      'This is a test project for badge granting demonstration',
      'LIVE',
      ARRAY['SOLANA', 'EVM_56']
    )
    ON CONFLICT DO NOTHING;

    -- Add another test project
    INSERT INTO projects (
      id,
      owner_user_id,
      name,
      symbol,
      description,
      status,
      chains_supported
    ) VALUES (
      gen_random_uuid(),
      valid_user_id,
      'Sample IDO Project',
      'SAMPLE',
      'Sample project for testing badge system',
      'APPROVED',
      ARRAY['SOLANA']
    )
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Test projects created successfully';
  ELSE
    RAISE NOTICE 'No valid users found - skipping test project creation';
  END IF;
END $$;

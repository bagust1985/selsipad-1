-- Quick setup script for Phase 2C testing
-- Run this in Supabase SQL Editor

-- 1. Set an existing user as admin (replace with your actual wallet address)
UPDATE profiles 
SET is_admin = true 
WHERE user_id = (
  SELECT user_id 
  FROM wallets 
  WHERE address = '0x5a9594E3178F85380FE20A0ba83f4e3d6d32BB1F' -- REPLACE WITH YOUR WALLET
  LIMIT 1
);

-- 2. Check admin user setup
SELECT 
  p.user_id,
  p.username,
  p.is_admin,
  w.address,
  w.chain
FROM profiles p
JOIN wallets w ON w.user_id = p.user_id
WHERE p.is_admin = true;

-- 3. Check launch_rounds table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'launch_rounds'
  AND column_name IN ('rejection_reason', 'reviewed_by', 'reviewed_at')
ORDER BY column_name;

-- 4. Create a test presale in SUBMITTED_FOR_REVIEW status (if needed)
-- NOTE: Normally you'd do this via the wizard, but for quick testing:
/*
INSERT INTO launch_rounds (
  owner_wallet,
  network,
  status,
  params
) VALUES (
  '0x5a9594E3178F85380FE20A0ba83f4e3d6d32BB1F', -- Your wallet
  'EVM_56',
  'SUBMITTED_FOR_REVIEW',
  '{
    "project_name": "Test Presale for Review",
    "project_description": "Testing admin review queue",
    "price": 0.001,
    "softcap": 10,
    "hardcap": 100,
    "kyc_status": "CONFIRMED",
    "sc_scan_status": "PASS"
  }'::jsonb
);
*/

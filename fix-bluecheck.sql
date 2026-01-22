/**
 * One-time script to fix Blue Check status
 * For wallet: 0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e
 * TX Hash: 0x0af081827de4d951f2fde28b295dac7c86236fa414a1eb29f51c98e3a2ec4252
 */

UPDATE profiles
SET 
  bluecheck_status = 'ACTIVE',
  bluecheck_purchased_at = NOW(),
  bluecheck_tx_hash = '0x0af081827de4d951f2fde28b295dac7c86236fa414a1eb29f51c98e3a2ec4252',
  bluecheck_grant_type = 'PURCHASE'
WHERE user_id = (
  SELECT profile_id 
  FROM wallets 
  WHERE LOWER(address) = '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e' 
    AND network = 'EVM'
);

-- Create audit log
INSERT INTO bluecheck_audit_log (action_type, target_user_id, tx_hash, amount_usd, metadata)
SELECT 
  'PURCHASE',
  profile_id,
  '0x0af081827de4d951f2fde28b295dac7c86236fa414a1eb29f51c98e3a2ec4252',
  10,
  jsonb_build_object(
    'wallet_address', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e',
    'manual_fix', true
  )
FROM wallets
WHERE LOWER(address) = '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e' 
  AND network = 'EVM';

-- Verify
SELECT 
  p.username,
  p.bluecheck_status,
  p.bluecheck_purchased_at,
  p.bluecheck_tx_hash,
  w.address
FROM profiles p
JOIN wallets w ON p.user_id = w.profile_id
WHERE LOWER(w.address) = '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e'
  AND w.network = 'EVM';

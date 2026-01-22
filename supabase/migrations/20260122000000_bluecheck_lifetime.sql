-- Migration: Blue Check Lifetime Access
-- Description: Update Blue Check to lifetime access, add audit logging, and prepare for smart contract integration

-- Add new columns for lifetime tracking (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='bluecheck_purchased_at') THEN
    ALTER TABLE profiles ADD COLUMN bluecheck_purchased_at timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='bluecheck_tx_hash') THEN
    ALTER TABLE profiles ADD COLUMN bluecheck_tx_hash text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='bluecheck_grant_type') THEN
    ALTER TABLE profiles ADD COLUMN bluecheck_grant_type text DEFAULT 'PURCHASE';
  END IF;
END $$;

-- Make expiry nullable only if column exists (keep for historical data)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='bluecheck_expires_at') THEN
    ALTER TABLE profiles ALTER COLUMN bluecheck_expires_at DROP NOT NULL;
  END IF;
END $$;

-- Create fee events tracking table
CREATE TABLE IF NOT EXISTS fee_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL, -- 'BLUE_CHECK_PURCHASE'
  user_id uuid REFERENCES profiles(user_id),
  amount_usd numeric NOT NULL,
  amount_native numeric NOT NULL,
  tx_hash text NOT NULL,
  network text DEFAULT 'BSC',
  created_at timestamptz DEFAULT now()
);

-- Create fee splits tracking
CREATE TABLE IF NOT EXISTS fee_splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_event_id uuid REFERENCES fee_events(id),
  recipient_type text NOT NULL, -- 'TREASURY' or 'REFERRAL_POOL'
  percentage numeric NOT NULL,
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create audit log for Blue Check actions (APPEND-ONLY)
CREATE TABLE IF NOT EXISTS bluecheck_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL, -- 'PURCHASE', 'MANUAL_GRANT', 'REVOKE', 'RESTORE', 'BAN'
  target_user_id uuid NOT NULL REFERENCES profiles(user_id),
  admin_user_id uuid REFERENCES profiles(user_id), -- NULL for purchases
  reason text, -- For revokes/bans
  tx_hash text, -- For purchases
  amount_usd numeric, -- For purchases
  metadata jsonb, -- Additional data
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_bluecheck_audit_target ON bluecheck_audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_bluecheck_audit_admin ON bluecheck_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_bluecheck_audit_created ON bluecheck_audit_log(created_at DESC);

-- Indexes for fee events
CREATE INDEX IF NOT EXISTS idx_fee_events_user ON fee_events(user_id);
CREATE INDEX IF NOT EXISTS idx_fee_events_type ON fee_events(event_type);
CREATE INDEX IF NOT EXISTS idx_fee_splits_event ON fee_splits(fee_event_id);

-- RLS for audit log (read-only for admins, append-only via server)
ALTER TABLE bluecheck_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit log"
  ON bluecheck_audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- RLS for fee events (admins and finance can view)
ALTER TABLE fee_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read fee events"
  ON fee_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- RLS for fee splits (admins and finance can view)
ALTER TABLE fee_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read fee splits"
  ON fee_splits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Comment for documentation
COMMENT ON COLUMN profiles.bluecheck_expires_at IS 'Legacy field - Blue Check is now lifetime. Kept for historical data.';
COMMENT ON COLUMN profiles.bluecheck_purchased_at IS 'Timestamp when Blue Check was purchased or granted';
COMMENT ON COLUMN profiles.bluecheck_tx_hash IS 'Transaction hash for on-chain purchases';
COMMENT ON COLUMN profiles.bluecheck_grant_type IS 'PURCHASE (via smart contract) or MANUAL_GRANT (by admin)';
COMMENT ON TABLE bluecheck_audit_log IS 'Append-only audit trail for all Blue Check actions';

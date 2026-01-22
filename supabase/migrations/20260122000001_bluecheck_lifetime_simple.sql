-- Migration: Blue Check Lifetime Access (Simplified)
-- Description: Update Blue Check to lifetime access, add audit logging

-- Add new columns for lifetime tracking
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

-- Create audit log table for Blue Check actions
CREATE TABLE IF NOT EXISTS bluecheck_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL,
  target_user_id uuid NOT NULL REFERENCES profiles(user_id),
  admin_user_id uuid REFERENCES profiles(user_id),
  reason text,
  tx_hash text,
  amount_usd numeric,
  metadata jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes for audit queries (skip if exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bluecheck_audit_target') THEN
    CREATE INDEX idx_bluecheck_audit_target ON bluecheck_audit_log(target_user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bluecheck_audit_admin') THEN
    CREATE INDEX idx_bluecheck_audit_admin ON bluecheck_audit_log(admin_user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bluecheck_audit_created') THEN
    CREATE INDEX idx_bluecheck_audit_created ON bluecheck_audit_log(created_at DESC);
  END IF;
END $$;

-- RLS for audit log (read-only for admins)
ALTER TABLE bluecheck_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read audit log" ON bluecheck_audit_log;
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

-- Comment for documentation
COMMENT ON COLUMN profiles.bluecheck_purchased_at IS 'Timestamp when Blue Check was purchased or granted';
COMMENT ON COLUMN profiles.bluecheck_tx_hash IS 'Transaction hash for on-chain purchases';
COMMENT ON COLUMN profiles.bluecheck_grant_type IS 'PURCHASE (via smart contract) or MANUAL_GRANT (by admin)';
COMMENT ON TABLE bluecheck_audit_log IS 'Append-only audit trail for all Blue Check actions';

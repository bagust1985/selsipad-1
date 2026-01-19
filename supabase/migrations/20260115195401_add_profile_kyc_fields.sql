-- Add KYC status fields to profiles table
-- Enables tracking KYC verification status at user level

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'not_started' 
  CHECK (kyc_status IN ('not_started', 'pending', 'verified', 'rejected'));

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS kyc_submitted_at TIMESTAMPTZ;

-- Create index for filtering by KYC status
CREATE INDEX IF NOT EXISTS idx_profiles_kyc_status ON profiles(kyc_status);

COMMENT ON COLUMN profiles.kyc_status IS 'User KYC verification status (not_started, pending, verified, rejected)';
COMMENT ON COLUMN profiles.kyc_submitted_at IS 'Timestamp when KYC was first submitted';

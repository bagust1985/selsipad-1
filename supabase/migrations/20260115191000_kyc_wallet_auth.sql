-- Fix KYC submissions for wallet-only auth
-- Remove FK constraint to auth.users

ALTER TABLE kyc_submissions 
  DROP CONSTRAINT IF EXISTS kyc_submissions_user_id_fkey;

ALTER TABLE kyc_submissions 
  DROP CONSTRAINT IF EXISTS kyc_submissions_reviewed_by_fkey;

-- Update comments
COMMENT ON COLUMN kyc_submissions.user_id 
  IS 'User ID (references profiles.user_id for wallet-only auth)';

COMMENT ON COLUMN kyc_submissions.reviewed_by 
  IS 'Admin user_id who reviewed (references profiles.user_id)';

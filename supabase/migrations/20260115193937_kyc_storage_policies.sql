-- KYC Storage Bucket Configuration
-- Note: This migration is no longer needed for RLS policies since we use Pattern 81
-- (Application-Layer Auth Gating via Service Role Client)

-- For wallet-only auth (Pattern 68), auth.uid() is NULL, so traditional RLS policies
-- that rely on auth.uid() won't work. Instead, we:
-- 1. Validate authentication in Server Actions (apps/web/app/profile/kyc/actions.ts)
-- 2. Use service role client to bypass RLS for storage operations
-- 3. Organize files by user_id folder structure: /{user_id}/{timestamp}/{filename}

-- The storage.objects table keeps RLS enabled (default), but uploads bypass it
-- via the service role key in the upload action.

-- If you need to query uploaded files via the regular client, create policies
-- based on folder structure matching instead of auth.uid():
/*
CREATE POLICY "Users can view own KYC documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents' AND
  (storage.foldername(name))[1] = current_setting('request.jwt.claims')::json->>'sub'
);
*/


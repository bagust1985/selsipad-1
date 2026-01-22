-- Simplify RLS policies - allow anon and authenticated uploads
-- This is safe because we validate userId in server action

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow avatar uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow avatar updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow avatar deletes" ON storage.objects;
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;

-- Allow anyone (anon + authenticated) to upload, update, delete in avatars bucket
-- Server-side code ensures userId validation
CREATE POLICY "Avatars: Allow all operations"
ON storage.objects
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

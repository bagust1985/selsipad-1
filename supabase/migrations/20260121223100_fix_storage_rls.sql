-- Fix RLS policies for avatars bucket to work with session-based auth
-- Since we're not using Supabase Auth, we need to make the upload policy less restrictive

-- Drop old policies
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;

-- Allow authenticated users to upload to avatars bucket
-- Path validation is now done in application code
CREATE POLICY "Allow avatar uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
);

-- Allow users to update files in avatars bucket
CREATE POLICY "Allow avatar updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- Allow users to delete files in avatars bucket
CREATE POLICY "Allow avatar deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- Allow public read access to all avatars
CREATE POLICY "Public avatar access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

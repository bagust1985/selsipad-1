-- Fix Storage RLS Policies for public-files bucket
-- Run this in Supabase Dashboard → SQL Editor

-- First, drop any existing policies on storage.objects for this bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own files" ON storage.objects;
DROP POLICY IF EXISTS "public_files_public_read" ON storage.objects;
DROP POLICY IF EXISTS "public_files_authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "public_files_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "public_files_authenticated_delete" ON storage.objects;

-- Create new policies with correct permissions
-- Allow anyone to SELECT/read files from public-files bucket
CREATE POLICY "public_files_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'public-files');

-- CRITICAL: Only allow Blue Check users to INSERT files to public-files bucket
-- This matches the posts table RLS gating
CREATE POLICY "public_files_bluecheck_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'public-files' 
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
      AND (p.bluecheck_status = 'ACTIVE' OR p.bluecheck_status = 'VERIFIED')
  )
);

-- Allow Blue Check users to UPDATE their own files
CREATE POLICY "public_files_bluecheck_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'public-files' 
  AND auth.uid() = owner
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
      AND (p.bluecheck_status = 'ACTIVE' OR p.bluecheck_status = 'VERIFIED')
  )
)
WITH CHECK (
  bucket_id = 'public-files' 
  AND auth.uid() = owner
);

-- Allow Blue Check users to DELETE their own files
CREATE POLICY "public_files_bluecheck_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'public-files' 
  AND auth.uid() = owner
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
      AND (p.bluecheck_status = 'ACTIVE' OR p.bluecheck_status = 'VERIFIED')
  )
);

-- Verify policies are created
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'objects' AND policyname LIKE 'public_files%';

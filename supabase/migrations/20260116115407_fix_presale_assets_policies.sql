-- Migration: Fix presale-assets bucket RLS policies for client-side upload
-- Created: 2026-01-16
-- Description: Drop auth-based policies and allow public uploads (bucket is public anyway)

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Authenticated users can upload presale assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own presale assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own presale assets" ON storage.objects;

-- Allow anyone to upload to presale-assets bucket
-- (File validation happens in client component: max 2MB, image types only)
CREATE POLICY "Anyone can upload presale assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'presale-assets');

-- Allow anyone to update in presale-assets bucket
CREATE POLICY "Anyone can update presale assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'presale-assets');

-- Allow anyone to delete in presale-assets bucket
CREATE POLICY "Anyone can delete presale assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'presale-assets');


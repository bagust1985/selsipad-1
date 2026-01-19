-- Migration: Create Supabase Storage bucket for presale assets
-- Created: 2026-01-16
-- Description: Create presale-assets bucket with RLS policies for logo and banner uploads

-- Insert storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'presale-assets',
  'presale-assets',
  true,  -- Public bucket (images need to be publicly accessible)
  2097152,  -- 2MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Anyone can read (public bucket)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'presale-assets');

-- RLS Policy: Authenticated users can upload
CREATE POLICY "Authenticated users can upload presale assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'presale-assets' 
  AND auth.role() = 'authenticated'
);

-- RLS Policy: Users can update their own uploads
CREATE POLICY "Users can update own presale assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'presale-assets' 
  AND auth.uid() = owner
);

-- RLS Policy: Users can delete their own uploads
CREATE POLICY "Users can delete own presale assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'presale-assets' 
  AND auth.uid() = owner
);


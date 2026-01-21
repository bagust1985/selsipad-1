-- Migration: Create public-files storage bucket for post images
-- Creates a public bucket for storing user-uploaded images

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'public-files',
  'public-files',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read files (public access)
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'public-files');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'public-files');

-- Allow users to update their own files
CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'public-files' AND owner::uuid = auth.uid());

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'public-files' AND owner::uuid = auth.uid());

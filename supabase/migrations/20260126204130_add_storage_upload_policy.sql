
-- Allow authenticated users to upload to public-files bucket
CREATE POLICY "Allow authenticated uploads to public-files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'public-files');

-- Allow public read access to public-files
CREATE POLICY "Allow public read access to public-files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'public-files');

-- Allow users to update their own uploads
CREATE POLICY "Allow users to update own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'public-files')
WITH CHECK (bucket_id = 'public-files');

-- Allow users to delete their own uploads
CREATE POLICY "Allow users to delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'public-files');

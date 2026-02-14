
-- Create very permissive policy for public-files bucket (for testing)
-- Allow ALL operations for ALL users (public + authenticated)

-- Allow anyone to upload to public-files
CREATE POLICY "Public upload to public-files"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'public-files');

-- Allow anyone to read from public-files
CREATE POLICY "Public read from public-files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'public-files');

-- Allow anyone to update files in public-files
CREATE POLICY "Public update in public-files"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'public-files')
WITH CHECK (bucket_id = 'public-files');

-- Allow anyone to delete from public-files
CREATE POLICY "Public delete from public-files"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'public-files');

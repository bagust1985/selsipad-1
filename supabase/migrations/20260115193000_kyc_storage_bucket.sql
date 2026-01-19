-- Create KYC Documents Storage Bucket
-- Private bucket for encrypted KYC document storage

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents',
  'kyc-documents',
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for kyc-documents bucket
-- Note: These are applied in 20260115193937_kyc_storage_policies.sql
-- For wallet-only auth (Pattern 68), we use service role client in the upload action
-- to bypass RLS since auth.uid() is NULL for wallet-authenticated users (Pattern 81)

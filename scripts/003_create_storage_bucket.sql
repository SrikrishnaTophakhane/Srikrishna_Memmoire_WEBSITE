-- Note: This script creates a storage bucket for design uploads
-- Run this in the Supabase SQL editor or via migration

-- Create storage bucket for designs if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('designs', 'designs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload own designs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'designs' AND
  (storage.foldername(name))[1] = 'designs' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow users to view their own designs
CREATE POLICY "Users can view own designs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'designs' AND
  (storage.foldername(name))[1] = 'designs' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow public access to design files (for mockups)
CREATE POLICY "Public can view designs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'designs');

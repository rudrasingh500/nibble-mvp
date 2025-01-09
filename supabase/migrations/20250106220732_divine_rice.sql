/*
  # Add image storage support
  
  1. Changes
    - Add image_path column to vendors table
    - Create storage bucket for vendor images
*/

-- Create storage bucket for vendor images
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-images', 'vendor-images', true);

-- Add image_path column to vendors table
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS image_path text;

-- Create policy to allow public access to vendor images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'vendor-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'vendor-images');

-- Allow users to update/delete their own images
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid() = owner);

CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid() = owner);
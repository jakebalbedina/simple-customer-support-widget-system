-- Create storage bucket for support attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'support-attachments',
  'support-attachments',
  false,
  52428800, -- 50MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the bucket
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'support-attachments');

-- Allow authenticated users to read files
CREATE POLICY "Allow authenticated reads"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'support-attachments');

-- Allow anon users to upload files (for customer support)
CREATE POLICY "Allow anon uploads"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'support-attachments');

-- Allow anon users to read files (for customer support)
CREATE POLICY "Allow anon reads"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'support-attachments');

-- Allow service role full access
CREATE POLICY "Allow service role full access"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'support-attachments')
WITH CHECK (bucket_id = 'support-attachments');

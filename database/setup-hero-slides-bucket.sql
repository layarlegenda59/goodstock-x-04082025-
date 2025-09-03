-- Setup Storage Bucket 'hero-slides' untuk Hero Slides
-- Jalankan script ini di Supabase Dashboard > SQL Editor

-- 1. Buat bucket 'hero-slides' jika belum ada
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hero_slides', 
  'hero-slides', 
  true, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Hapus policy lama jika ada
DROP POLICY IF EXISTS "Allow public read access for hero slides" ON storage.objects;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "hero_slides_public_read" ON storage.objects;
DROP POLICY IF EXISTS "hero_slides_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "hero_slides_authenticated_update" ON storage.objects;

-- 3. Buat policy untuk public read access
CREATE POLICY "hero_slides_public_read" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'hero_slides');

-- 4. Buat policy untuk authenticated upload
CREATE POLICY "hero_slides_authenticated_upload" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'hero_slides' AND
    (
      -- Allow if user is admin
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
      )
      OR
      -- Allow if user is authenticated (fallback)
      auth.role() = 'authenticated'
    )
  );

-- 5. Buat policy untuk authenticated update
CREATE POLICY "hero_slides_authenticated_update" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'hero_slides' AND
    (
      -- Allow if user is admin
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
      )
      OR
      -- Allow if user is authenticated (fallback)
      auth.role() = 'authenticated'
    )
  );

-- 6. TIDAK ada policy untuk DELETE (sesuai permintaan)
-- Ini berarti hanya superuser yang bisa menghapus file

-- Verifikasi bucket dan policies
SELECT 
  'Bucket created:' as status,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'hero_slides';

SELECT 
  'Policies created:' as status,
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%hero_slides%';
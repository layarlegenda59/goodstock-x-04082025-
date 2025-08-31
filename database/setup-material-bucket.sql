-- Setup Storage Bucket 'material' untuk Hero Slides
-- Jalankan script ini di Supabase Dashboard > SQL Editor

-- 1. Buat bucket 'material' jika belum ada
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'material', 
  'material', 
  true, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Hapus policy lama jika ada
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin update" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin delete" ON storage.objects;
DROP POLICY IF EXISTS "material_public_read" ON storage.objects;
DROP POLICY IF EXISTS "material_admin_upload" ON storage.objects;
DROP POLICY IF EXISTS "material_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "material_admin_delete" ON storage.objects;

-- 3. Buat policy untuk public read access
CREATE POLICY "material_public_read" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'material');

-- 4. Buat policy untuk admin upload
CREATE POLICY "material_admin_upload" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'material' AND
    (
      -- Allow if user is admin
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
      OR
      -- Allow if user email contains 'admin'
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.email LIKE '%admin%'
      )
    )
  );

-- 5. Buat policy untuk admin update
CREATE POLICY "material_admin_update" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'material' AND
    (
      -- Allow if user is admin
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
      OR
      -- Allow if user email contains 'admin'
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.email LIKE '%admin%'
      )
    )
  );

-- 6. Buat policy untuk admin delete
CREATE POLICY "material_admin_delete" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'material' AND
    (
      -- Allow if user is admin
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
      OR
      -- Allow if user email contains 'admin'
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.email LIKE '%admin%'
      )
    )
  );

-- 7. Verifikasi bucket dan policies
SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'material';

-- 8. Tampilkan policies yang aktif
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%material%';

SELECT 'Material bucket setup completed successfully!' as status;
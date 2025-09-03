# 🔧 Panduan Memperbaiki RLS Policies untuk Hero Slides

## 🚨 Masalah
Menu "Kelola Slide Hero Section" di Fashion Streetwear tidak dapat menampilkan atau mengelola data karena kebijakan Row Level Security (RLS) yang salah di Supabase.

## 🔍 Diagnosis
Script `fix-rls-policies.js` menunjukkan:
- ✅ **Read access**: Berfungsi normal
- ❌ **Write access**: Diblokir oleh RLS policy
- **Error**: `new row violates row-level security policy for table "hero_slides"`

## 🛠️ Solusi

### Langkah 1: Buka Supabase Dashboard
1. Masuk ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project **Goodstock-X**
3. Navigasi ke **SQL Editor**

### Langkah 2: Jalankan Script Perbaikan
Copy dan paste script berikut ke SQL Editor, lalu klik **Run**:

```sql
-- Fix RLS policies for hero_slides and category_images tables
-- This script fixes the permission denied error for Fashion Streetwear admin access

-- First, drop existing problematic policies
DROP POLICY IF EXISTS "Allow admin full access on hero_slides" ON hero_slides;
DROP POLICY IF EXISTS "Allow admin full access on category_images" ON category_images;
DROP POLICY IF EXISTS "Allow public read access on hero_slides" ON hero_slides;
DROP POLICY IF EXISTS "Allow public read access on category_images" ON category_images;

-- Create public read policies (for frontend access)
CREATE POLICY "Allow public read access on hero_slides" ON hero_slides
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on category_images" ON category_images
    FOR SELECT USING (true);

-- Create admin full access policies using the profiles table
CREATE POLICY "Allow admin full access on hero_slides" ON hero_slides
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Allow admin full access on category_images" ON category_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Verify tables have RLS enabled
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_images ENABLE ROW LEVEL SECURITY;

-- Insert sample data for Fashion Streetwear if not exists
INSERT INTO hero_slides (title, subtitle, image_url, cta_text, cta_link, is_active, order_index)
SELECT 
    'Fashion Streetwear Collection',
    'Discover the latest trends in urban fashion',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop',
    'Shop Now',
    '/kategori/fashion-streetwear',
    true,
    1
WHERE NOT EXISTS (
    SELECT 1 FROM hero_slides 
    WHERE title = 'Fashion Streetwear Collection'
);

-- Insert category image for Fashion Streetwear if not exists
INSERT INTO category_images (category_key, category_name, image_url, is_active)
SELECT 
    'fashion-streetwear',
    'Fashion Streetwear',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM category_images 
    WHERE category_key = 'fashion-streetwear'
);

-- Verify the setup
SELECT 'RLS policies updated successfully for hero_slides and category_images' as status;
SELECT COUNT(*) as hero_slides_count FROM hero_slides;
SELECT COUNT(*) as category_images_count FROM category_images;
```

### Langkah 3: Verifikasi Perbaikan
Setelah menjalankan script, Anda akan melihat output:
```
RLS policies updated successfully for hero_slides and category_images
hero_slides_count: [jumlah]
category_images_count: [jumlah]
```

### Langkah 4: Test Akses Admin
1. Login sebagai admin di aplikasi
2. Navigasi ke **Admin Dashboard > Kelola Slide Hero Section**
3. Coba tambah, edit, atau hapus slide
4. Pastikan semua operasi berfungsi normal

## 🔐 Penjelasan Kebijakan RLS

### Kebijakan Baru:
1. **Public Read Access**: Memungkinkan semua user membaca data hero slides dan category images
2. **Admin Full Access**: Memberikan akses penuh (CRUD) hanya untuk user dengan `role = 'admin'` di tabel `profiles`

### Keamanan:
- ✅ Data tetap aman dengan RLS enabled
- ✅ Public hanya bisa membaca (untuk tampilan frontend)
- ✅ Admin memiliki akses penuh untuk manajemen
- ✅ Menggunakan tabel `profiles` untuk verifikasi role

## 🧪 Testing
Untuk memverifikasi perbaikan, jalankan:
```bash
node fix-rls-policies.js
```

Output yang diharapkan:
```
✅ Read access works
✅ Write access works
✅ Category images access works
```

## 📋 Checklist Verifikasi
- [ ] Script SQL berhasil dijalankan tanpa error
- [ ] Menu "Kelola Slide Hero Section" dapat diakses
- [ ] Dapat menambah slide baru
- [ ] Dapat mengedit slide existing
- [ ] Dapat menghapus slide
- [ ] Dapat mengubah urutan slide
- [ ] Frontend tetap menampilkan hero slides dengan normal

## 🆘 Troubleshooting

### Jika masih ada error "permission denied":
1. Pastikan user admin memiliki `role = 'admin'` di tabel `profiles`
2. Cek apakah RLS policies sudah teraplikasi dengan benar
3. Logout dan login ulang sebagai admin

### Jika frontend tidak menampilkan slides:
1. Cek apakah ada data di tabel `hero_slides` dengan `is_active = true`
2. Pastikan public read policy sudah aktif
3. Periksa console browser untuk error JavaScript

## 📞 Support
Jika masih mengalami masalah, periksa:
1. Supabase project settings
2. User authentication status
3. Network connectivity
4. Browser console untuk error details
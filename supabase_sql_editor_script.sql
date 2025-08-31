-- =====================================================
-- SCRIPT SQL UNTUK SUPABASE SQL EDITOR
-- Menambahkan kolom originalPrice untuk fitur harga diskon
-- =====================================================

-- INSTRUKSI PENGGUNAAN:
-- 1. Buka Supabase Dashboard (https://supabase.com/dashboard)
-- 2. Pilih project Anda
-- 3. Buka SQL Editor di sidebar kiri
-- 4. Copy-paste script ini ke SQL Editor
-- 5. Klik "Run" untuk menjalankan script

-- =====================================================
-- STEP 1: Menambahkan kolom originalPrice
-- =====================================================

-- Tambah kolom originalPrice ke tabel products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS "originalPrice" NUMERIC;

-- =====================================================
-- STEP 2: Update data existing products
-- =====================================================

-- Set originalPrice sama dengan price untuk produk yang sudah ada
-- (supaya tidak ada data yang kosong)
UPDATE products 
SET "originalPrice" = price 
WHERE "originalPrice" IS NULL;

-- =====================================================
-- STEP 3: Menambahkan komentar untuk dokumentasi
-- =====================================================

-- Tambah komentar untuk kolom originalPrice
COMMENT ON COLUMN products."originalPrice" IS 'Harga asli produk sebelum diskon';

-- =====================================================
-- STEP 4: Verifikasi hasil (opsional)
-- =====================================================

-- Query untuk mengecek apakah kolom sudah ditambahkan
-- Uncomment baris di bawah jika ingin mengecek:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'products' AND column_name = 'originalPrice';

-- Query untuk melihat sample data
-- Uncomment baris di bawah jika ingin melihat data:
-- SELECT id, name, price, "originalPrice", discount 
-- FROM products 
-- LIMIT 5;

-- =====================================================
-- SELESAI!
-- =====================================================
-- Setelah menjalankan script ini, fitur auto-calculate 
-- harga setelah diskon akan berfungsi dengan baik.
-- 
-- Kolom yang tersedia:
-- - originalPrice: Harga asli produk
-- - price: Harga setelah diskon (dihitung otomatis)
-- - discount: Persentase diskon
-- =====================================================
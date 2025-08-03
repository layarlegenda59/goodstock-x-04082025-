-- Script SQL untuk memastikan semua brand menggunakan kapitalisasi yang benar
-- Dan membuat fungsi untuk otomatis mengkapitalisasi brand baru

-- Fungsi untuk mengkapitalisasi setiap kata dalam brand
CREATE OR REPLACE FUNCTION capitalize_brand(brand_name TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Mengkapitalisasi huruf pertama setiap kata
  RETURN INITCAP(brand_name);
END;
$$ LANGUAGE plpgsql;

-- Update semua brand yang ada untuk memastikan kapitalisasi yang benar
UPDATE products 
SET brand = capitalize_brand(brand)
WHERE brand != capitalize_brand(brand);

-- Trigger function untuk otomatis mengkapitalisasi brand saat insert atau update
CREATE OR REPLACE FUNCTION auto_capitalize_brand()
RETURNS TRIGGER AS $$
BEGIN
  -- Kapitalisasi brand sebelum insert/update
  NEW.brand = capitalize_brand(NEW.brand);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger jika sudah ada
DROP TRIGGER IF EXISTS trigger_auto_capitalize_brand ON products;

-- Buat trigger untuk otomatis mengkapitalisasi brand
CREATE TRIGGER trigger_auto_capitalize_brand
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION auto_capitalize_brand();

-- Verifikasi semua brand sudah terkapitalisasi dengan benar
SELECT DISTINCT brand 
FROM products 
ORDER BY brand;

-- Tampilkan brand yang mungkin masih memiliki masalah kapitalisasi
SELECT DISTINCT brand
FROM products 
WHERE brand != capitalize_brand(brand)
ORDER BY brand;

-- Test insert dengan brand huruf kecil (untuk verifikasi trigger)
-- INSERT INTO products (name, brand, price, category, subcategory, gender, sizes)
-- VALUES ('Test Product', 'test brand', 100000, 'sepatu', 'Sneakers', 'unisex', ARRAY['42']);

-- Tampilkan jumlah produk per brand setelah kapitalisasi
SELECT brand, COUNT(*) as total_products
FROM products 
GROUP BY brand 
ORDER BY brand;
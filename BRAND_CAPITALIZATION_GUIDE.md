# Panduan Kapitalisasi Brand

Dokumen ini menjelaskan cara memastikan semua nama brand di database menggunakan kapitalisasi yang benar (huruf pertama setiap kata adalah huruf kapital).

## Masalah

Sebelumnya, beberapa brand di database menggunakan huruf kecil di awal kata, seperti:
- `nike` → seharusnya `Nike`
- `adidas` → seharusnya `Adidas`
- `the north face` → seharusnya `The North Face`

## Solusi

Telah dibuat beberapa script SQL untuk mengatasi masalah ini:

### 1. Script Perbaikan Manual (`fix_brand_capitalization.sql`)

Script ini berisi UPDATE statement untuk brand-brand populer yang sering digunakan:

```sql
-- Contoh:
UPDATE products 
SET brand = 'Nike'
WHERE LOWER(brand) = 'nike';

UPDATE products 
SET brand = 'Adidas'
WHERE LOWER(brand) = 'adidas';
```

**Cara menggunakan:**
1. Buka Supabase SQL Editor
2. Copy-paste isi file `fix_brand_capitalization.sql`
3. Jalankan script

### 2. Script Otomatis (`ensure_brand_capitalization.sql`)

Script ini membuat fungsi dan trigger untuk otomatis mengkapitalisasi brand:

```sql
-- Fungsi untuk kapitalisasi
CREATE OR REPLACE FUNCTION capitalize_brand(brand_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN INITCAP(brand_name);
END;
$$ LANGUAGE plpgsql;

-- Trigger otomatis
CREATE TRIGGER trigger_auto_capitalize_brand
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION auto_capitalize_brand();
```

**Cara menggunakan:**
1. Buka Supabase SQL Editor
2. Copy-paste isi file `ensure_brand_capitalization.sql`
3. Jalankan script
4. Setelah ini, semua brand baru akan otomatis terkapitalisasi

### 3. Data Sample yang Sudah Diperbaiki

File `insert_sample_products.sql` telah diperbaiki untuk menggunakan kapitalisasi yang benar:
- `'nike'` → `'Nike'`
- Semua brand lainnya sudah menggunakan format yang benar

### 4. Mock Data yang Sudah Diperbaiki

File `lib/mockData.ts` telah diperbaiki:
- `brand: 'nike'` → `brand: 'Nike'`
- `brand: 'adidas'` → `brand: 'Adidas'`

## Verifikasi

Untuk memverifikasi bahwa semua brand sudah terkapitalisasi dengan benar:

```sql
-- Lihat semua brand yang ada
SELECT DISTINCT brand 
FROM products 
ORDER BY brand;

-- Cek brand yang masih bermasalah
SELECT DISTINCT brand
FROM products 
WHERE brand != INITCAP(brand)
ORDER BY brand;
```

## Aturan Kapitalisasi

1. **Huruf pertama setiap kata harus kapital**
   - ✅ `Nike`, `Adidas`, `The North Face`
   - ❌ `nike`, `adidas`, `the north face`

2. **Akronim tetap menggunakan huruf kapital semua**
   - ✅ `H&M`, `COS`
   - ❌ `h&m`, `cos`

3. **Nama brand dengan format khusus**
   - ✅ `Off-White`, `Levi's`, `J.Crew`
   - ❌ `off-white`, `levi's`, `j.crew`

## Maintenance

Dengan trigger yang telah dibuat, semua brand baru akan otomatis terkapitalisasi. Namun, untuk brand dengan format khusus (seperti akronim), mungkin perlu penyesuaian manual.

## Troubleshooting

Jika masih ada brand yang tidak terkapitalisasi dengan benar:

1. Jalankan query untuk melihat brand bermasalah:
   ```sql
   SELECT DISTINCT brand
   FROM products 
   WHERE brand != INITCAP(brand);
   ```

2. Update manual jika diperlukan:
   ```sql
   UPDATE products 
   SET brand = 'Brand Name Yang Benar'
   WHERE LOWER(brand) = 'brand name yang salah';
   ```

3. Untuk brand dengan format khusus, tambahkan ke script `fix_brand_capitalization.sql`
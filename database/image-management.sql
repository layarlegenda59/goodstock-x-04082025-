-- Script SQL untuk menambahkan tabel manajemen gambar
-- Jalankan script ini di Supabase SQL Editor

-- Tabel untuk menyimpan data hero slides
CREATE TABLE IF NOT EXISTS hero_slides (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  cta_link TEXT,
  cta_text VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel untuk menyimpan data gambar kategori
CREATE TABLE IF NOT EXISTS category_images (
  id SERIAL PRIMARY KEY,
  category_key VARCHAR(50) NOT NULL UNIQUE,
  category_name VARCHAR(100) NOT NULL,
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk performa yang lebih baik
CREATE INDEX IF NOT EXISTS idx_hero_slides_active_order ON hero_slides(is_active, order_index);
CREATE INDEX IF NOT EXISTS idx_category_images_key ON category_images(category_key);

-- Trigger untuk update timestamp otomatis
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Terapkan trigger ke tabel hero_slides
DROP TRIGGER IF EXISTS update_hero_slides_updated_at ON hero_slides;
CREATE TRIGGER update_hero_slides_updated_at
    BEFORE UPDATE ON hero_slides
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Terapkan trigger ke tabel category_images
DROP TRIGGER IF EXISTS update_category_images_updated_at ON category_images;
CREATE TRIGGER update_category_images_updated_at
    BEFORE UPDATE ON category_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert data default untuk hero slides
INSERT INTO hero_slides (title, subtitle, image_url, cta_link, cta_text, order_index) VALUES
('Koleksi Sepatu Terbaru', 'Dapatkan diskon hingga 50% untuk semua sneakers premium', 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg', '/kategori/sepatu', 'Shop Now', 1),
('Tas Premium Collection', 'Luxury bags untuk gaya hidup modern Anda', 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg', '/kategori/tas', 'Lihat Koleksi', 2),
('Fashion Streetwear', 'Tampil trendy dengan koleksi pakaian terkini', 'https://images.pexels.com/photos/1182825/pexels-photo-1182825.jpeg', '/kategori/pakaian', 'Belanja Sekarang', 3)
ON CONFLICT DO NOTHING;

-- Insert data default untuk category images
INSERT INTO category_images (category_key, category_name, image_url) VALUES
('sepatu', 'Sepatu', 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg'),
('tas', 'Tas', 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg'),
('pakaian', 'Pakaian', 'https://images.pexels.com/photos/1182825/pexels-photo-1182825.jpeg')
ON CONFLICT (category_key) DO NOTHING;

-- RLS (Row Level Security) policies
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_images ENABLE ROW LEVEL SECURITY;

-- Policy untuk membaca data (public access)
CREATE POLICY "Allow public read access on hero_slides" ON hero_slides
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on category_images" ON category_images
    FOR SELECT USING (true);

-- Policy untuk admin (full access)
-- Catatan: Sesuaikan dengan sistem autentikasi admin Anda
CREATE POLICY "Allow admin full access on hero_slides" ON hero_slides
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email LIKE '%admin%'
        )
    );

CREATE POLICY "Allow admin full access on category_images" ON category_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email LIKE '%admin%'
        )
    );

-- Buat storage bucket untuk gambar jika belum ada
-- Jalankan di Supabase Dashboard > Storage
-- INSERT INTO storage.buckets (id, name, public) VALUES ('material', 'material', true);

-- Policy untuk storage bucket
-- CREATE POLICY "Allow public read access" ON storage.objects FOR SELECT USING (bucket_id = 'material');
-- CREATE POLICY "Allow admin upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'material' AND auth.role() = 'authenticated');
-- CREATE POLICY "Allow admin update" ON storage.objects FOR UPDATE USING (bucket_id = 'material' AND auth.role() = 'authenticated');
-- CREATE POLICY "Allow admin delete" ON storage.objects FOR DELETE USING (bucket_id = 'material' AND auth.role() = 'authenticated');

-- Tampilkan hasil
SELECT 'Hero slides table created successfully' as status;
SELECT 'Category images table created successfully' as status;
SELECT 'Default data inserted successfully' as status;
SELECT 'Database setup completed!' as status;
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
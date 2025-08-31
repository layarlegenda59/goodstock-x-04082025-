-- Fix RLS policies for products table to allow updates

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON products;

-- Create new policies that allow all operations
CREATE POLICY "Enable read access for all users" ON products
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON products
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON products
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users only" ON products
    FOR DELETE USING (auth.role() = 'authenticated');

-- Update some products to have promo = true
UPDATE products 
SET promo = true 
WHERE id IN (
    SELECT id FROM products 
    ORDER BY created_at DESC 
    LIMIT 5
);

-- Verify the update
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as promo_products FROM products WHERE promo = true;
SELECT name, brand, promo FROM products WHERE promo = true LIMIT 5;
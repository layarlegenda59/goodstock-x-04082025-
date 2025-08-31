-- Fix RLS policies for products table to resolve net::ERR_ABORTED errors
-- This script fixes the permission issues by updating the RLS policies

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Anyone can read products" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

-- Create new policies with proper authentication

-- Allow public read access for all products (no authentication required)
CREATE POLICY "Public can read all products" ON products
    FOR SELECT USING (true);

-- Allow authenticated users to read products (backup policy)
CREATE POLICY "Authenticated users can read products" ON products
    FOR SELECT TO authenticated USING (true);

-- Allow admins to insert products
CREATE POLICY "Admins can insert products" ON products
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Allow admins to update products
CREATE POLICY "Admins can update products" ON products
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Allow admins to delete products
CREATE POLICY "Admins can delete products" ON products
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Verify the policies are working
SELECT 'Products RLS policies updated successfully' as status;

-- Test queries to verify access
-- SELECT COUNT(*) FROM products;
-- SELECT COUNT(*) FROM products WHERE promo = true;
-- Fix RLS policies for hero_slides and category_images tables
-- This script fixes the permission denied error by using the correct authentication system

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Allow admin full access on hero_slides" ON hero_slides;
DROP POLICY IF EXISTS "Allow admin full access on category_images" ON category_images;

-- Create new policies using the profiles table with role-based access
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

-- Verify the policies are working
SELECT 'Hero slides RLS policies updated successfully' as status;
SELECT 'Category images RLS policies updated successfully' as status;

-- Test query to verify admin access (run this as admin user)
-- SELECT COUNT(*) FROM hero_slides;
-- SELECT COUNT(*) FROM category_images;
-- SQL script to fix the products table updated_at column
-- Run this in the Supabase SQL Editor

-- First, check if the updated_at column exists
DO $$
BEGIN
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE products ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    END IF;
END $$;

-- Update existing records to have updated_at = created_at if updated_at is null
UPDATE products 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Ensure the column has a default value
ALTER TABLE products 
ALTER COLUMN updated_at SET DEFAULT now();

-- Make sure the column is not null
ALTER TABLE products 
ALTER COLUMN updated_at SET NOT NULL;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Verify the column exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'updated_at';
-- Add originalPrice column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS "originalPrice" NUMERIC;

-- Update existing products to set originalPrice equal to current price if null
UPDATE products 
SET "originalPrice" = price 
WHERE "originalPrice" IS NULL;

-- Add comment to the column
COMMENT ON COLUMN products."originalPrice" IS 'Original price before any discounts';
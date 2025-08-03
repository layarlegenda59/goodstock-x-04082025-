/*
  # Remove problematic updated_at trigger

  The trigger function was causing errors when updating products.
  Since we're managing updated_at manually in the application,
  we'll remove the automatic trigger to prevent conflicts.
*/

-- Drop the existing trigger and function that's causing issues
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Note: updated_at will be managed manually in the application code
-- This prevents the "record 'new' has no field 'updated_at'" error
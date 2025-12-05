-- Add design_config column to cart_items table
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS design_config JSONB;

-- Add design_config column to order_items table
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS design_config JSONB;

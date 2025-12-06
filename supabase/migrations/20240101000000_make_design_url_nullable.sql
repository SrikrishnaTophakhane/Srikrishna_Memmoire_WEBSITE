-- Migration to make design_url nullable in cart_items and order_items

ALTER TABLE cart_items ALTER COLUMN design_url DROP NOT NULL;
ALTER TABLE order_items ALTER COLUMN design_url DROP NOT NULL;

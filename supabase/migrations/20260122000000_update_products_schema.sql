/*
  # Actualización del Schema de Productos
  
  ## Cambios
  1. Hacer el campo `image` opcional (nullable)
  2. Agregar nuevo campo `purchase_price` para el precio de compra
  
  ## Detalles
  - `image` ahora puede ser NULL
  - `purchase_price` es un campo numeric(10,2) con valor por defecto 0
*/

-- Hacer el campo image nullable
ALTER TABLE products ALTER COLUMN image DROP NOT NULL;
ALTER TABLE products ALTER COLUMN image DROP DEFAULT;
ALTER TABLE products ALTER COLUMN image SET DEFAULT NULL;

-- Agregar campo purchase_price (precio de compra)
ALTER TABLE products ADD COLUMN IF NOT EXISTS purchase_price numeric(10,2) NOT NULL DEFAULT 0;

-- Actualizar productos existentes para tener un purchase_price si no tienen uno
UPDATE products SET purchase_price = 0 WHERE purchase_price IS NULL;

-- Agregar comentarios para documentación
COMMENT ON COLUMN products.image IS 'URL de la imagen del producto (opcional)';
COMMENT ON COLUMN products.price IS 'Precio de venta del producto';
COMMENT ON COLUMN products.purchase_price IS 'Precio de compra del producto';

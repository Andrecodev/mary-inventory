# Aplicar Migración de Base de Datos

## Actualización del Schema de Productos

Esta migración actualiza la tabla `products` para:
1. Hacer el campo `image` opcional (nullable)
2. Agregar el campo `purchase_price` (precio de compra)

## Cómo aplicar la migración

### Opción 1: Usando Supabase CLI

Si tienes Supabase CLI instalado:

```bash
supabase db push
```

### Opción 2: Manualmente en Supabase Dashboard

1. Ve a tu proyecto en https://supabase.com
2. Navega a **SQL Editor**
3. Copia y pega el contenido del archivo: 
   `supabase/migrations/20260122000000_update_products_schema.sql`
4. Ejecuta la consulta

### Opción 3: Usando psql (si tienes acceso directo)

```bash
psql -h <your-project-ref>.supabase.co -p 5432 -d postgres -U postgres -f supabase/migrations/20260122000000_update_products_schema.sql
```

## Verificación

Después de aplicar la migración, verifica que:
- El campo `image` ahora es nullable
- El campo `purchase_price` existe en la tabla
- Los productos existentes tienen `purchase_price = 0` por defecto

## SQL de la migración

```sql
-- Hacer el campo image nullable
ALTER TABLE products ALTER COLUMN image DROP NOT NULL;
ALTER TABLE products ALTER COLUMN image DROP DEFAULT;
ALTER TABLE products ALTER COLUMN image SET DEFAULT NULL;

-- Agregar campo purchase_price (precio de compra)
ALTER TABLE products ADD COLUMN IF NOT EXISTS purchase_price numeric(10,2) NOT NULL DEFAULT 0;

-- Actualizar productos existentes
UPDATE products SET purchase_price = 0 WHERE purchase_price IS NULL;
```

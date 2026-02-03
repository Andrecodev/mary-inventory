# Aplicar Migración de Row Level Security (RLS)

## ⚠️ IMPORTANTE: Esta migración es CRÍTICA para que la app funcione

Si no puedes guardar productos, clientes o proveedores, **necesitas aplicar esta migración AHORA**.

## ¿Qué es Row Level Security (RLS)?

RLS es una característica de seguridad de Supabase/PostgreSQL que asegura que:
- ✅ Cada usuario solo puede ver y modificar sus propios datos
- ✅ Los datos están aislados entre diferentes usuarios
- ✅ No hay acceso no autorizado a datos de otros usuarios

## El Problema

Si ves este error en la consola:
```
📡 Ejecutando INSERT en tabla products...
```
Y luego **nada más** (sin éxito ni error), es porque **RLS está bloqueando las operaciones**.

## La Solución

Aplicar esta migración que:
1. Habilita RLS en todas las tablas
2. Crea políticas que permiten a usuarios autenticados gestionar sus propios datos

---

## Opción 1: Usando Supabase Dashboard (MÁS RÁPIDO)

### Paso 1: Ve a SQL Editor

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. En el menú lateral, click en **SQL Editor**

### Paso 2: Ejecuta la Migración

1. Click en "**New Query**"
2. Copia y pega **TODO el contenido** del archivo:
   `supabase/migrations/20260128000001_enable_rls_policies.sql`
3. Click en "**Run**" (o presiona Ctrl+Enter)

### Paso 3: Verifica

Deberías ver un mensaje verde: "Success. No rows returned"

---

## Opción 2: Usando Supabase CLI

Si tienes Supabase CLI instalado:

```bash
supabase db push
```

---

## Opción 3: Aplicar Políticas Manualmente (Si prefieres UI)

### Para cada tabla (products, customers, suppliers, etc.):

1. Ve a **Database** → **Tables**
2. Selecciona la tabla (ej: `products`)
3. Click en la pestaña "**Policies**"
4. Click "**Enable RLS**"
5. Click "**New Policy**"
6. Selecciona "**For full customization**"
7. Completa:

**Policy Name**: `Users can manage own [table name]`

**Target roles**: `authenticated`

**USING expression**:
```sql
auth.uid() = user_id
```

**WITH CHECK expression**:
```sql
auth.uid() = user_id
```

**Allowed operations**: Selecciona ALL (SELECT, INSERT, UPDATE, DELETE)

8. Click "**Review**" → "**Save policy**"

### Repite para cada tabla:
- ✅ products
- ✅ customers
- ✅ suppliers
- ✅ account_transactions
- ✅ payment_records
- ✅ purchase_history
- ✅ order_history

---

## Verificación

Después de aplicar la migración:

### 1. Verifica que RLS está habilitado

En SQL Editor, ejecuta:
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('products', 'customers', 'suppliers', 'account_transactions', 'payment_records', 'purchase_history', 'order_history');
```

Deberías ver `rowsecurity = true` para todas las tablas.

### 2. Verifica las políticas

```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

Deberías ver políticas para cada tabla.

### 3. Prueba en la App

1. Recarga la aplicación (F5)
2. Intenta agregar un producto
3. Deberías ver en la consola:
   ```
   ✅ Producto creado: {...}
   ```
4. El producto debería aparecer en la lista

---

## Solución de Problemas

### Error: "new row violates row-level security policy"

**Causa**: La política está bloqueando el INSERT

**Solución**: Verifica que:
- El usuario está autenticado (`auth.uid()` no es null)
- El campo `user_id` en la tabla coincide con `auth.uid()`

### Error: "permission denied for table products"

**Causa**: El usuario no tiene permisos básicos en la tabla

**Solución**: Ejecuta:
```sql
GRANT ALL ON products TO authenticated;
GRANT ALL ON customers TO authenticated;
GRANT ALL ON suppliers TO authenticated;
GRANT ALL ON account_transactions TO authenticated;
GRANT ALL ON payment_records TO authenticated;
GRANT ALL ON purchase_history TO authenticated;
GRANT ALL ON order_history TO authenticated;
```

### Sigue sin funcionar

**Solución temporal** (SOLO PARA DESARROLLO):

Deshabilita RLS temporalmente:
```sql
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
```

⚠️ **NO hacer esto en producción** - tus datos no estarán seguros.

---

## ¿Por qué necesito esto?

Sin RLS:
- ❌ Cualquier usuario podría ver datos de otros usuarios
- ❌ No hay aislamiento de datos
- ❌ Problemas de seguridad y privacidad

Con RLS:
- ✅ Cada usuario solo ve sus propios datos
- ✅ Datos aislados y seguros
- ✅ Cumplimiento de privacidad (GDPR, etc.)
- ✅ La app funciona correctamente

---

## Orden de Migraciones

Asegúrate de aplicar las migraciones en este orden:

1. ✅ `20260122000000_update_products_schema.sql` (purchase_price)
2. ✅ `20260128000000_auto_update_debt_totals.sql` (triggers deuda)
3. ✅ `20260128000001_enable_rls_policies.sql` (RLS - ESTA)

---

## Después de Aplicar

Tu app debería funcionar completamente:
- ✅ Crear productos, clientes, proveedores
- ✅ Crear transacciones
- ✅ Registrar pagos
- ✅ Ver reportes
- ✅ Sincronización en tiempo real entre pestañas
- ✅ Datos seguros y aislados por usuario

---

**IMPORTANTE**: Esta migración es **esencial** para el funcionamiento de la aplicación. Sin ella, ninguna operación de guardado funcionará.

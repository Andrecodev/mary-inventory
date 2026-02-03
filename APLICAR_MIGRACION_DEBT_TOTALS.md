# Aplicar Migración de Actualización Automática de Deudas

## Actualización Automática de Totales de Deuda

Esta migración implementa triggers de base de datos que **actualizan automáticamente** los campos `total_debt` (clientes) y `total_owed` (proveedores) basándose en las transacciones de cuentas.

### ¿Qué hace esta migración?

1. **Crea funciones de base de datos** que calculan automáticamente:
   - `customer.total_debt` = suma de `remaining_amount` de transacciones `receivable` no pagadas
   - `supplier.total_owed` = suma de `remaining_amount` de transacciones `payable` no pagadas

2. **Crea triggers** que se ejecutan automáticamente cuando:
   - Se crea una nueva transacción (INSERT)
   - Se actualiza una transacción existente (UPDATE) - ej. al registrar un pago
   - Se elimina una transacción (DELETE)

3. **Inicializa los valores** de clientes y proveedores existentes con los totales correctos

### Beneficios

- ✅ **Consistencia automática**: Los totales siempre están sincronizados con las transacciones
- ✅ **Menos código**: No necesitas actualizar manualmente estos campos en tu aplicación
- ✅ **Rendimiento**: Los cálculos se hacen en la base de datos de forma eficiente
- ✅ **Integridad de datos**: Imposible que los totales estén desactualizados

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
   `supabase/migrations/20260128000000_auto_update_debt_totals.sql`
4. Ejecuta la consulta

### Opción 3: Usando psql (si tienes acceso directo)

```bash
psql -h <your-project-ref>.supabase.co -p 5432 -d postgres -U postgres -f supabase/migrations/20260128000000_auto_update_debt_totals.sql
```

## Verificación

Después de aplicar la migración, verifica que:

1. **Los totales se inicializaron correctamente**:
   ```sql
   SELECT name, total_debt FROM customers WHERE total_debt > 0;
   SELECT name, total_owed FROM suppliers WHERE total_owed > 0;
   ```

2. **Los triggers funcionan** - Crea/actualiza una transacción y verifica que los totales cambian automáticamente:
   ```sql
   -- Verifica que los triggers existen
   SELECT trigger_name, event_manipulation
   FROM information_schema.triggers
   WHERE trigger_name IN ('trigger_update_customer_debt', 'trigger_update_supplier_owed');
   ```

## Impacto en la Aplicación

### Antes de la migración

El código tenía que actualizar manualmente `total_debt` y `total_owed`:

```typescript
// ❌ Ya no necesario
const updatedCustomer = {
  ...customer,
  totalDebt: customer.totalDebt + transaction.remainingAmount
};
await updateCustomer(updatedCustomer);
```

### Después de la migración

Los totales se actualizan automáticamente:

```typescript
// ✅ Solo necesitas crear/actualizar la transacción
await createAccountTransaction(transaction, userId);
// total_debt se actualiza automáticamente por el trigger
```

## Migración Anterior

Recuerda que también debes aplicar la migración anterior si aún no lo has hecho:
- `supabase/migrations/20260122000000_update_products_schema.sql` (para `purchase_price`)

## Notas Técnicas

- Los triggers usan `COALESCE` para manejar casos donde no hay transacciones (retorna 0)
- Solo cuentan transacciones con `status != 'paid'` para calcular deudas pendientes
- Los triggers se ejecutan **después** de cada operación (`AFTER` trigger)
- Compatible con transacciones de múltiples usuarios (cada trigger actualiza solo el cliente/proveedor afectado)

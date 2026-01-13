# InvenFlow - Sistema de Gestión Empresarial

## Descripción
InvenFlow es un sistema completo de gestión empresarial que permite administrar inventario, clientes, proveedores, cuentas por cobrar y pagar, todo en español con autenticación de Google y almacenamiento en la nube con Supabase.

## Características Principales

### Autenticación y Seguridad
- Inicio de sesión con Google OAuth
- Sesiones seguras con Supabase Auth
- Row Level Security (RLS) - cada usuario solo ve sus propios datos
- Perfil de usuario automático al registrarse

### Gestión de Inventario
- Agregar, editar y eliminar productos
- Control de stock con alertas de bajo inventario
- Categorización de productos
- Imágenes de productos (con URLs de Pexels por defecto)
- Búsqueda y filtrado por categoría
- Código de barras (preparado para escáner)

### Gestión de Clientes
- Registro completo de clientes
- Categorización (VIP, Regular, Nuevo, Inactivo)
- Sistema de calificación (1-5 estrellas)
- Seguimiento de deuda total
- Historial de compras
- Notas y preferencias del cliente
- Fechas de seguimiento

### Gestión de Proveedores
- Información completa de proveedores
- Sistema de calificación de rendimiento
  - Entregas a tiempo
  - Calidad de productos
  - Comunicación
- Términos de contrato y pago
- Horarios de entrega
- Reorden automático (configurable)
- Historial de pedidos

### Cuentas por Cobrar y Pagar
- Transacciones separadas por tipo (cobrar/pagar)
- Seguimiento de facturas
- Estados: Pendiente, Parcial, Pagado, Vencido
- Registro de pagos múltiples por transacción
- Métodos de pago: Efectivo, Tarjeta, Transferencia, Cheque
- Términos de pago personalizables
- Vista detallada de cada transacción

### Panel de Control (Dashboard)
- Estadísticas en tiempo real
- Total de productos
- Alertas de stock bajo
- Pagos vencidos
- Ingresos totales del mes
- Acciones rápidas

### Interfaz de Usuario
- Diseño profesional y moderno
- 100% responsive (móvil, tablet, desktop)
- En español por defecto
- Alternancia entre español e inglés
- Accesible (WCAG 2.1)
- Iconos con Lucide React
- Menú de usuario con foto
- Cierre de sesión seguro

## Configuración Inicial

### 1. Configurar Supabase

#### Crear Proyecto en Supabase
1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Espera a que el proyecto se inicialice (2-3 minutos)

#### Obtener Credenciales
1. En tu proyecto de Supabase, ve a **Settings** > **API**
2. Copia la **Project URL** y la **anon/public key**
3. Actualiza el archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_url_de_supabase_aquí
VITE_SUPABASE_ANON_KEY=tu_clave_anon_aquí
```

### 2. Configurar Google OAuth

#### Crear Credenciales en Google Cloud
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **APIs & Services** > **Credentials**
4. Haz clic en **Create Credentials** > **OAuth client ID**
5. Si es necesario, configura la pantalla de consentimiento OAuth
6. Selecciona **Web application**
7. Agrega los **Authorized redirect URIs**:
   - Para desarrollo: `http://localhost:5173`
   - Para producción: tu URL de Supabase Auth callback

#### Configurar en Supabase
1. En Supabase, ve a **Authentication** > **Providers**
2. Habilita **Google**
3. Ingresa tu **Client ID** y **Client Secret** de Google
4. Guarda los cambios

### 3. Ejecutar las Migraciones
Las migraciones ya fueron ejecutadas automáticamente. La base de datos incluye:
- profiles (perfiles de usuario)
- products (productos)
- customers (clientes)
- suppliers (proveedores)
- account_transactions (transacciones)
- payment_records (registros de pago)
- purchase_history (historial de compras)
- order_history (historial de pedidos)

### 4. Instalar Dependencias e Iniciar
```bash
npm install
npm run dev
```

## Estructura de la Base de Datos

### Tablas Principales

#### products
- Control de inventario
- Alertas de stock bajo
- Categorías personalizables
- Código de barras

#### customers
- Información de contacto
- Categorización y calificación
- Seguimiento de deuda
- Historial de compras

#### suppliers
- Información de contacto
- Métricas de rendimiento
- Configuración de reorden automático
- Historial de pedidos

#### account_transactions
- Cuentas por cobrar y pagar
- Productos incluidos (JSONB)
- Estados de pago
- Facturas y referencias

#### payment_records
- Registro de cada pago
- Múltiples métodos de pago
- Referencias y notas

### Seguridad (RLS)
Todas las tablas tienen Row Level Security habilitado:
- Los usuarios solo pueden ver sus propios datos
- Políticas restrictivas por defecto
- Verificación de auth.uid() en todas las operaciones

## Uso de la Aplicación

### Inicio de Sesión
1. Abre la aplicación
2. Haz clic en "Continuar con Google"
3. Selecciona tu cuenta de Google
4. Autoriza la aplicación
5. Serás redirigido automáticamente

### Gestión de Datos

#### Agregar un Producto
1. Ve a "Inventario"
2. Haz clic en "Agregar Nuevo Producto"
3. Completa el formulario
4. Haz clic en "Guardar"

#### Agregar un Cliente
1. Ve a "Clientes"
2. Haz clic en "Agregar Cliente"
3. Completa la información
4. Asigna una categoría y calificación
5. Guarda

#### Crear una Cuenta por Cobrar
1. Ve a "Cuentas"
2. Selecciona la pestaña "Cuentas por Cobrar"
3. Haz clic en "Nueva Transacción"
4. Selecciona el cliente
5. Agrega productos
6. Establece términos de pago
7. Guarda

#### Registrar un Pago
1. En "Cuentas", encuentra la transacción
2. Haz clic en el ícono de tarjeta de crédito
3. Ingresa el monto y método de pago
4. Agrega referencia (número de cheque, etc.)
5. Registra el pago

### Cambiar Idioma
1. Haz clic en el botón "English" en la navegación superior
2. La interfaz cambiará inmediatamente
3. Se guardarán las preferencias

### Cerrar Sesión
1. Haz clic en tu foto de perfil (esquina superior derecha)
2. Selecciona "Cerrar Sesión"
3. Serás redirigido al inicio de sesión

## Integración de Componentes con Supabase

### Ejemplo: Agregar un Producto
```typescript
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { createProduct } from '../lib/database';

const { user } = useAuth();
const { dispatch, loadData } = useApp();

const handleAddProduct = async (productData) => {
  try {
    // Crear en Supabase
    await createProduct(productData, user.id);

    // Recargar datos
    await loadData();

    // Cerrar formulario
    setShowAddForm(false);
  } catch (error) {
    console.error('Error adding product:', error);
    alert('Error al agregar el producto');
  }
};
```

### Ejemplo: Actualizar un Cliente
```typescript
import { updateCustomer } from '../lib/database';

const handleUpdateCustomer = async (customerData) => {
  try {
    await updateCustomer(customerData);
    await loadData();
    setEditingCustomer(null);
  } catch (error) {
    console.error('Error updating customer:', error);
    alert('Error al actualizar el cliente');
  }
};
```

### Ejemplo: Eliminar un Proveedor
```typescript
import { deleteSupplier } from '../lib/database';

const handleDeleteSupplier = async (id) => {
  if (!confirm('¿Estás seguro?')) return;

  try {
    await deleteSupplier(id);
    await loadData();
  } catch (error) {
    console.error('Error deleting supplier:', error);
    alert('Error al eliminar el proveedor');
  }
};
```

## Funciones Auxiliares de Supabase

El archivo `src/lib/database.ts` contiene funciones para:
- `createProduct`, `updateProduct`, `deleteProduct`
- `createCustomer`, `updateCustomer`, `deleteCustomer`
- `createSupplier`, `updateSupplier`, `deleteSupplier`
- `createAccountTransaction`, `updateAccountTransaction`, `deleteAccountTransaction`
- `createPaymentRecord`
- `createPurchaseHistory`
- `createOrderHistory`, `updateOrderHistory`

## Mejoras Responsivas

### Diseño Móvil
- Navegación en cuadrícula para pantallas pequeñas
- Botones táctiles grandes (mínimo 56px)
- Formularios optimizados para móviles
- Tarjetas apiladas verticalmente

### Diseño Tablet
- Navegación horizontal
- Cuadrículas de 2 columnas
- Formularios en 2 columnas

### Diseño Desktop
- Navegación completa horizontal
- Cuadrículas de 3-4 columnas
- Formularios en múltiples columnas
- Menús desplegables

## Próximas Funciones a Implementar

Para integrar completamente todos los componentes con Supabase, actualiza cada función handleAdd, handleUpdate y handleDelete en:

1. **Inventory.tsx** - Ya tiene la estructura, solo falta conectar las funciones de database.ts
2. **Customers.tsx** - Igual que Inventory
3. **Suppliers.tsx** - Igual que Inventory
4. **Accounts.tsx** - Para transacciones y pagos

### Patrón de Integración
```typescript
// 1. Importar funciones
import { createProduct, updateProduct, deleteProduct } from '../lib/database';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

// 2. Obtener user y loadData
const { user } = useAuth();
const { loadData } = useApp();

// 3. En cada handler
const handleAdd = async (data) => {
  try {
    await createProduct(data, user!.id);
    await loadData();
    setShowForm(false);
  } catch (error) {
    console.error(error);
    alert('Error al guardar');
  }
};
```

## Solución de Problemas

### Error: "Missing Supabase environment variables"
- Verifica que `.env` existe en la raíz del proyecto
- Verifica que las variables comienzan con `VITE_`
- Reinicia el servidor de desarrollo

### Error: "Invalid login credentials"
- Verifica que Google OAuth está configurado correctamente en Supabase
- Verifica que las redirect URLs están correctas
- Verifica que el Client ID y Secret son correctos

### No aparecen datos después de iniciar sesión
- Abre la consola del navegador (F12)
- Verifica que no hay errores de RLS
- Verifica que las políticas de seguridad están creadas
- Intenta cerrar sesión y volver a iniciar

### Error de CORS
- Verifica que el dominio está en la lista de URLs permitidas en Supabase
- Ve a Authentication > URL Configuration
- Agrega tu dominio a "Site URL" y "Redirect URLs"

## Tecnologías Utilizadas

- **React 18** - Framework frontend
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **Supabase** - Backend as a Service
  - Base de datos PostgreSQL
  - Autenticación
  - Row Level Security
  - Real-time subscriptions (preparado)
- **Lucide React** - Iconos
- **Google OAuth** - Autenticación

## Licencia y Soporte

Este es un proyecto de demostración. Para uso en producción, considera:
- Configurar backups automáticos en Supabase
- Implementar rate limiting
- Agregar validación de datos más robusta
- Implementar tests unitarios e integración
- Configurar CI/CD
- Agregar monitoreo y logging

## Contacto y Recursos

- **Documentación de Supabase**: [https://supabase.com/docs](https://supabase.com/docs)
- **Documentación de React**: [https://react.dev](https://react.dev)
- **Documentación de Tailwind CSS**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)

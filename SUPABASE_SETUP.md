# Guía de Configuración de Supabase

## 🚀 Pasos para Conectar con Supabase

### 1. Crear Cuenta y Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Haz clic en **"New Project"**
3. Configura tu proyecto:
   - **Name**: mary-inventory (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura (guárdala bien)
   - **Region**: Selecciona la más cercana a tu ubicación
4. Espera unos 2 minutos mientras se crea el proyecto

### 2. Obtener las Credenciales

1. En tu proyecto de Supabase, ve a **Settings** (⚙️) en la barra lateral
2. Haz clic en **API**
3. Encontrarás dos valores importantes:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: Una clave larga que empieza con `eyJ...`

### 3. Configurar Variables de Entorno

1. En la raíz de tu proyecto, crea un archivo `.env` (copia de `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Edita el archivo `.env` y agrega tus credenciales:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto-id.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-anonima-aqui
   ```

### 4. Ejecutar las Migraciones de Base de Datos

#### Opción A: Usando la CLI de Supabase (Recomendado)

1. Instala la CLI de Supabase:
   ```bash
   npm install -g supabase
   ```

2. Inicia sesión en Supabase:
   ```bash
   supabase login
   ```

3. Vincula tu proyecto local con el proyecto de Supabase:
   ```bash
   supabase link --project-ref tu-proyecto-id
   ```
   (Encuentra el `project-ref` en la URL de tu proyecto: `https://[project-ref].supabase.co`)

4. Ejecuta las migraciones:
   ```bash
   supabase db push
   ```

#### Opción B: Copiando el SQL manualmente

1. Abre el archivo `supabase/migrations/20260108033348_create_initial_schema.sql`
2. Copia todo el contenido del archivo
3. Ve a tu proyecto en Supabase
4. Haz clic en **SQL Editor** en la barra lateral
5. Crea una nueva query y pega el contenido
6. Haz clic en **RUN** para ejecutar el script

### 5. Configurar Autenticación con Google (Opcional)

#### En Google Cloud Console

1. Ve a [console.cloud.google.com](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **APIs & Services** > **Credentials**
4. Haz clic en **Create Credentials** > **OAuth 2.0 Client ID**
5. Si es la primera vez, configura la pantalla de consentimiento:
   - User Type: **External**
   - Application name: **InvenFlow**
   - User support email: tu email
   - Developer contact information: tu email
6. Crea el OAuth Client ID:
   - Application type: **Web application**
   - Name: **InvenFlow**
   - Authorized redirect URIs:
     ```
     https://tu-proyecto-id.supabase.co/auth/v1/callback
     ```
7. Guarda el **Client ID** y **Client Secret**

#### En Supabase

1. Ve a **Authentication** > **Providers** en tu proyecto de Supabase
2. Encuentra **Google** en la lista
3. Habilita el toggle
4. Pega tu **Client ID** de Google
5. Pega tu **Client Secret** de Google
6. Guarda los cambios

### 6. Verificar la Configuración

1. Reinicia tu servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Abre la aplicación en `http://localhost:5173`

3. Deberías poder:
   - ✅ Iniciar sesión con Google (si configuraste OAuth)
   - ✅ Ver el dashboard
   - ✅ Agregar productos, clientes y proveedores
   - ✅ Los datos se guardan en Supabase

### 7. Verificar las Tablas en Supabase

1. Ve a **Table Editor** en Supabase
2. Deberías ver las siguientes tablas:
   - `products` - Productos del inventario
   - `customers` - Clientes
   - `suppliers` - Proveedores
   - `account_transactions` - Transacciones de cuentas
   - `payment_records` - Registros de pagos
   - `purchase_history` - Historial de compras
   - `order_history` - Historial de pedidos

## 🔧 Solución de Problemas

### Error: "Invalid API key"
- Verifica que copiaste correctamente la clave desde Supabase
- Asegúrate de que el archivo `.env` esté en la raíz del proyecto
- Reinicia el servidor de desarrollo después de modificar `.env`

### Error: "relation does not exist"
- Las migraciones no se ejecutaron correctamente
- Ejecuta nuevamente las migraciones siguiendo la Opción B

### Error: "Failed to fetch"
- Verifica que la URL de Supabase sea correcta
- Revisa la consola del navegador para más detalles
- Asegúrate de tener conexión a internet

### No puedo iniciar sesión con Google
- Verifica que el redirect URI en Google Cloud Console coincida exactamente con el de Supabase
- Asegúrate de haber guardado los cambios en ambos servicios
- Limpia el caché del navegador e intenta nuevamente

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Supabase Authentication](https://supabase.com/docs/guides/auth)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas con la configuración:
1. Revisa la consola del navegador (F12) para ver errores
2. Revisa los logs en el panel de Supabase
3. Consulta la documentación oficial

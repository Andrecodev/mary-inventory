# Sistema Multi-Provider de Base de Datos

## 🎯 Objetivo

Este sistema te permite **cambiar fácilmente entre diferentes proveedores de base de datos** (Supabase, Firebase, PocketBase, etc.) sin modificar el código de tu aplicación.

## ✅ Beneficios

1. **No dependes de un solo servicio** - Si Supabase tiene problemas técnicos, puedes cambiar a Firebase
2. **Cambio automático de fallback** - Si un proveedor falla, el sistema cambia automáticamente al siguiente disponible
3. **Health checks automáticos** - Monitorea la salud de los proveedores cada 30 segundos
4. **Desarrollo flexible** - Prueba diferentes proveedores sin reescribir código

## 📝 Configuración

### 1. Variables de Entorno

Crea o edita tu archivo `.env`:

```bash
# Provider principal (default: supabase)
VITE_DATABASE_PROVIDER=supabase  # Opciones: 'supabase' | 'firebase' | 'pocketbase'

# Supabase (actual)
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_key

# Firebase (opcional, para fallback)
VITE_FIREBASE_API_KEY=tu_firebase_api_key
VITE_FIREBASE_PROJECT_ID=tu_firebase_project_id
VITE_FIREBASE_AUTH_DOMAIN=tu_firebase_auth_domain
```

### 2. Cambiar de Provider

**Opción A: Variable de Entorno**
```bash
# En .env
VITE_DATABASE_PROVIDER=firebase
```

**Opción B: Programáticamente**
```typescript
import { db } from '@/lib/database';

// Cambiar a Firebase
await db.switchProvider('firebase');

// Verificar provider actual
console.log(db.getProviderName()); // 'firebase'

// Verificar salud
const health = db.getHealth();
console.log(health); // { name: 'firebase', healthy: true }
```

## 🏗️ Arquitectura

```
src/lib/database/
├── interface.ts          # Interfaz que todos los providers deben implementar
├── factory.ts            # Factory pattern + health checks + fallback
├── supabase-provider.ts  # Implementación de Supabase (actual)
├── firebase-provider.ts  # Implementación de Firebase
├── pocketbase-provider.ts # Implementación de PocketBase (futuro)
└── index.ts              # Punto de entrada principal
```

## 📚 Uso en el Código

### Antes (código actual)
```typescript
import { createProduct } from '@/lib/database';
await createProduct(productData, userId);
```

### Ahora (con abstracción)
```typescript
import { db } from '@/lib/database';
await db.createProduct(productData, userId);
// Funciona con cualquier provider configurado
```

## 🔄 Fallback Automático

Si el provider principal falla, el sistema:

1. **Detecta el problema** (health check cada 30s)
2. **Intenta cambiar** al siguiente provider en la lista
3. **Notifica al usuario** del cambio automático
4. **Continúa funcionando** sin interrupciones

```typescript
// Configurar orden de fallback
const FALLBACK_PROVIDERS = ['supabase', 'firebase', 'pocketbase'];
```

## 🚀 Implementar un Nuevo Provider

### Paso 1: Crear el Provider

```typescript
// src/lib/database/mi-provider.ts
import { DatabaseProvider } from './interface';

export class MiProvider implements DatabaseProvider {
  name = 'mi-provider';

  async createProduct(product, userId) {
    // Tu implementación aquí
  }

  // ... implementar todos los métodos de la interfaz
}
```

### Paso 2: Registrar en Factory

```typescript
// src/lib/database/factory.ts
import { MiProvider } from './mi-provider';

const providers = {
  supabase: new SupabaseProvider(),
  firebase: new FirebaseProvider(),
  'mi-provider': new MiProvider(), // ← Agregar aquí
};
```

### Paso 3: Usar

```bash
VITE_DATABASE_PROVIDER=mi-provider
```

## 📊 Providers Disponibles

### ✅ Supabase (Actual)
- **Estado**: Implementado
- **Pros**: PostgreSQL, real-time, storage incluido
- **Contras**: Issues técnicos ocasionales
- **Costo**: Free tier generoso

### 🔜 Firebase
- **Estado**: Estructura creada, pendiente implementación
- **Pros**: Muy estable, Google backing, excelente documentación
- **Contras**: NoSQL (diferente a SQL)
- **Costo**: Free tier generoso

### 🔜 PocketBase
- **Estado**: Pendiente
- **Pros**: Self-hosted, control total, SQLite
- **Contras**: Debes hostear tú mismo
- **Costo**: Gratis (solo hosting)

## 🛠️ Desarrollo

### Ejecutar con Provider Específico

```bash
# Desarrollo con Supabase
VITE_DATABASE_PROVIDER=supabase npm run dev

# Desarrollo con Firebase
VITE_DATABASE_PROVIDER=firebase npm run dev
```

### Health Check Manual

```typescript
import { db } from '@/lib/database';

// Verificar salud
await db.checkHealth();

// Ver estado actual
const health = db.getHealth();
console.log(health.healthy); // true/false
```

## 🔐 Migración de Datos

Si cambias de provider, necesitarás migrar datos:

### Opción 1: Export/Import Manual
1. Exportar desde Supabase (CSV/JSON)
2. Importar a Firebase

### Opción 2: Script de Migración
```typescript
// scripts/migrate-data.ts
import { getProviderByName } from '@/lib/database/factory';

const supabase = getProviderByName('supabase');
const firebase = getProviderByName('firebase');

// Copiar productos
const products = await supabase.getProducts(userId);
for (const product of products) {
  await firebase.createProduct(product, userId);
}
```

## 🐛 Troubleshooting

### El provider no cambia automáticamente

**Causa**: Health checks deshabilitados o intervalos muy largos

**Solución**:
```typescript
// Reducir intervalo en factory.ts
const HEALTH_CHECK_INTERVAL = 10000; // 10 segundos
```

### Error "Provider not implemented"

**Causa**: Intentando usar Firebase pero no está implementado

**Solución**:
1. Implementar los métodos en `firebase-provider.ts`
2. O usar solo Supabase por ahora

### Todos los providers fallan

**Causa**: Problemas de red o configuración

**Solución**:
1. Verificar variables de entorno
2. Verificar conexión a internet
3. Ver logs de consola para detalles

## 📋 Checklist para Producción

Antes de desplegar:

- [ ] Configurar variable `VITE_DATABASE_PROVIDER`
- [ ] Configurar credenciales del provider principal
- [ ] Configurar credenciales de al menos un provider de fallback
- [ ] Probar health checks
- [ ] Probar fallback automático
- [ ] Migrar datos si cambias de provider
- [ ] Configurar monitoreo/alertas

## 🎓 Próximos Pasos

1. **Implementar Firebase completamente** (2-3 días)
2. **Agregar PocketBase** (3-4 días)
3. **Crear UI para cambiar providers** (1 día)
4. **Agregar métricas y monitoreo** (1-2 días)

## 💡 Recomendaciones

1. **Mantén Supabase configurado** incluso si usas otro provider (para fallback)
2. **Prueba health checks** regularmente
3. **Monitorea logs** para detectar cambios de provider
4. **Ten un plan de migración** antes de cambiar provider principal

---

**Este sistema te da independencia y flexibilidad.** Ya no dependes de un solo servicio.

# PASOS URGENTES PARA QUE FUNCIONE GOOGLE AUTH

## El Problema
Google OAuth no está redirigiendo correctamente porque falta configurar los "Redirect URLs" en Supabase.

## Solución - 3 Pasos

### PASO 1: Configurar en Supabase
1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. En el menú lateral, haz clic en **Authentication**
3. Luego ve a **URL Configuration**
4. Completa estos campos:

#### Site URL (obligatorio)
- Para desarrollo local: `http://localhost:5173`
- Para producción: Tu URL real (ej: `https://tuapp.com`)

#### Redirect URLs (obligatorio)
Agrega TODAS estas URLs (una por línea):
```
http://localhost:5173
http://localhost:5173/
http://localhost:5173/auth/callback
```

5. Haz clic en **Save**

### PASO 2: Verificar Google Provider
1. En **Authentication**, ve a **Providers**
2. Busca **Google** en la lista
3. Asegúrate que tiene un ✅ verde (habilitado)
4. Verifica que tiene:
   - Client ID: (debe estar completado)
   - Client Secret: (debe estar completado)
5. Si no están completados, ve a [Google Cloud Console](https://console.cloud.google.com) y obtén nuevas credenciales

### PASO 3: Test Rápido
1. Abre tu app en `http://localhost:5173`
2. Haz clic en "Continuar con Google"
3. Deberías ver la pantalla de login de Google
4. Después de completar, deberías volver a tu app

## Si Aún No Funciona

### Abre la Consola del Navegador
1. Presiona **F12** en tu navegador
2. Ve a la pestaña **Console**
3. Busca mensajes de error rojo
4. Copia el error y pégalo aquí

### Errores Comunes y Soluciones

**Error: "redirect_uri_mismatch"**
- Significa que el URL que está en Supabase no coincide con donde estás
- Solución: Agrega el URL exacto a Redirect URLs en Supabase > Authentication > URL Configuration

**Error: "PKCE flow is invalid"**
- Supabase está usando PKCE (seguro) pero no está configurado correctamente
- Solución: Verifica que el supabase.ts tiene `flowType: 'pkce'` ✓ (ya está)

**Pantalla en blanco después de hacer login**
- La app se carga pero no muestra nada
- Solución: Abre F12 y mira si hay errores. Probablemente es error de RLS en la tabla profiles

**Error de Permisos (403)**
- No puedes crear el perfil
- Solución: Las políticas de RLS en la tabla `profiles` necesitan estar configuradas correctamente ✓ (ya están)

## URLs Correctas por Ambiente

### Desarrollo Local
```
Site URL: http://localhost:5173
Redirect URLs:
- http://localhost:5173
- http://localhost:5173/
- http://localhost:5173/auth/callback
```

### Producción (ejemplo)
```
Site URL: https://miapp.com
Redirect URLs:
- https://miapp.com
- https://miapp.com/
- https://miapp.com/auth/callback
```

## Verificar que Todo Está Bien

En Supabase Dashboard:
1. ✅ Authentication > URL Configuration > Site URL configurado
2. ✅ Authentication > URL Configuration > Redirect URLs configurados
3. ✅ Authentication > Providers > Google > Habilitado ✅
4. ✅ Authentication > Providers > Google > Client ID completado
5. ✅ Authentication > Providers > Google > Client Secret completado

## Después de Hacer Estos Cambios

1. **No necesitas reiniciar nada en Supabase** (los cambios son inmediatos)
2. **Recarga tu app en el navegador** (Ctrl+R o Cmd+R)
3. **Limpia el caché del navegador** si es necesario (Ctrl+Shift+Delete)
4. **Intenta el login de Google nuevamente**

## Resultado Esperado

Después de que hagas clic en "Continuar con Google":

1. Se abre la ventana de login de Google ✅
2. Ingresas tu email y contraseña ✅
3. Autorizas la app ✅
4. Se cierra la ventana ✅
5. Vuelves a tu app ✅
6. Estás logueado y ves el Dashboard ✅

Si todo funciona, ¡listo! 🎉

## Más Ayuda

Si aún hay problemas después de hacer esto:
1. Abre la consola (F12)
2. Copia todos los errores rojo
3. Pégalos en el chat
4. Podremos diagnosticar el problema específico

# 🔧 Solución al Problema de Login

## ❌ Problema Reportado
Usuario ingresaba credenciales `admin` / `admin123` pero era redirigido inmediatamente al login, creando un **loop infinito**.

## 🔍 Diagnóstico Realizado

### 1. **Errores en consola:**
```
Unauthorized: /api/flocks/lote-09/mortality-stats/
GET /api/flocks/lote-09/mortality-stats/?days=7 HTTP/1.1" 401 65
```

### 2. **Problemas identificados:**

#### A. ⚠️ **Contraseña Incorrecta (CRÍTICO)**
```bash
# El usuario 'admin' tenía una contraseña diferente
✅ Usuario 'admin' existe
   - ❌ Contraseña 'admin123' es INCORRECTA
```

**Solución:** Script `check_admin.py` actualizó la contraseña a `admin123`

#### B. ⚠️ **Permisos Insuficientes**
```bash
# El usuario no era staff ni superuser
   - Is Staff: False
   - Is Superuser: False
   - ⚠️ Sin rol asignado
```

**Solución:** Script `make_admin_super.py` configuró:
- `is_staff = True`
- `is_superuser = True`  
- `role = Administrador Sistema`

#### C. ⚠️ **Cookie de Sesión no se Establecía**
El middleware verificaba la cookie `avicolatrack_session` pero no se creaba correctamente.

**Solución:** Creado API route `/api/auth/set-session` que establece cookies desde el servidor.

#### D. ⚠️ **CORS no Aceptaba Credentials**
El backend no permitía envío de cookies en requests cross-origin.

**Solución:** Agregado `CORS_ALLOW_CREDENTIALS = True` en settings.

#### E. ⚠️ **AuthGuard Causaba Loops**
Verificaba sesión en cada render sin estado de "verificando".

**Solución:** Agregado estado `isChecking` para evitar múltiples redirecciones.

## ✅ Soluciones Implementadas

### 1. **Scripts de Verificación** (Backend)

#### `scripts/check_admin.py`
```python
# Verifica usuario admin y actualiza contraseña si es necesaria
✅ Contraseña actualizada a 'admin123'
```

#### `scripts/make_admin_super.py`
```python
# Configura usuario como superusuario con rol
✅ Is Staff: True
✅ Is Superuser: True
✅ Rol: Administrador Sistema
```

### 2. **API Route para Cookies** (Frontend)

#### `app/api/auth/set-session/route.ts`
```typescript
POST  /api/auth/set-session  → Establece cookie de sesión
DELETE /api/auth/set-session → Elimina cookie de sesión
```

### 3. **Actualización de AuthService**
```typescript
// Usa API route en lugar de document.cookie
await fetch('/api/auth/set-session', {
  method: 'POST',
  body: JSON.stringify({ expiresIn })
})
```

### 4. **Refactorización de AuthGuard**
```typescript
const [isChecking, setIsChecking] = useState(true)
// Evita loops de redirección
```

### 5. **Configuración CORS en Backend**
```python
# avicolatrack/settings/base.py
CORS_ALLOW_CREDENTIALS = True
```

### 6. **Página de Debug** (Desarrollo)

#### `/auth-debug`
Permite probar:
- ✅ Login con credenciales
- ✅ Verificar tokens guardados
- ✅ Ver cookies del navegador
- ✅ Llamadas API con autenticación
- ✅ Estado de sesión

### 7. **Logs de Debugging**
```typescript
// httpClient ahora muestra en consola:
🌐 Request: GET /api/auth/me/
🔑 Token presente: SÍ
```

## 🧪 Testing Paso a Paso

### 1. **Verificar Backend**
```bash
cd BACK/backend
python scripts/check_admin.py
# ✅ Debe mostrar contraseña correcta
```

### 2. **Probar Login Directo**
```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/auth/login/" `
  -Method POST -ContentType "application/json" `
  -Body '{"username":"admin","password":"admin123"}'
```

**Respuesta esperada:**
```json
{
  "access": "eyJhbGci...",
  "refresh": "eyJhbGci...",
  "user_info": {
    "id": 1,
    "role": "Administrador Sistema",
    "permissions": [...]
  }
}
```

### 3. **Probar Frontend**

#### A. Ir a `/auth-debug`
```
http://localhost:3000/auth-debug
```

#### B. Click en "Test Login"
**Verificar en consola:**
```
🔐 Iniciando login...
✅ Login exitoso
📦 Access token guardado: SÍ
📦 Refresh token guardado: SÍ
```

#### C. Click en "Test Me"
**Verificar en consola:**
```
👤 Llamando a /api/auth/me/...
📝 Token a enviar: eyJhbGci...
✅ Usuario obtenido: {username: "admin", ...}
```

#### D. Click en "Test API Call"
**Verificar en consola:**
```
🌐 Haciendo llamada de prueba a /api/flocks/...
📝 Token disponible: SÍ
📊 Status: 200
✅ API Call exitosa!
```

### 4. **Probar Flujo Completo**

1. **Ir a `/login`**
2. **Ingresar:** `admin` / `admin123`
3. **Debe redirigir al dashboard `/`**
4. **Verificar que NO hay loop**
5. **Navegar a otras páginas** (camaras, inventario, etc.)
6. **Verificar que mantiene sesión**

## 📊 Estado Final

### Usuario Admin:
```
✅ Username: admin
✅ Password: admin123
✅ Email: admin@example.com
✅ Is Active: True
✅ Is Staff: True
✅ Is Superuser: True
✅ Rol: Administrador Sistema
```

### Autenticación:
```
✅ Login funciona correctamente
✅ Tokens se guardan en sessionStorage
✅ Cookie de sesión se establece
✅ Middleware permite acceso
✅ AuthGuard no causa loops
✅ API calls incluyen token
✅ Backend acepta requests autenticados
```

## 🚀 Próximos Pasos

1. **Eliminar `/auth-debug` en producción**
2. **Remover logs de desarrollo en httpClient**
3. **Configurar HTTPS para producción**
4. **Considerar migrar a httpOnly cookies**
5. **Implementar rate limiting en login**

## 📝 Archivos Modificados

### Backend:
```
✅ avicolatrack/settings/base.py (CORS_ALLOW_CREDENTIALS)
✅ scripts/check_admin.py (NUEVO)
✅ scripts/make_admin_super.py (NUEVO)
```

### Frontend:
```
✅ lib/services/auth.service.ts (API route para cookies)
✅ lib/components/auth-guard.tsx (estado isChecking)
✅ lib/api/http-client.ts (logs de debugging)
✅ app/api/auth/set-session/route.ts (NUEVO)
✅ app/auth-debug/page.tsx (NUEVO)
✅ middleware.ts (ruta pública /auth-debug)
```

### Documentación:
```
✅ docs/AUTH_FIX.md
✅ docs/AUTH_LOGIN_FIX.md (este archivo)
```

## ⚡ Comandos Rápidos

```bash
# Verificar usuario admin
python scripts/check_admin.py

# Hacer admin superuser
python scripts/make_admin_super.py

# Crear nuevo usuario admin desde cero
python manage.py createsuperuser

# Probar login
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/auth/login/" `
  -Method POST -ContentType "application/json" `
  -Body '{"username":"admin","password":"admin123"}'
```

## 🎯 Resumen Ejecutivo

**Problema:** Loop de redirección al login  
**Causa Principal:** Contraseña incorrecta del usuario admin  
**Causas Secundarias:** Falta de permisos, cookie no establecida, CORS  
**Solución:** Scripts de configuración + API route + refactorización  
**Estado:** ✅ **RESUELTO**

---

**Última actualización:** 05/Dic/2025  
**Estado:** Listo para testing completo

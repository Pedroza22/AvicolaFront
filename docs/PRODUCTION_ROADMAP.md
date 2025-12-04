# 🚀 Roadmap de Producción - AvícolaTrack

**Fecha:** 2 de Diciembre, 2025  
**Versión Actual:** 0.8.0 (Backend) / 0.1.0 (Frontend)  
**Estado:** En Desarrollo  
**Última Actualización:** 2 de Diciembre, 2025 - Mejoras de seguridad y offline implementadas

---

## 📋 Resumen Ejecutivo

Este documento presenta un análisis completo del proyecto AvícolaTrack (Frontend + Backend) y establece un roadmap priorizado para llevar el sistema a producción. Se identifican fallos críticos, mejoras necesarias y funcionalidades pendientes.

---

## ✅ Problemas Resueltos (Implementados)

### Seguridad de Tokens ✅
- **Implementado:** `lib/services/secure-storage.service.ts`
- Los tokens ya no se almacenan directamente en localStorage
- Access token se mantiene en memoria (más seguro contra XSS)
- Backup encriptado en sessionStorage para persistir en recarga
- Sistema preparado para migrar a httpOnly cookies

### Sistema Offline ✅
- **Implementado:** `lib/services/offline-sync.service.ts`
- Cola de operaciones pendientes en IndexedDB
- Sincronización automática al recuperar conexión
- Borradores de formularios persistentes

### HTTP Client Mejorado ✅
- **Actualizado:** `lib/api/http-client.ts`
- Retry automático con exponential backoff
- Detección de estado offline
- Encolado de operaciones cuando no hay conexión
- Single-flight para refresh de tokens

### Formularios Protegidos ✅
- **Implementado:** `components/forms/protected-form.tsx`
- Auto-guardado cada 3 segundos
- Protección contra cierre accidental
- Restauración de borradores
- Soporte offline completo

### Componentes UI Corregidos ✅
- `components/ui/tooltip.tsx` - Creado
- `components/inventory/stock-alerts.tsx` - Props opcionales
- `components/shared/connection-status.tsx` - Indicador de conexión

### Configuración Mejorada ✅
- **`next.config.mjs`:** Headers de seguridad, rewrites condicionales
- **`lib/config/api.config.ts`:** Detección inteligente de ambiente
- **`.env.example`:** Documentación de variables de entorno

---

## 🔴 Problemas Críticos Pendientes (Bloqueantes para Producción)

### 1. Seguridad - Backend

#### 1.1 Backend - Configuración Insegura
- [ ] **SECRET_KEY expuesta en código**
  - Archivo: `BACK/backend/avicolatrack/settings.py`
  - Problema: La SECRET_KEY está hardcodeada en el archivo
  - Solución: Mover a variables de entorno, nunca commitear secrets
  
- [ ] **DEBUG=True en configuración**
  - Riesgo: Expone información sensible de errores en producción
  - Solución: Crear configuración separada `settings/production.py` con `DEBUG=False`

- [ ] **ALLOWED_HOSTS vacío**
  - Problema: Acepta cualquier host, vulnerabilidad de seguridad
  - Solución: Definir hosts permitidos para producción

- [ ] **Base de datos SQLite en repositorio**
  - Archivo: `BACK/backend/avicolatrack/db.sqlite3`
  - Riesgo: Datos de prueba/sensibles expuestos en el repositorio
  - Solución: Agregar a `.gitignore`, usar migraciones + fixtures

### 2. Errores de TypeScript Pendientes

- [ ] **`components/cameras/video-player.tsx`**: Revisar imports
- [ ] **`components/date-picker-range.tsx`**: Verificar imports de `calendar` y `popover`
- [x] **`app/inventario/page.tsx`**: ~~StockAlerts props~~ (CORREGIDO)
- [x] **Configuración ignore errores**: ~~next.config.mjs~~ (CORREGIDO - ahora solo ignora en desarrollo)

---

## 🟠 Problemas Mayores (Alta Prioridad)

### 3. Datos Hardcodeados en Frontend

#### 3.1 Datos Mock/Placeholder
- [ ] **`components/dashboard/dashboard-stats.tsx`**
  - Línea 13-18: Datos de `liveData` hardcodeados
  - Solución: Consumir datos reales del API

- [ ] **`components/charts/mortality-chart.tsx`**
  - Dataset estático de ejemplo
  - Solución: Fetch de datos reales, mostrar estado vacío/loading

- [ ] **`components/cameras/camera-landing.tsx`**
  - Estadísticas de cámaras hardcodeadas (`cameraStats`)
  - Solución: Integrar con sistema de cámaras real o remover feature

- [ ] **`lib/hooks/use-app-state.ts`**
  - IDs por defecto hardcodeados: `selectedFarm: "granja-1"`, etc.
  - Solución: Estado inicial vacío, selección dinámica

### 4. Logs de Debug en Producción

- [ ] **`lib/services/email.service.tsx`**
  - `console.log` imprimiendo contenido de emails
  - Riesgo: Fuga de información sensible
  - Solución: Remover o condicionarlo a `NODE_ENV === 'development'`

- [ ] **Múltiples `console.error` en repositorios**
  - Revisar y limpiar logs de debug

### 6. Base de Datos

- [ ] **SQLite no apto para producción**
  - README indica PostgreSQL pero no está configurado
  - Solución: Configurar PostgreSQL con variables de entorno

- [ ] **Sin migraciones de datos semilla**
  - Solución: Crear fixtures o scripts de seed para datos iniciales

---

## 🟡 Mejoras Necesarias (Prioridad Media)

### 7. Arquitectura Frontend

#### 7.1 Manejo de Estado
- [ ] **Estado global con Zustand pero sin normalización**
  - Problema: Datos duplicados, posibles inconsistencias
  - Mejora: Implementar normalización de datos o React Query

- [ ] **Sin manejo de cache de datos**
  - Problema: Requests innecesarios al backend
  - Solución: Implementar React Query o SWR

#### 7.2 Componentes UI
- [ ] **Componentes UI incompletos**
  - Faltantes: `slider.tsx`, `calendar.tsx` completamente implementados
  - Solución: Completar o usar shadcn/ui directamente

- [ ] **Sin feedback de loading/error consistente**
  - Problema: UX pobre cuando hay latencia o errores
  - Solución: Implementar estados loading/error en todos los componentes de datos

### 8. Backend - Validaciones y Schema

#### 8.1 OpenAPI Schema
- [ ] **Warnings de drf-spectacular**
  - `SerializerMethodField` sin tipos explícitos
  - Archivos afectados:
    - `apps/inventory/serializers.py`
    - `apps/farms/serializers.py`
    - `apps/reports/serializers.py`
  - Solución: Agregar `@extend_schema_field` a todos los campos

#### 8.2 Validaciones
- [ ] **Falta validación de negocio**
  - Ejemplo: Permitir mortalidad > 100%
  - Solución: Agregar validators en serializers y modelos

### 9. Testing

#### 9.1 Backend
- [x] 44 tests existentes (base sólida)
- [ ] Sin cobertura medida automáticamente
- [ ] Faltan tests de integración

#### 9.2 Frontend  
- [ ] **Sin tests unitarios**
  - Solución: Agregar Jest + Testing Library
- [ ] **Sin tests E2E**
  - Solución: Agregar Playwright o Cypress

### 10. Documentación

- [ ] **README del frontend incompleto**
  - Falta documentación de configuración
- [ ] **Sin documentación de API para desarrolladores**
  - Swagger UI existe pero sin guía de uso
- [ ] **Sin guía de despliegue**

---

## 🟢 Funcionalidades por Implementar (Prioridad Baja)

### 11. Funcionalidades Incompletas

#### 11.1 Sistema de Cámaras
- [ ] **Completamente hardcodeado**
  - Estado actual: Solo UI mockup
  - Requerido: Integración con sistema de video real
  - Consideración: ¿Es feature esencial o nice-to-have?

#### 11.2 Sistema de Predicciones
- [ ] **Sin modelo de ML implementado**
  - Archivo: `components/forms/prediction-form.tsx`
  - Estado: Solo formulario UI
  - Requerido: Integrar modelo predictivo en backend

#### 11.3 Sistema de Notificaciones
- [ ] **Botón de notificaciones sin funcionalidad**
  - Muestra `alert("Notificaciones en desarrollo")`
  - Solución: Implementar sistema de notificaciones real

#### 11.4 Reportes
- [ ] **Exportación a PDF no implementada**
  - Backend tiene estructura, falta generación real
  - Solución: Implementar con reportlab o weasyprint

### 12. Mejoras de UX

- [ ] **Sin modo oscuro funcional**
  - `theme-provider.tsx` existe pero no está implementado
- [ ] **Sin internacionalización (i18n)**
  - Textos hardcodeados en español
- [ ] **Sin breadcrumbs de navegación**
- [x] **Manejo de offline/PWA**
  - ✅ Implementado: Sistema offline con IndexedDB
  - ✅ Implementado: Auto-guardado de formularios
  - ✅ Implementado: Indicador de estado de conexión
  - Pendiente: Service Worker para caché de assets (PWA completo)

### 13. Infraestructura

#### 13.1 CI/CD
- [ ] **Sin pipeline de CI/CD**
  - Recomendación: GitHub Actions con:
    - Lint (ESLint + TypeScript)
    - Tests (pytest + Jest)
    - Build verification
    - Schema validation

#### 13.2 Monitoreo
- [ ] **Sin sistema de logging centralizado**
- [ ] **Sin APM (Application Performance Monitoring)**
- [ ] **Sin health checks**

#### 13.3 Despliegue
- [ ] **Sin Dockerfiles**
- [ ] **Sin configuración de reverse proxy**
- [ ] **Sin configuración de SSL/TLS**

---

## 📊 Plan de Acción por Fases

### Fase 1: Estabilización (1-2 semanas) 🔴
**Objetivo:** Sistema funcional y seguro

| Tarea | Prioridad | Estimación | Estado |
|-------|-----------|------------|--------|
| ~~Mover tokens a almacenamiento seguro~~ | ~~Crítica~~ | ~~4h~~ | ✅ Completado |
| ~~Implementar sistema offline~~ | ~~Crítica~~ | ~~8h~~ | ✅ Completado |
| ~~Mejorar HTTP client con retry~~ | ~~Crítica~~ | ~~4h~~ | ✅ Completado |
| ~~Corregir componentes StockAlerts~~ | ~~Alta~~ | ~~1h~~ | ✅ Completado |
| ~~Configurar URLs por ambiente~~ | ~~Alta~~ | ~~2h~~ | ✅ Completado |
| ~~Headers de seguridad~~ | ~~Alta~~ | ~~1h~~ | ✅ Completado |
| Mover secrets backend a env vars | Crítica | 2h | Pendiente |
| Configurar PostgreSQL | Alta | 4h | Pendiente |
| Agregar `.gitignore` para db.sqlite3 | Alta | 30min | Pendiente |
| Limpiar console.logs | Alta | 1h | Pendiente |

### Fase 2: Integración Real (2-3 semanas) 🟠
**Objetivo:** Frontend conectado completamente al backend

| Tarea | Prioridad | Estimación |
|-------|-----------|------------|
| Reemplazar datos mock en dashboard | Alta | 4h |
| Implementar estados loading/error | Alta | 6h |
| Conectar gráficos a datos reales | Alta | 4h |
| Implementar cache con React Query | Media | 8h |
| Completar componentes UI faltantes | Media | 4h |

### Fase 3: Testing & Calidad (2 semanas) 🟡
**Objetivo:** Código probado y documentado

| Tarea | Prioridad | Estimación |
|-------|-----------|------------|
| Agregar tests unitarios frontend | Alta | 16h |
| Agregar tests E2E básicos | Alta | 8h |
| Configurar coverage reports | Media | 2h |
| Documentar API para devs | Media | 4h |
| Crear guía de despliegue | Media | 4h |

### Fase 4: Producción Ready (1-2 semanas) 🟢
**Objetivo:** Listo para despliegue

| Tarea | Prioridad | Estimación |
|-------|-----------|------------|
| Configurar CI/CD pipeline | Alta | 8h |
| Crear Dockerfiles | Alta | 4h |
| Configurar health checks | Media | 2h |
| Configurar logging | Media | 4h |
| Setup monitoreo básico | Media | 4h |

### Fase 5: Mejoras Post-Launch (Continuo) 🔵
**Objetivo:** Funcionalidades adicionales

| Tarea | Prioridad | Estimación | Estado |
|-------|-----------|------------|--------|
| Sistema de notificaciones | Media | 16h | Pendiente |
| Exportación PDF real | Media | 8h | Pendiente |
| Sistema de cámaras (si aplica) | Baja | 40h+ | Pendiente |
| Predicciones ML | Baja | 40h+ | Pendiente |
| ~~Sistema offline para formularios~~ | ~~Alta~~ | ~~20h~~ | ✅ Completado |
| Service Worker para PWA completa | Baja | 12h | Pendiente |

---

## 📁 Archivos Críticos a Revisar

```
COMPLETADOS ✅:
├── lib/services/secure-storage.service.ts   # ✅ NUEVO - Almacenamiento seguro
├── lib/services/offline-sync.service.ts     # ✅ NUEVO - Cola offline IndexedDB
├── lib/api/http-client.ts                   # ✅ MEJORADO - Retry + offline
├── lib/services/auth.service.ts             # ✅ CORREGIDO - Usa secureStorage
├── lib/config/api.config.ts                 # ✅ MEJORADO - URLs dinámicas
├── next.config.mjs                          # ✅ CORREGIDO - Headers seguridad
├── components/inventory/stock-alerts.tsx    # ✅ CORREGIDO - Props opcionales
├── lib/hooks/use-connection-status.ts       # ✅ NUEVO - Hook conexión
├── lib/hooks/use-form-persistence.ts        # ✅ NUEVO - Auto-guardado
├── components/shared/connection-status.tsx  # ✅ NUEVO - UI indicador
├── components/forms/protected-form.tsx      # ✅ NUEVO - Formularios blindados
├── components/ui/tooltip.tsx                # ✅ NUEVO - Componente faltante
├── .env.example                             # ✅ NUEVO - Documentación env vars

PENDIENTES (Backend):
├── BACK/backend/avicolatrack/settings.py    # ⚠️ Secrets, DEBUG

PRIORIDAD MEDIA (Datos Mock):
├── components/dashboard/dashboard-stats.tsx  # Datos mock
├── components/charts/mortality-chart.tsx     # Datos mock
├── lib/hooks/use-app-state.ts                # Estado inicial
├── lib/services/email.service.tsx            # Console.logs
```

---

## ✅ Lo que está bien

1. **Arquitectura sólida**
   - Separación clara frontend/backend
   - Uso de repositorios en frontend
   - DRF bien estructurado

2. **Tecnologías modernas**
   - Next.js 14 con App Router
   - Django 5.2 + DRF
   - TypeScript
   - Tailwind CSS + shadcn/ui

3. **Backend robusto**
   - 44 tests pasando
   - OpenAPI documentado
   - Sistema de permisos por roles
   - Rate limiting implementado

4. **Buenas prácticas parciales**
   - JWT con refresh tokens
   - Validación de datos
   - Estructura modular

---

## 🎯 Criterios de Éxito para Producción

- [x] Almacenamiento seguro de tokens (no localStorage directo)
- [x] Sistema offline funcional para formularios
- [x] Retry automático en API calls
- [x] Variables de entorno documentadas (.env.example)
- [x] Headers de seguridad configurados
- [ ] Todos los errores de TypeScript corregidos
- [ ] `pnpm build` exitoso sin warnings críticos
- [ ] Todos los tests pasando (frontend + backend)
- [ ] Coverage > 70%
- [ ] Sin secrets en código (backend)
- [ ] CI/CD funcional
- [ ] Documentación de despliegue completa
- [ ] Health checks funcionando
- [ ] Logging configurado

---

## 📞 Contacto y Recursos

- **Repositorio:** https://github.com/Pedroza22/AvicolaFront
- **Backend Docs:** `/api/docs/` (Swagger UI)
- **Autor:** Nicolas Garcia (@Nicolas-12000)

---

*Última actualización: 2 de Diciembre, 2025*

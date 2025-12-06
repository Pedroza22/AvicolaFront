# 📋 Análisis de Endpoints: Frontend vs Backend

**Fecha:** 5 de Diciembre, 2025  
**Proyecto:** AvicolaTrack

---

## ✅ Endpoints Implementados Correctamente

### 1. **Autenticación (Auth)**
| Frontend | Backend | Estado |
|----------|---------|--------|
| `/auth/login/` | `/api/auth/login/` | ✅ Implementado |
| `/auth/refresh/` | `/api/auth/refresh/` | ✅ Implementado |
| `/auth/me/` | `/api/auth/me/` | ✅ Implementado |

**Nota:** `/auth/logout/` no existe en backend (JWT stateless), pero funciona bien en frontend.

---

### 2. **Granjas (Farms)**
| Frontend | Backend | Estado |
|----------|---------|--------|
| `/farms/` | `/api/farms/` | ✅ Implementado |
| `/farms/{id}/` | `/api/farms/{id}/` | ✅ Implementado |
| POST/PUT/DELETE | ViewSet completo | ✅ Implementado |

---

### 3. **Galpones (Sheds)**
| Frontend | Backend | Estado |
|----------|---------|--------|
| `/sheds/` | `/api/sheds/` | ✅ Implementado |
| `/sheds/?farm={id}` | Query param funciona | ✅ Implementado |
| `/sheds/{id}/` | `/api/sheds/{id}/` | ✅ Implementado |

---

### 4. **Lotes (Flocks)**
| Frontend | Backend | Estado |
|----------|---------|--------|
| `/flocks/` | `/api/flocks/` | ✅ Implementado |
| `/flocks/?shed={id}` | Query param funciona | ✅ Implementado |
| `/flocks/{id}/` | `/api/flocks/{id}/` | ✅ Implementado |
| `/flocks/{id}/mortality-stats/` | @action personalizado | ✅ Implementado |

---

### 5. **Registros Diarios (Daily Weights)**
| Frontend | Backend | Estado |
|----------|---------|--------|
| `/daily-weights/` | `/api/daily-weights/` | ✅ Implementado |
| `/daily-weights/?flock={id}` | Query param funciona | ✅ Implementado |
| `/daily-weights/{id}/` | `/api/daily-weights/{id}/` | ✅ Implementado |

**⚠️ Nota:** Frontend tiene `/daily-weights/latest/?flock={id}` pero no está en backend.

---

### 6. **Inventario**
| Frontend | Backend | Estado |
|----------|---------|--------|
| `/inventory/` | `/api/inventory/` | ✅ Implementado |
| `/inventory/{id}/` | `/api/inventory/{id}/` | ✅ Implementado |
| `/inventory/stock-alerts/` | @action custom | ✅ Implementado |
| `/inventory/{id}/add-stock/` | @action FIFO | ✅ Implementado |
| `/inventory/{id}/consume-fifo/` | @action FIFO | ✅ Implementado |

**❌ Problema:** Frontend tiene `/inventory/{id}/stock/` para actualizar, backend no lo implementa directamente (usa bulk-update-stock).

---

### 7. **Mortalidad**
| Frontend | Backend | Estado |
|----------|---------|--------|
| `/mortality/` | `/api/mortality/` | ✅ Implementado |
| `/mortality/?flock={id}` | Query param funciona | ✅ Implementado |
| `/mortality/bulk-sync/` | Endpoint especial | ✅ Implementado |

**⚠️ Nota:** Frontend espera crear con `/mortality/bulk-sync/`, backend correcto.

---

## ❌ Endpoints NO Implementados en Backend

### 1. **Pedidos (Orders)** - ⚠️ FALTA COMPLETAMENTE
```typescript
orders: {
  list: "/orders/",
  byFarm: (farmId: string) => `/farms/${farmId}/orders/`,
  detail: (id: string) => `/orders/${id}/`,
  create: "/orders/",
  update: (id: string) => `/orders/${id}/`,
  delete: (id: string) => `/orders/${id}/`,
  send: (id: string) => `/orders/${id}/send/`,
  updateStatus: (id: string) => `/orders/${id}/status/`,
}
```

**🔴 PRIORIDAD ALTA:** El frontend tiene componentes de pedidos (`pedidos-sistema.tsx`) pero no hay backend.

**Solución:**
- Crear app `orders`
- Modelo: Order, OrderItem
- ViewSet con actions: send, updateStatus
- Relacionar con Supplier e InventoryItem

---

### 2. **Proveedores (Suppliers)** - ⚠️ FALTA COMPLETAMENTE
```typescript
suppliers: {
  list: "/suppliers/",
  detail: (id: string) => `/suppliers/${id}/`,
  create: "/suppliers/",
  update: (id: string) => `/suppliers/${id}/`,
  delete: (id: string) => `/suppliers/${id}/`,
}
```

**🔴 PRIORIDAD ALTA:** Necesario para sistema de pedidos.

**Solución:**
- Crear modelo Supplier en app `inventory` o nueva app
- Campos: nombre, contacto, email, teléfono, productos, tiempoEntrega
- ViewSet básico CRUD

---

### 3. **Cámaras (Cameras)** - ⚠️ FALTA COMPLETAMENTE
```typescript
cameras: {
  list: "/cameras/",
  byShed: (shedId: string) => `/sheds/${shedId}/cameras/`,
  detail: (id: string) => `/cameras/${id}/`,
  stream: (id: string) => `/cameras/${id}/stream/`,
  recording: (id: string) => `/cameras/${id}/recording/`,
}
```

**🟡 PRIORIDAD MEDIA:** Funcionalidad avanzada, no crítica para MVP.

**Solución:**
- Crear app `cameras`
- Modelo: Camera (name, status, location, shedId, streamUrl)
- Endpoints de streaming requieren integración con servidor de video

---

### 4. **Predicciones** - ⚠️ FALTA COMPLETAMENTE
```typescript
predictions: {
  growth: "/predictions/growth/",
  consumption: "/predictions/consumption/",
  mortality: "/predictions/mortality/",
}
```

**🟡 PRIORIDAD BAJA:** Funcionalidad con ML, no crítica.

**Solución:**
- Crear app `predictions`
- Integrar modelos de ML (scikit-learn, TensorFlow)
- Endpoints para proyecciones basadas en histórico

---

### 5. **Diseño/Configuración (Design)** - ⚠️ FALTA COMPLETAMENTE
```typescript
design: {
  categories: "/categorias/",
  services: "/servicios/",
  configuration: "/configuracion/",
}
```

**🟢 PRIORIDAD BAJA:** Módulo de configuración maestro.

---

## 🔧 Endpoints que Necesitan Ajustes

### 1. **Reportes (Reports)**
**Backend tiene:**
- `/api/reports/` - CRUD de reportes
- `/api/templates/` - Templates de reportes
- `/api/schedules/` - Reportes programados

**Frontend espera:**
```typescript
reports: {
  growth: "/reports/growth/",
  mortality: "/reports/mortality/",
  inventory: "/reports/inventory/",
  production: "/reports/production/",
  custom: "/reports/custom/",
}
```

**⚠️ Problema:** Estructura diferente. Backend tiene sistema genérico, frontend espera endpoints específicos.

**Solución:**
1. Agregar @actions en ReportViewSet:
   - `@action(detail=False, url_path='growth')`
   - `@action(detail=False, url_path='mortality')`
   - `@action(detail=False, url_path='inventory')`
   - `@action(detail=False, url_path='production')`

---

### 2. **Inventario - Update Stock**
**Frontend espera:**
```typescript
updateStock: (id: string) => `/inventory/${id}/stock/`
```

**Backend tiene:**
- `/inventory/bulk-update-stock/` (actualización masiva)

**Solución:**
Agregar @action simple:
```python
@action(detail=True, methods=['patch'], url_path='stock')
def update_stock(self, request, pk=None):
    item = self.get_object()
    item.current_stock = request.data.get('current_stock')
    item.save()
    return Response(InventoryItemSerializer(item).data)
```

---

### 3. **Daily Records - Latest**
**Frontend espera:**
```typescript
latest: (loteId: string) => `/daily-weights/latest/?flock=${loteId}`
```

**Backend:** No existe endpoint específico.

**Solución:**
Agregar @action en DailyWeightViewSet:
```python
@action(detail=False, methods=['get'], url_path='latest')
def latest(self, request):
    flock_id = request.query_params.get('flock')
    record = DailyWeight.objects.filter(flock_id=flock_id).order_by('-date').first()
    return Response(DailyWeightSerializer(record).data)
```

---

## 📊 Resumen de Prioridades

### 🔴 CRÍTICO - Implementar Ya
1. **Proveedores (Suppliers)** - Necesario para inventario
2. **Pedidos (Orders)** - Los componentes ya existen en frontend
3. **Update Stock endpoint** - Ajuste simple pero necesario

### 🟡 IMPORTANTE - Siguiente Sprint
4. **Reportes específicos** - Agregar @actions por tipo
5. **Latest daily weight** - Endpoint de conveniencia
6. **Cámaras básico** - CRUD sin streaming

### 🟢 FUTURO - Backlog
7. **Predicciones con ML** - Funcionalidad avanzada
8. **Streaming de cámaras** - Requiere infraestructura
9. **Módulo de diseño/configuración** - Admin avanzado

---

## 🎯 Recomendaciones Inmediatas

### 1. Crear app `orders`
```bash
python manage.py startapp orders
```

**Modelos necesarios:**
```python
class Supplier(models.Model):
    name = models.CharField(max_length=200)
    contact_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    address = models.TextField()
    products = models.JSONField()  # Lista de productos que vende
    delivery_time_days = models.PositiveIntegerField()
    rating = models.DecimalField(max_digits=3, decimal_places=2)
    
class Order(models.Model):
    STATUS_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('en-transito', 'En Tránsito'),
        ('entregado', 'Entregado'),
        ('cancelado', 'Cancelado'),
    ]
    URGENCY_CHOICES = [
        ('normal', 'Normal'),
        ('urgente', 'Urgente'),
        ('critica', 'Crítica'),
    ]
    
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE)
    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES)
    order_date = models.DateTimeField(auto_now_add=True)
    delivery_date = models.DateField()
    total = models.DecimalField(max_digits=12, decimal_places=2)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
```

---

### 2. Agregar endpoints faltantes en inventario
```python
# En apps/inventory/views.py - InventoryViewSet

@action(detail=True, methods=['patch'], url_path='stock')
def update_stock(self, request, pk=None):
    """Simple stock update endpoint"""
    item = self.get_object()
    new_stock = request.data.get('current_stock')
    if new_stock is not None:
        item.current_stock = new_stock
        item.save()
    return Response(InventoryItemSerializer(item).data)
```

---

### 3. Agregar latest en daily-weights
```python
# En apps/flocks/views_weight.py - DailyWeightViewSet

@action(detail=False, methods=['get'], url_path='latest')
def latest(self, request):
    """Get latest daily weight for a flock"""
    flock_id = request.query_params.get('flock')
    if not flock_id:
        return Response({'error': 'flock parameter required'}, status=400)
    
    record = DailyWeight.objects.filter(
        flock_id=flock_id
    ).order_by('-date').first()
    
    if not record:
        return Response({'error': 'No records found'}, status=404)
    
    return Response(DailyWeightSerializer(record).data)
```

---

### 4. Agregar reportes específicos
```python
# En apps/reports/views.py - ReportViewSet

@action(detail=False, methods=['get'], url_path='growth')
def growth_report(self, request):
    """Generate growth report"""
    # Lógica para reporte de crecimiento
    pass

@action(detail=False, methods=['get'], url_path='mortality')
def mortality_report(self, request):
    """Generate mortality report"""
    pass

@action(detail=False, methods=['get'], url_path='inventory')
def inventory_report(self, request):
    """Generate inventory report"""
    pass

@action(detail=False, methods=['get'], url_path='production')
def production_report(self, request):
    """Generate production report"""
    pass
```

---

## 📝 Conclusión

**Estado actual:** ~70% de endpoints implementados

**Crítico pendiente:**
- Sistema de pedidos y proveedores
- Ajustes menores en endpoints existentes

**Próximos pasos:**
1. Implementar Suppliers y Orders (1-2 días)
2. Agregar @actions faltantes (4 horas)
3. Probar integración completa frontend-backend
4. Planificar módulos avanzados (cámaras, predicciones)


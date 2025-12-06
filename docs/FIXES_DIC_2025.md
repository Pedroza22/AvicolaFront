# Correcciones Realizadas - Diciembre 5, 2025

## Problema Reportado
- Selectores de granja y galpón no mostraban opciones en la vista admin
- Alertas de stock mostraban todas las ubicaciones sin filtrar
- Estado inicial con valores hardcodeados inválidos

## Cambios Implementados

### 1. Frontend - Estado Inicial (lib/hooks/use-app-state.ts)
**Antes:**
```typescript
selectedFarm: "granja-1",
selectedShed: "galpon-1",
selectedLote: "9",
```

**Después:**
```typescript
selectedFarm: undefined,
selectedShed: undefined,
selectedLote: undefined,
```

**Razón:** Los IDs hardcodeados no existían en la base de datos. Ahora el sistema carga dinámicamente.

### 2. Frontend - Selección Automática (components/shared/farm-selector.tsx)
Agregada lógica para auto-seleccionar:
- Primera granja cuando se carga la lista
- Primer galpón cuando se selecciona granja
- Primer lote cuando se selecciona galpón

```typescript
if (!selectedFarm && farmList.length > 0) {
  onFarmChange(farmList[0].id)
}
```

### 3. Frontend - Tipos (lib/types/index.ts)
```typescript
export interface AppState {
  selectedFarm: string | undefined  // Ahora permite undefined
  selectedShed: string | undefined
  selectedLote: string | undefined
  selectedRole: string
  user: User | null
}
```

### 4. Backend - Campo name en Flock (apps/flocks/serializers.py)
Agregado campo calculado `name` al serializer:
```python
class FlockSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    
    def get_name(self, obj: Flock):
        return f"Lote {obj.id}"
```

**API Response ahora incluye:**
```json
{
  "id": 1,
  "name": "Lote 1",
  "breed": "Ross",
  ...
}
```

### 5. Frontend - Filtrado de Alertas (components/inventory/stock-alerts.tsx)
- Agregado import de `useAppState` para acceder a granja/galpón seleccionado
- Lógica de filtrado (preparada para cuando backend incluya farm_id/shed_id)
- Mensajes contextuales cuando no hay alertas filtradas

### 6. Frontend - Componente de Inventario (app/inventario/page.tsx)
Corregido uso de StockAlerts:
```typescript
<StockAlerts />  // Sin props hardcodeadas
```

## Verificación Backend
```powershell
# Test realizado - Login y farms
$response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/auth/login/" -Method POST -Body '{"username":"admin","password":"admin123"}'
$farms = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/farms/" -Headers @{"Authorization"="Bearer $token"}

# Resultado: 3 granjas encontradas
- FincaDemo1 (ID: 1)
- FincaDemo2 (ID: 2)  
- granja-1 (ID: 3)
```

## Estado Actual

### ✅ Funcionando
- Login con admin/admin123
- API devuelve granjas correctamente (3 granjas)
- API devuelve galpones por granja (9 galpones total)
- API devuelve lotes con campo `name` (14 lotes)
- Stock alerts devuelve alertas con categorización (critical/low/out_of_stock)

### ✅ Corregido
- Estado inicial sin valores inválidos
- Auto-selección de primera opción disponible
- Tipos permiten undefined
- Campo name en flocks

### 🔄 Próximos Pasos Sugeridos
1. **Backend**: Agregar `farm_id` y `shed_id` al response de stock alerts para filtrado preciso
2. **Frontend**: Implementar filtrado real cuando backend provea IDs
3. **UX**: Agregar loading states en selectores
4. **Testing**: Probar con diferentes roles (Galponero, Admin Granja)

## Cómo Probar

1. **Limpiar localStorage**:
   ```javascript
   // En consola del navegador
   localStorage.clear()
   sessionStorage.clear()
   ```

2. **Login**:
   - Usuario: admin
   - Password: admin123

3. **Verificar**:
   - Selector de granja debe mostrar 3 opciones
   - Al seleccionar granja, debe cargar galpones
   - Al seleccionar galpón, debe cargar lotes
   - Alertas deben mostrar todas las ubicaciones (por ahora)

## Archivos Modificados
- `lib/hooks/use-app-state.ts` - Estado inicial
- `lib/types/index.ts` - Tipos con undefined
- `components/shared/farm-selector.tsx` - Auto-selección
- `components/inventory/stock-alerts.tsx` - Filtrado y mensajes
- `app/inventario/page.tsx` - Props corregidas
- `apps/flocks/serializers.py` - Campo name agregado

## Comandos Útiles

### Verificar datos en DB
```bash
cd BACK/backend
python manage.py shell -c "from apps.farms.models import Farm; print([(f.id, f.name) for f in Farm.objects.all()])"
```

### Test API desde PowerShell
```powershell
$response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/auth/login/" -Method POST -ContentType "application/json" -Body '{"username":"admin","password":"admin123"}'
$token = $response.access
$headers = @{"Authorization"="Bearer $token"}
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/farms/" -Headers $headers
```

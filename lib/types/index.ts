// Tipos de datos principales
export interface Farm {
  id: string
  name: string
  sheds: number
  status: "activa" | "mantenimiento" | "inactiva"
}

export interface Shed {
  id: string
  name: string
  capacity: number
  current: number
  farmId: string
}

export interface Lote {
  id: string | number
  name?: string // Calculado en el frontend
  arrival_date?: string
  fechaInicio?: string
  initial_quantity?: number
  current_quantity?: number
  pollosIniciales?: number
  pollosActuales?: number
  initial_weight?: number
  breed?: string
  raza?: string
  gender?: string
  supplier?: string
  proveedor?: string
  status?: "ACTIVE" | "SOLD" | "FINISHED" | "TRANSFERRED" | "activo" | "finalizando" | "completado"
  shed?: string | number
  shedId?: string
  current_age_days?: number
  diasActuales?: number
  survival_rate?: number
  pesoPromedio?: number
  mortalidadTotal?: number
  created_by?: number
}

export interface DailyRecord {
  id: string
  fecha: string
  loteId: string
  diaLote: number
  numeroPollos: number
  pesoPromedio: number
  consumoAlimento: WeeklyConsumption
  totalBultos: number
  consumoSemanal: number
  observaciones: string
  createdBy: string
}

export interface WeeklyConsumption {
  lunes: number
  martes: number
  miercoles: number
  jueves: number
  viernes: number
  sabado: number
  domingo: number
}

export interface InventoryItem {
  id: string
  producto: string
  categoria: "alimento" | "medicamento" | "vacuna" | "suplemento" | "desinfectante"
  stockActual: number
  stockMinimo: number
  unidad: "bultos" | "kg" | "frascos" | "dosis" | "litros"
  proveedorId: string
  ultimaActualizacion: string
  farmId: string
}

export interface Proveedor {
  id: string
  nombre: string
  contacto: string
  email: string
  telefono: string
  direccion: string
  productos: string[]
  tiempoEntrega: string
  calificacion: number
}

export interface Pedido {
  id: string
  fecha: string
  proveedorId: string
  productos: PedidoProducto[]
  total: number
  estado: "pendiente" | "en-transito" | "entregado" | "cancelado"
  fechaEntrega: string
  urgencia: "normal" | "urgente" | "critica"
  observaciones?: string
  farmId: string
  createdBy: string
}

export interface PedidoProducto {
  producto: string
  cantidad: number
  unidad: string
  precio: number
}

export interface MortalityRecord {
  id: string
  fecha: string
  loteId: string
  mortalidadDia: number
  causas: {
    enfermedad: number
    accidente: number
    estres: number
    otros: number
  }
  observaciones: string
  accionesTomadas: string
  createdBy: string
}

// Types for mortality statistics returned by the backend (`/flocks/{id}/mortality-stats/`)
export interface MortalitySeriesItem {
  label?: string
  date?: string
  mortality_rate?: number
  value?: number
  industry_average?: number
}

export interface MortalityStats {
  series?: MortalitySeriesItem[]
  total_deaths?: number
  mortality_rate?: number
  daily_average?: number
  period?: {
    start?: string
    end?: string
  }
}

export interface User {
  id: string
  username: string
  email: string
  identification?: string
  phone?: string
  role?: {
    id: number
    name: string
  } | null
  rol?: "admin-empresa" | "admin-granja" | "veterinario" | "galponero"
  farmId?: string
}

// Tipos para el estado de la aplicación
export interface AppState {
  selectedFarm: string | undefined
  selectedShed: string | undefined
  selectedLote: string | undefined
  selectedRole: string
  user: User | null
}

// Tipos para alertas
export interface StockAlert {
  id: number
  name: string
  location: string
  current_stock: number
  unit: string
  status: {
    status: "OUT_OF_STOCK" | "CRITICAL" | "LOW" | "NORMAL" | "UNKNOWN"
    color: string
    message: string
  }
  projected_stockout: string | null
}

export interface StockAlertsResponse {
  alerts: {
    critical: StockAlert[]
    low: StockAlert[]
    out_of_stock: StockAlert[]
  }
  summary: {
    total_items: number
    critical_count: number
    low_count: number
    out_of_stock_count: number
  }
}

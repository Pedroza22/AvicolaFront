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
  id: string
  name: string
  fechaInicio: string
  raza: string
  proveedor: string
  pollosIniciales: number
  pollosActuales: number
  diasActuales: number
  status: "activo" | "finalizando" | "completado"
  shedId: string
  pesoPromedio?: number
  mortalidadTotal?: number
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
  nombre: string
  email: string
  rol: "admin-empresa" | "admin-granja" | "veterinario" | "galponero"
  farmId?: string
}

export interface Camera {
  id: string
  name: string
  status: "online" | "offline" | "warning"
  location: string
  resolution: string
  fps: number
  lastUpdate: string
  shedId: string
}

// Tipos para el estado de la aplicación
export interface AppState {
  selectedFarm: string
  selectedShed: string
  selectedLote: string
  selectedRole: string
  user: User | null
}

// Tipos para alertas
export interface StockAlert {
  id: string
  producto: string
  stockActual: number
  stockMinimo: number
  urgencia: "critica" | "alta" | "media"
  diasRestantes: number
  proveedorId: string
}

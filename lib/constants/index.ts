// Configuración de la aplicación
export const APP_CONFIG = {
  name: "Sistema de Control Avícola",
  version: "1.0.0",
  defaultLanguage: "es",
}

// Configuración de inventario
export const INVENTORY_CONFIG = {
  bultoWeight: 40, // kg por bulto
  alertThresholdDays: 7, // días antes de alerta
  criticalThresholdDays: 2, // días para alerta crítica
}

// Estados de pedidos
export const ORDER_STATUS = {
  PENDIENTE: "pendiente",
  EN_TRANSITO: "en-transito",
  ENTREGADO: "entregado",
  CANCELADO: "cancelado",
} as const

// Niveles de urgencia
export const URGENCY_LEVELS = {
  NORMAL: "normal",
  URGENTE: "urgente",
  CRITICA: "critica",
} as const

// Roles de usuario
export const USER_ROLES = {
  ADMIN_EMPRESA: "admin-empresa",
  ADMIN_GRANJA: "admin-granja",
  VETERINARIO: "veterinario",
  GALPONERO: "galponero",
} as const

// Categorías de productos
export const PRODUCT_CATEGORIES = {
  ALIMENTO: "alimento",
  MEDICAMENTO: "medicamento",
  VACUNA: "vacuna",
  SUPLEMENTO: "suplemento",
  DESINFECTANTE: "desinfectante",
} as const

// Unidades de medida
export const UNITS = {
  BULTOS: "bultos",
  KG: "kg",
  FRASCOS: "frascos",
  DOSIS: "dosis",
  LITROS: "litros",
} as const

// Razas de pollos
export const CHICKEN_BREEDS = [
  { id: "cobb-500", name: "Cobb 500" },
  { id: "ross-308", name: "Ross 308" },
  { id: "hubbard", name: "Hubbard Classic" },
] as const

// Proveedores de pollitos
export const CHICK_SUPPLIERS = [
  { id: "incuves", name: "Incuves" },
  { id: "aviagen", name: "Aviagen" },
  { id: "cobb", name: "Cobb" },
] as const

// Días de la semana
export const WEEKDAYS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"] as const

// Colores para estados
export const STATUS_COLORS = {
  success: "bg-green-50 text-green-700 border-green-200",
  warning: "bg-orange-50 text-orange-700 border-orange-200",
  error: "bg-red-50 text-red-700 border-red-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  neutral: "bg-gray-50 text-gray-700 border-gray-200",
} as const

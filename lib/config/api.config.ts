/**
 * API Configuration
 * 
 * IMPORTANTE: Para producción, configura las variables de entorno:
 * - NEXT_PUBLIC_API_URL: URL completa del backend (ej: https://api.tudominio.com/api)
 * 
 * En desarrollo, usa un archivo .env.local:
 * NEXT_PUBLIC_API_URL=http://localhost:8000/api
 */

const getBaseURL = (): string => {
  // 1. Prioridad: Variable de entorno explícita
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }

  // 2. En el servidor (SSR), usar URL relativa
  if (typeof window === "undefined") {
    return "/api"
  }

  // 3. En desarrollo del cliente, intentar localhost
  if (process.env.NODE_ENV === "development") {
    return "http://127.0.0.1:8000/api"
  }

  // 4. En producción sin variable configurada, usar ruta relativa
  // (asume que el frontend y backend están en el mismo dominio o hay un proxy)
  return "/api"
}

export const API_CONFIG = {
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  // Configuración de retry
  retry: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
  },
}

export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: "/auth/login/",
    logout: "/auth/logout/",
    refresh: "/auth/refresh/",
    me: "/auth/me/",
  },
  // Farms
  farms: {
    list: "/farms/",
    detail: (id: string) => `/farms/${id}/`,
    create: "/farms/",
    update: (id: string) => `/farms/${id}/`,
    delete: (id: string) => `/farms/${id}/`,
  },
  // Sheds
  sheds: {
    list: "/sheds/",
    // Backend exposes sheds as a top-level resource; filter by farm using query param
    byFarm: (farmId: string) => `/sheds/?farm=${farmId}`,
    detail: (id: string) => `/sheds/${id}/`,
    create: "/sheds/",
    update: (id: string) => `/sheds/${id}/`,
    delete: (id: string) => `/sheds/${id}/`,
  },
  // Lotes
  lotes: {
    // Backend uses 'flocks' as resource name; map frontend 'lotes' to '/flocks/'
    list: "/flocks/",
    // front previously used nested path by shed; backend exposes filtering by query param
    byShed: (shedId: string) => `/flocks/?shed=${shedId}`,
    detail: (id: string) => `/flocks/${id}/`,
    create: "/flocks/",
    update: (id: string) => `/flocks/${id}/`,
    delete: (id: string) => `/flocks/${id}/`,
    active: "/flocks/active/",
    // Per-flock stats (mortality series & aggregates)
    stats: (id: string) => `/flocks/${id}/mortality-stats/`,
  },
  // Daily Records
  dailyRecords: {
    // Backend exposes daily weights under 'daily-weights'
    list: "/daily-weights/",
    byLote: (loteId: string) => `/daily-weights/?flock=${loteId}`,
    detail: (id: string) => `/daily-weights/${id}/`,
    create: "/daily-weights/",
    update: (id: string) => `/daily-weights/${id}/`,
    delete: (id: string) => `/daily-weights/${id}/`,
    latest: (loteId: string) => `/daily-weights/latest/?flock=${loteId}`,
  },
  // Inventory
  inventory: {
    list: "/inventory/",
    byFarm: (farmId: string) => `/farms/${farmId}/inventory/`,
    detail: (id: string) => `/inventory/${id}/`,
    create: "/inventory/",
    update: (id: string) => `/inventory/${id}/`,
    delete: (id: string) => `/inventory/${id}/`,
    // Backend endpoint: GET /inventory/stock-alerts/ (returns alerts categorized by status)
    alerts: "/inventory/stock-alerts/",
    updateStock: (id: string) => `/inventory/${id}/stock/`,
  },
  // Mortality
  mortality: {
    // Backend currently exposes a bulk-sync mortality endpoint.
    // For creation use the bulk-sync path. Per-flock listing/stats are
    // not exposed as dedicated endpoints yet; use query params or add
    // a backend action (recommended) such as `/flocks/<id>/mortality-stats/`.
    list: "/mortality/",
    byLote: (loteId: string) => `/mortality/?flock=${loteId}`,
    detail: (id: string) => `/mortality/${id}/`,
    // Use the backend bulk-sync action for creating mortality records
    // (it accepts an array of records). This maps to `/api/mortality/bulk-sync/`.
    create: "/mortality/bulk-sync/",
    update: (id: string) => `/mortality/${id}/`,
    delete: (id: string) => `/mortality/${id}/`,
    // Stats: backend exposes a per-flock stats action at `/flocks/{id}/mortality-stats/`.
    stats: (loteId: string) => `/flocks/${loteId}/mortality-stats/`,
  },
  // Orders
  orders: {
    list: "/orders/",
    byFarm: (farmId: string) => `/orders/?farm=${farmId}`,
    detail: (id: string) => `/orders/${id}/`,
    create: "/orders/",
    update: (id: string) => `/orders/${id}/`,
    delete: (id: string) => `/orders/${id}/`,
    send: (id: string) => `/orders/${id}/send/`,
    updateStatus: (id: string) => `/orders/${id}/update-status/`,
  },
  // Suppliers
  suppliers: {
    list: "/suppliers/",
    detail: (id: string) => `/suppliers/${id}/`,
    create: "/suppliers/",
    update: (id: string) => `/suppliers/${id}/`,
    delete: (id: string) => `/suppliers/${id}/`,
  },
  // Reports
  reports: {
    growth: "/reports/growth-report/",
    mortality: "/reports/mortality-report/",
    inventory: "/reports/inventory-report/",
    production: "/reports/production-report/",
    custom: "/reports/custom/",
  },
  // Predictions - NOT IMPLEMENTED IN BACKEND
  // TODO: Implement predictions endpoints in backend if needed
  // predictions: {
  //   growth: "/predictions/growth/",
  //   consumption: "/predictions/consumption/",
  //   mortality: "/predictions/mortality/",
  // },
  // Design (Diseña) master data
  design: {
    categories: "/categorias/",
    services: "/servicios/",
    configuration: "/configuracion/",
  },
} as const

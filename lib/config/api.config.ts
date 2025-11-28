export const API_CONFIG = {
  // In development prefer direct backend URL to avoid Next proxy redirect issues.
  // In production or when NEXT_PUBLIC_API_URL is set, use that value.
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "development" ? "http://127.0.0.1:8000/api" : "/api"),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
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
    alerts: (farmId: string) => `/farms/${farmId}/inventory/alerts/`,
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
    byFarm: (farmId: string) => `/farms/${farmId}/orders/`,
    detail: (id: string) => `/orders/${id}/`,
    create: "/orders/",
    update: (id: string) => `/orders/${id}/`,
    delete: (id: string) => `/orders/${id}/`,
    send: (id: string) => `/orders/${id}/send/`,
    updateStatus: (id: string) => `/orders/${id}/status/`,
  },
  // Suppliers
  suppliers: {
    list: "/suppliers/",
    detail: (id: string) => `/suppliers/${id}/`,
    create: "/suppliers/",
    update: (id: string) => `/suppliers/${id}/`,
    delete: (id: string) => `/suppliers/${id}/`,
  },
  // Cameras (verify backend support before use)
  // If your backend exposes camera APIs, keep these; otherwise remove.
  // Currently not present in OpenAPI dump.
  cameras: {
    list: "/cameras/",
    byShed: (shedId: string) => `/sheds/${shedId}/cameras/`,
    detail: (id: string) => `/cameras/${id}/`,
    create: "/cameras/",
    update: (id: string) => `/cameras/${id}/`,
    delete: (id: string) => `/cameras/${id}/`,
    stream: (id: string) => `/cameras/${id}/stream/`,
    recording: (id: string) => `/cameras/${id}/recording/`,
  },
  // Reports
  reports: {
    growth: "/reports/growth/",
    mortality: "/reports/mortality/",
    inventory: "/reports/inventory/",
    production: "/reports/production/",
    custom: "/reports/custom/",
  },
  // Predictions
  // TODO: Confirm predictions endpoints in backend; keep if implemented.
  predictions: {
    growth: "/predictions/growth/",
    consumption: "/predictions/consumption/",
    mortality: "/predictions/mortality/",
  },
  // Design (Diseña) master data
  design: {
    categories: "/categorias/",
    services: "/servicios/",
    configuration: "/configuracion/",
  },
} as const

export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
}

export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me",
  },
  // Farms
  farms: {
    list: "/farms",
    detail: (id: string) => `/farms/${id}`,
    create: "/farms",
    update: (id: string) => `/farms/${id}`,
    delete: (id: string) => `/farms/${id}`,
  },
  // Sheds
  sheds: {
    list: "/sheds",
    byFarm: (farmId: string) => `/farms/${farmId}/sheds`,
    detail: (id: string) => `/sheds/${id}`,
    create: "/sheds",
    update: (id: string) => `/sheds/${id}`,
    delete: (id: string) => `/sheds/${id}`,
  },
  // Lotes
  lotes: {
    list: "/lotes",
    byShed: (shedId: string) => `/sheds/${shedId}/lotes`,
    detail: (id: string) => `/lotes/${id}`,
    create: "/lotes",
    update: (id: string) => `/lotes/${id}`,
    delete: (id: string) => `/lotes/${id}`,
    active: "/lotes/active",
  },
  // Daily Records
  dailyRecords: {
    list: "/daily-records",
    byLote: (loteId: string) => `/lotes/${loteId}/daily-records`,
    detail: (id: string) => `/daily-records/${id}`,
    create: "/daily-records",
    update: (id: string) => `/daily-records/${id}`,
    delete: (id: string) => `/daily-records/${id}`,
    latest: (loteId: string) => `/lotes/${loteId}/daily-records/latest`,
  },
  // Inventory
  inventory: {
    list: "/inventory",
    byFarm: (farmId: string) => `/farms/${farmId}/inventory`,
    detail: (id: string) => `/inventory/${id}`,
    create: "/inventory",
    update: (id: string) => `/inventory/${id}`,
    delete: (id: string) => `/inventory/${id}`,
    alerts: (farmId: string) => `/farms/${farmId}/inventory/alerts`,
    updateStock: (id: string) => `/inventory/${id}/stock`,
  },
  // Mortality
  mortality: {
    list: "/mortality",
    byLote: (loteId: string) => `/lotes/${loteId}/mortality`,
    detail: (id: string) => `/mortality/${id}`,
    create: "/mortality",
    update: (id: string) => `/mortality/${id}`,
    delete: (id: string) => `/mortality/${id}`,
    stats: (loteId: string) => `/lotes/${loteId}/mortality/stats`,
  },
  // Orders
  orders: {
    list: "/orders",
    byFarm: (farmId: string) => `/farms/${farmId}/orders`,
    detail: (id: string) => `/orders/${id}`,
    create: "/orders",
    update: (id: string) => `/orders/${id}`,
    delete: (id: string) => `/orders/${id}`,
    send: (id: string) => `/orders/${id}/send`,
    updateStatus: (id: string) => `/orders/${id}/status`,
  },
  // Suppliers
  suppliers: {
    list: "/suppliers",
    detail: (id: string) => `/suppliers/${id}`,
    create: "/suppliers",
    update: (id: string) => `/suppliers/${id}`,
    delete: (id: string) => `/suppliers/${id}`,
  },
  // Cameras
  cameras: {
    list: "/cameras",
    byShed: (shedId: string) => `/sheds/${shedId}/cameras`,
    detail: (id: string) => `/cameras/${id}`,
    create: "/cameras",
    update: (id: string) => `/cameras/${id}`,
    delete: (id: string) => `/cameras/${id}`,
    stream: (id: string) => `/cameras/${id}/stream`,
    recording: (id: string) => `/cameras/${id}/recording`,
  },
  // Reports
  reports: {
    growth: "/reports/growth",
    mortality: "/reports/mortality",
    inventory: "/reports/inventory",
    production: "/reports/production",
    custom: "/reports/custom",
  },
  // Predictions
  predictions: {
    growth: "/predictions/growth",
    consumption: "/predictions/consumption",
    mortality: "/predictions/mortality",
  },
} as const

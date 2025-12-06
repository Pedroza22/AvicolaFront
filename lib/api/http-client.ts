import { API_CONFIG } from "@/lib/config/api.config"
import { secureStorage } from "@/lib/services/secure-storage.service"
import { offlineSyncService } from "@/lib/services/offline-sync.service"

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  code?: string
  status?: number
  errors?: Record<string, string[]>
  isOffline?: boolean
}

interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
}

export class HttpClient {
  private baseURL: string
  private timeout: number
  private headers: Record<string, string>
  private retryConfig: RetryConfig

  // single-flight refresh lock
  private static refreshPromise: Promise<any> | null = null

  constructor(retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG) {
    this.baseURL = API_CONFIG.baseURL
    this.timeout = API_CONFIG.timeout
    this.headers = API_CONFIG.headers
    this.retryConfig = retryConfig
  }

  /**
   * Verifica si el cliente está online
   */
  private isOnline(): boolean {
    return typeof navigator !== "undefined" ? navigator.onLine : true
  }

  /**
   * Calcula el delay con exponential backoff
   */
  private calculateBackoff(attempt: number): number {
    const delay = Math.min(
      this.retryConfig.baseDelay * Math.pow(2, attempt),
      this.retryConfig.maxDelay
    )
    // Agregar jitter para evitar thundering herd
    return delay + Math.random() * 1000
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Request principal con retry y manejo offline
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    // Verificar conexión antes de intentar
    if (!this.isOnline()) {
      const error: ApiError = {
        message: "Sin conexión a internet",
        code: "OFFLINE",
        isOffline: true,
      }
      throw error
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      // Obtener token de forma segura (ya no usa localStorage directamente)
      const token = secureStorage.getAccessToken()
      
      // Debug: Log cuando se hace una petición
      if (process.env.NODE_ENV === 'development') {
        console.log(`🌐 Request: ${options.method || 'GET'} ${endpoint}`)
        console.log(`🔑 Token presente:`, token ? 'SÍ' : 'NO')
        if (token) {
          console.log(`🔑 Token (primeros 20 chars):`, token.substring(0, 20) + '...')
        }
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        // Debug: Log de error de respuesta
        if (process.env.NODE_ENV === 'development') {
          console.error(`❌ Response error: ${response.status} ${response.statusText}`)
        }
        
        // Manejar 401 - intento de refresh
        if (response.status === 401) {
          const refreshed = await this.handleTokenRefresh()
          if (refreshed) {
            // Reintentar con nuevo token
            return this.request<T>(endpoint, options, retryCount)
          }
          // Refresh falló, redirigir a login
          this.redirectToLogin()
          throw { message: "Sesión expirada", code: "UNAUTHORIZED", status: 401 }
        }

        // Para errores 5xx, reintentar con backoff
        if (response.status >= 500 && retryCount < this.retryConfig.maxRetries) {
          await this.delay(this.calculateBackoff(retryCount))
          return this.request<T>(endpoint, options, retryCount + 1)
        }

        const error = await this.handleError(response)
        throw error
      }

      const json = await response.json()

      // Normalizar respuesta
      if (json && typeof json === "object" && ("data" in json || "success" in json)) {
        return json as ApiResponse<T>
      }

      return { data: json as T, success: true }
    } catch (error) {
      clearTimeout(timeoutId)

      // Error de timeout - reintentar
      if (error instanceof Error && error.name === "AbortError") {
        if (retryCount < this.retryConfig.maxRetries) {
          await this.delay(this.calculateBackoff(retryCount))
          return this.request<T>(endpoint, options, retryCount + 1)
        }
        throw { message: "Tiempo de espera agotado", code: "TIMEOUT" }
      }

      // Error de red (offline o conexión fallida)
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw {
          message: "Error de conexión",
          code: "NETWORK_ERROR",
          isOffline: !this.isOnline(),
        }
      }

      throw error
    }
  }

  /**
   * Request con soporte offline (encola si no hay conexión)
   */
  private async requestWithOfflineSupport<T>(
    endpoint: string,
    method: "POST" | "PUT" | "PATCH" | "DELETE",
    data?: any,
    entityType?: string
  ): Promise<ApiResponse<T>> {
    try {
      return await this.request<T>(endpoint, {
        method,
        body: data ? JSON.stringify(data) : undefined,
      })
    } catch (error: any) {
      // Si está offline, encolar operación para sincronizar después
      if (error.isOffline || error.code === "NETWORK_ERROR" || error.code === "OFFLINE") {
        if (entityType) {
          await offlineSyncService.queueOperation({
            endpoint,
            method,
            data,
            entityType,
            maxRetries: 5,
          })

          return {
            data: { ...data, _pendingSync: true } as T,
            success: true,
            message: "Guardado localmente. Se sincronizará cuando haya conexión.",
          }
        }
      }
      throw error
    }
  }

  /**
   * Maneja error 401 intentando refrescar el token
   */
  private async handleTokenRefresh(): Promise<boolean> {
    try {
      // Usar single-flight para evitar múltiples refresh simultáneos
      if (!HttpClient.refreshPromise) {
        HttpClient.refreshPromise = (async () => {
          const { AuthService } = await import("@/lib/services/auth.service")
          return AuthService.refresh()
        })()
      }

      const result = await HttpClient.refreshPromise
      HttpClient.refreshPromise = null

      return !!result?.access
    } catch (e) {
      HttpClient.refreshPromise = null
      return false
    }
  }

  /**
   * Parsea errores de respuesta
   */
  private async handleError(response: Response): Promise<ApiError> {
    let errorData: any

    try {
      errorData = await response.json()
    } catch {
      errorData = { message: response.statusText }
    }

    return {
      message: errorData.message || errorData.detail || "Ha ocurrido un error",
      code: errorData.code,
      status: response.status,
      errors: errorData.errors,
    }
  }

  /**
   * Redirige al login limpiando sesión
   */
  private redirectToLogin(): void {
    if (typeof window !== "undefined") {
      secureStorage.clearAll()
      window.location.href = "/login"
    }
  }

  // ============== MÉTODOS PÚBLICOS ==============

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ""
    return this.request<T>(`${endpoint}${queryString}`, { method: "GET" })
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: { offlineEntityType?: string }
  ): Promise<ApiResponse<T>> {
    if (options?.offlineEntityType) {
      return this.requestWithOfflineSupport<T>(
        endpoint,
        "POST",
        data,
        options.offlineEntityType
      )
    }
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options?: { offlineEntityType?: string }
  ): Promise<ApiResponse<T>> {
    if (options?.offlineEntityType) {
      return this.requestWithOfflineSupport<T>(
        endpoint,
        "PUT",
        data,
        options.offlineEntityType
      )
    }
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    options?: { offlineEntityType?: string }
  ): Promise<ApiResponse<T>> {
    if (options?.offlineEntityType) {
      return this.requestWithOfflineSupport<T>(
        endpoint,
        "PATCH",
        data,
        options.offlineEntityType
      )
    }
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }

  /**
   * Health check del servidor
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.get("/health/")
      return true
    } catch {
      return false
    }
  }
}

// Singleton instance
export const httpClient = new HttpClient()

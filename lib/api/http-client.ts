import { API_CONFIG } from "@/lib/config/api.config"

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
}

export class HttpClient {
  private baseURL: string
  private timeout: number
  private headers: Record<string, string>

  constructor() {
    this.baseURL = API_CONFIG.baseURL
    this.timeout = API_CONFIG.timeout
    this.headers = API_CONFIG.headers
  }

  // single-flight refresh lock
  private static refreshPromise: Promise<any> | null = null

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)
    let attemptedRefresh = false

    try {
      // Get auth token from localStorage or cookie
      const token = this.getAuthToken()

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
        // If 401 and we haven't attempted refresh, try refresh and retry once
        if (response.status === 401 && !attemptedRefresh) {
          attemptedRefresh = true
          try {
            // Use single-flight refresh to avoid multiple concurrent refresh calls
            if (!HttpClient.refreshPromise) {
              HttpClient.refreshPromise = (async () => {
                const { AuthService } = await import("@/lib/services/auth.service")
                return AuthService.refresh()
              })()
            }
            const refreshed = await HttpClient.refreshPromise
            HttpClient.refreshPromise = null
            if (refreshed?.access) {
              // Retry original request with new token
              const newToken = this.getAuthToken()
              const retryResponse = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers: {
                  ...this.headers,
                  ...options.headers,
                  ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
                },
                signal: controller.signal,
              })
              if (!retryResponse.ok) {
                const error = await this.handleError(retryResponse)
                throw error
              }
              const retryJson = await retryResponse.json()
              if (retryJson && typeof retryJson === "object" && ("data" in retryJson || "success" in retryJson)) {
                return retryJson as ApiResponse<T>
              }
              return { data: retryJson as T, success: true }
            }
          } catch (e) {
            HttpClient.refreshPromise = null
            // fallthrough to handle original response
          }
        }

        const error = await this.handleError(response)
        throw error
      }

      const json = await response.json()

      // Normalize responses: many DRF endpoints return the resource directly
      // (e.g. list of farms). Frontend code expects ApiResponse<T> with
      // { data, success }. If backend already returns that shape, pass it
      // through. Otherwise wrap the returned JSON into our ApiResponse.
      if (json && typeof json === "object" && ("data" in json || "success" in json)) {
        return json as ApiResponse<T>
      }

      return { data: json as T, success: true }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timeout")
      }
      throw error
    }
  }

  private async handleError(response: Response): Promise<ApiError> {
    let errorData: any

    try {
      errorData = await response.json()
    } catch {
      errorData = { message: response.statusText }
    }

    const error: ApiError = {
      message: errorData.message || "An error occurred",
      code: errorData.code,
      status: response.status,
      errors: errorData.errors,
    }

    // Handle specific status codes
    if (response.status === 401) {
      // Try to refresh token once and let the caller decide; if refresh
      // fails, clear auth and redirect to login.
      try {
        // dynamic import to prevent circular dependency
        const { AuthService } = await import("@/lib/services/auth.service")
        const refreshed = await AuthService.refresh()
        if (refreshed?.access) {
          // If refresh succeeded, do nothing here. The original request
          // will be retried by the caller. We still return the error to
          // signal the initial attempt failed; caller logic handles retry.
        } else {
          this.handleUnauthorized()
        }
      } catch (_e) {
        this.handleUnauthorized()
      }
    }

    return error
  }

  private getAuthToken(): string | null {
    // Get token from localStorage, cookie, or your auth solution
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token")
    }
    return null
  }

  private handleUnauthorized(): void {
    // Clear auth data and redirect to login
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
      // You can dispatch an event or use your router here
      window.location.href = "/login"
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ""
    return this.request<T>(`${endpoint}${queryString}`, {
      method: "GET",
    })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    })
  }
}

// Singleton instance
export const httpClient = new HttpClient()

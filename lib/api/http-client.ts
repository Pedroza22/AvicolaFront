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

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

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
        const error = await this.handleError(response)
        throw error
      }

      const data = await response.json()
      return data
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
      // Redirect to login or refresh token
      this.handleUnauthorized()
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

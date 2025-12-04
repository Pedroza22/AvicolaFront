import { httpClient } from "@/lib/api/http-client"
import { API_ENDPOINTS } from "@/lib/config/api.config"
import { secureStorage } from "@/lib/services/secure-storage.service"
import type { User } from "@/lib/types"

type LoginResponse = {
  access: string
  refresh?: string
  user_info?: any
}

export class AuthService {
  private static refreshTimeoutId: number | null = null

  static async login(identifier: string, password: string): Promise<{ access: string; refresh?: string; user?: User }> {
    // Send 'username' field to match backend TokenObtainPairView expectations.
    const payload = { username: identifier, password }
    const resp = await httpClient.post<LoginResponse>(API_ENDPOINTS.auth.login, payload)
    if (!resp?.success || !resp?.data) {
      throw new Error(resp?.message || "Credenciales inválidas")
    }

    const access = resp.data.access
    const refresh = resp.data.refresh
    const userInfo = resp.data.user_info

    // Usar almacenamiento seguro en lugar de localStorage
    if (access) {
      const tokenPayload = secureStorage.parseToken(access)
      const expiresIn = tokenPayload?.exp ? tokenPayload.exp - Math.floor(Date.now() / 1000) : 3600
      secureStorage.setAccessToken(access, expiresIn)
    }
    if (refresh) {
      secureStorage.setRefreshToken(refresh)
    }

    // schedule refresh
    if (access) this.scheduleRefresh(access)

    return { access, refresh, user: userInfo }
  }

  static async logout(): Promise<void> {
    try {
      await httpClient.post(API_ENDPOINTS.auth.logout)
    } catch (_) {
      // ignore network errors on logout
    }
    
    // Limpiar almacenamiento seguro
    secureStorage.clearAll()
    
    if (typeof window !== "undefined" && this.refreshTimeoutId) {
      window.clearTimeout(this.refreshTimeoutId)
      this.refreshTimeoutId = null
    }
  }

  static async me(): Promise<User> {
    const resp = await httpClient.get<User>(API_ENDPOINTS.auth.me)
    if (!resp?.success || !resp?.data) {
      throw new Error(resp?.message || "No se pudo obtener el usuario")
    }
    return resp.data
  }

  static async refresh(): Promise<{ access?: string; refresh?: string } | null> {
    if (typeof window === "undefined") return null
    
    const refreshToken = secureStorage.getRefreshToken()
    if (!refreshToken) return null

    try {
      const resp = await httpClient.post<{ access: string; refresh?: string }>(
        API_ENDPOINTS.auth.refresh,
        { refresh: refreshToken }
      )
      
      if (resp?.success && resp?.data) {
        const { access, refresh } = resp.data
        
        if (access) {
          const tokenPayload = secureStorage.parseToken(access)
          const expiresIn = tokenPayload?.exp ? tokenPayload.exp - Math.floor(Date.now() / 1000) : 3600
          secureStorage.setAccessToken(access, expiresIn)
          this.scheduleRefresh(access)
        }
        if (refresh) {
          secureStorage.setRefreshToken(refresh)
        }
        
        return { access, refresh }
      }
    } catch (_) {
      // refresh failed
    }
    
    // clear tokens on failure
    secureStorage.clearAll()
    return null
  }

  static async initialize(setUser: (u: User | null) => void): Promise<void> {
    if (typeof window === "undefined") return
    
    const token = secureStorage.getAccessToken()
    if (!token) {
      // Intentar con refresh token si existe
      const refreshToken = secureStorage.getRefreshToken()
      if (refreshToken) {
        const refreshed = await this.refresh()
        if (refreshed?.access) {
          try {
            const user = await this.me()
            setUser(user)
            return
          } catch (_) {
            setUser(null)
            return
          }
        }
      }
      setUser(null)
      return
    }
    
    try {
      const user = await this.me()
      setUser(user)
      this.scheduleRefresh(token)
    } catch (e) {
      // Try refresh once
      const refreshed = await this.refresh()
      if (refreshed?.access) {
        try {
          const user2 = await this.me()
          setUser(user2)
        } catch (_) {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    }
  }

  private static scheduleRefresh(accessToken: string): void {
    if (typeof window === "undefined") return
    
    if (this.refreshTimeoutId) {
      window.clearTimeout(this.refreshTimeoutId)
      this.refreshTimeoutId = null
    }

    try {
      const payload = secureStorage.parseToken(accessToken)
      const exp = payload?.exp as number | undefined
      if (!exp) return
      
      const expiresMs = exp * 1000
      const now = Date.now()
      // schedule refresh 60 seconds before expiry, but at least 5s from now
      const refreshAt = Math.max(now + 1000 * 5, expiresMs - 60 * 1000)
      const delay = Math.max(5000, refreshAt - now)
      
      this.refreshTimeoutId = window.setTimeout(async () => {
        await this.refresh()
      }, delay) as unknown as number
    } catch (e) {
      // ignore parse errors
    }
  }

  /**
   * Verifica si hay una sesión activa
   */
  static hasActiveSession(): boolean {
    return secureStorage.hasActiveSession()
  }

  /**
   * Obtiene el tiempo restante del token en segundos
   */
  static getTokenTimeRemaining(): number {
    return secureStorage.getTokenTimeRemaining()
  }
}
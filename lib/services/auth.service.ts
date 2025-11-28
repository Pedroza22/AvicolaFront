import { httpClient } from "@/lib/api/http-client"
import { API_ENDPOINTS } from "@/lib/config/api.config"
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
    // If your users sign in with email, ensure the username equals the email or
    // update backend to accept email-based login.
    const payload = { username: identifier, password }
    const resp = await httpClient.post<LoginResponse>(API_ENDPOINTS.auth.login, payload)
    if (!resp?.success || !resp?.data) {
      throw new Error(resp?.message || "Credenciales inválidas")
    }

    const access = resp.data.access
    const refresh = resp.data.refresh
    const userInfo = resp.data.user_info

    if (typeof window !== "undefined") {
      if (access) localStorage.setItem("auth_token", access)
      if (refresh) localStorage.setItem("refresh_token", refresh)
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
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("refresh_token")
      if (this.refreshTimeoutId) {
        window.clearTimeout(this.refreshTimeoutId)
        this.refreshTimeoutId = null
      }
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
    // Attempt to refresh access token using refresh token in localStorage
    if (typeof window === "undefined") return null
    const refreshToken = localStorage.getItem("refresh_token")
    if (!refreshToken) return null

    try {
      const resp = await httpClient.post<{ access: string; refresh?: string }>(API_ENDPOINTS.auth.refresh, { refresh: refreshToken })
        if (resp?.success && resp?.data) {
        const { access, refresh } = resp.data
        if (access) localStorage.setItem("auth_token", access)
        if (refresh) localStorage.setItem("refresh_token", refresh)
          if (access) this.scheduleRefresh(access)
        return { access, refresh }
      }
    } catch (_) {
      // refresh failed
    }
    // clear tokens on failure
    localStorage.removeItem("auth_token")
    localStorage.removeItem("refresh_token")
    return null
  }

  static async initialize(setUser: (u: User | null) => void): Promise<void> {
    // If there's an access token, try to load the user and schedule refresh
    if (typeof window === "undefined") return
    const token = localStorage.getItem("auth_token")
    if (!token) return
    try {
      const user = await this.me()
      setUser(user)
      // schedule refresh if we have a token
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
    // Clear existing
    if (typeof window === "undefined") return
    if (this.refreshTimeoutId) {
      window.clearTimeout(this.refreshTimeoutId)
      this.refreshTimeoutId = null
    }

    try {
      const parts = accessToken.split(".")
      if (parts.length !== 3) return
      const payloadJson = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
      const payload = JSON.parse(payloadJson)
      const exp = payload.exp as number | undefined
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

}
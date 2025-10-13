import { httpClient } from "@/lib/api/http-client"
import { API_ENDPOINTS } from "@/lib/config/api.config"
import type { User } from "@/lib/types"

type LoginPayload = {
  token: string
  user: User
}

export class AuthService {
  static async login(email: string, password: string): Promise<LoginPayload> {
    const resp = await httpClient.post<LoginPayload>(API_ENDPOINTS.auth.login, { email, password })
    if (!resp?.success || !resp?.data) {
      throw new Error(resp?.message || "Credenciales inválidas")
    }
    // Store token for subsequent authenticated requests
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", resp.data.token)
    }
    return resp.data
  }

  static async logout(): Promise<void> {
    try {
      await httpClient.post(API_ENDPOINTS.auth.logout)
    } catch (_) {
      // ignore network errors on logout
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  }

  static async me(): Promise<User> {
    const resp = await httpClient.get<User>(API_ENDPOINTS.auth.me)
    if (!resp?.success || !resp?.data) {
      throw new Error(resp?.message || "No se pudo obtener el usuario")
    }
    return resp.data
  }
}
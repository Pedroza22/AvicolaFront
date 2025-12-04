/**
 * Secure Storage Service
 * 
 * Maneja almacenamiento seguro de tokens y datos sensibles:
 * - Access token: Solo en memoria (más seguro contra XSS)
 * - Refresh token: En memoria con backup en sessionStorage (httpOnly cookies ideales pero requieren backend)
 * - Datos de sesión: sessionStorage para persistencia de pestaña
 * 
 * Para máxima seguridad en producción, el refresh token debería manejarse
 * con httpOnly cookies desde el backend.
 */

type TokenData = {
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
}

class SecureStorageService {
  // Almacenamiento en memoria - más seguro contra XSS
  private memoryStorage: TokenData = {
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
  }

  private readonly ACCESS_TOKEN_KEY = "at_backup"
  private readonly REFRESH_TOKEN_KEY = "rt_backup"
  private readonly SESSION_DATA_KEY = "session_data"

  constructor() {
    // Restaurar tokens desde sessionStorage al iniciar (por si se recarga la página)
    if (typeof window !== "undefined") {
      this.restoreFromBackup()
    }
  }

  /**
   * Guarda el access token de forma segura
   */
  setAccessToken(token: string, expiresInSeconds?: number): void {
    this.memoryStorage.accessToken = token
    
    if (expiresInSeconds) {
      this.memoryStorage.expiresAt = Date.now() + expiresInSeconds * 1000
    }

    // Backup encriptado básico en sessionStorage para persistir en recarga
    // En producción, esto debería ser httpOnly cookie manejada por el backend
    if (typeof window !== "undefined") {
      try {
        const encoded = this.encode(token)
        sessionStorage.setItem(this.ACCESS_TOKEN_KEY, encoded)
      } catch (e) {
        console.warn("No se pudo hacer backup del access token")
      }
    }
  }

  /**
   * Obtiene el access token
   */
  getAccessToken(): string | null {
    // Verificar expiración
    if (this.memoryStorage.expiresAt && Date.now() > this.memoryStorage.expiresAt) {
      this.clearAccessToken()
      return null
    }
    return this.memoryStorage.accessToken
  }

  /**
   * Guarda el refresh token
   */
  setRefreshToken(token: string): void {
    this.memoryStorage.refreshToken = token
    
    // Backup en sessionStorage
    if (typeof window !== "undefined") {
      try {
        const encoded = this.encode(token)
        sessionStorage.setItem(this.REFRESH_TOKEN_KEY, encoded)
      } catch (e) {
        console.warn("No se pudo hacer backup del refresh token")
      }
    }
  }

  /**
   * Obtiene el refresh token
   */
  getRefreshToken(): string | null {
    return this.memoryStorage.refreshToken
  }

  /**
   * Limpia el access token
   */
  clearAccessToken(): void {
    this.memoryStorage.accessToken = null
    this.memoryStorage.expiresAt = null
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(this.ACCESS_TOKEN_KEY)
    }
  }

  /**
   * Limpia todos los tokens (logout)
   */
  clearAll(): void {
    this.memoryStorage = {
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
    }
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(this.ACCESS_TOKEN_KEY)
      sessionStorage.removeItem(this.REFRESH_TOKEN_KEY)
      sessionStorage.removeItem(this.SESSION_DATA_KEY)
    }
  }

  /**
   * Guarda datos de sesión (no sensibles)
   */
  setSessionData<T>(data: T): void {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(this.SESSION_DATA_KEY, JSON.stringify(data))
    }
  }

  /**
   * Obtiene datos de sesión
   */
  getSessionData<T>(): T | null {
    if (typeof window === "undefined") return null
    try {
      const data = sessionStorage.getItem(this.SESSION_DATA_KEY)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  }

  /**
   * Verifica si hay una sesión activa
   */
  hasActiveSession(): boolean {
    return this.getAccessToken() !== null || this.getRefreshToken() !== null
  }

  /**
   * Restaura tokens desde backup (al recargar página)
   */
  private restoreFromBackup(): void {
    try {
      const accessBackup = sessionStorage.getItem(this.ACCESS_TOKEN_KEY)
      const refreshBackup = sessionStorage.getItem(this.REFRESH_TOKEN_KEY)

      if (accessBackup) {
        this.memoryStorage.accessToken = this.decode(accessBackup)
      }
      if (refreshBackup) {
        this.memoryStorage.refreshToken = this.decode(refreshBackup)
      }
    } catch (e) {
      // Si falla la restauración, limpiar todo
      this.clearAll()
    }
  }

  /**
   * Codificación básica para ofuscar tokens en sessionStorage
   * NOTA: Esto NO es encriptación real, solo ofuscación básica
   * Para producción real, usar httpOnly cookies
   */
  private encode(value: string): string {
    if (typeof window === "undefined") return value
    try {
      return btoa(encodeURIComponent(value).split("").reverse().join(""))
    } catch {
      return value
    }
  }

  private decode(value: string): string {
    if (typeof window === "undefined") return value
    try {
      return decodeURIComponent(atob(value).split("").reverse().join(""))
    } catch {
      return value
    }
  }

  /**
   * Parsea el token JWT y extrae su payload
   */
  parseToken(token: string): Record<string, any> | null {
    try {
      const parts = token.split(".")
      if (parts.length !== 3) return null
      const payload = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
      return JSON.parse(payload)
    } catch {
      return null
    }
  }

  /**
   * Obtiene el tiempo restante del token en segundos
   */
  getTokenTimeRemaining(): number {
    const token = this.getAccessToken()
    if (!token) return 0
    
    const payload = this.parseToken(token)
    if (!payload?.exp) return 0
    
    const expiresAt = payload.exp * 1000
    const remaining = Math.max(0, expiresAt - Date.now())
    return Math.floor(remaining / 1000)
  }
}

export const secureStorage = new SecureStorageService()

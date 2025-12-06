"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AuthService } from "@/lib/services/auth.service"
import { secureStorage } from "@/lib/services/secure-storage.service"
import { useAppState } from "@/lib/hooks/use-app-state"

/**
 * Página de debug para verificar el estado de autenticación
 * Solo para desarrollo - eliminar en producción
 */
export default function AuthDebugPage() {
  const user = useAppState((s) => s.user)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [hasSession, setHasSession] = useState(false)
  const [cookies, setCookies] = useState<string>("")
  const [sessionData, setSessionData] = useState<any>(null)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = () => {
    setAccessToken(secureStorage.getAccessToken())
    setRefreshToken(secureStorage.getRefreshToken())
    setHasSession(AuthService.hasActiveSession())
    setCookies(typeof document !== "undefined" ? document.cookie : "")
    setSessionData(secureStorage.getSessionData())
  }

  const testLogin = async () => {
    try {
      console.log("🔐 Iniciando login...")
      const result = await AuthService.login("admin", "admin123")
      console.log("✅ Login exitoso:", result)
      
      // Verificar que los tokens se guardaron
      const accessToken = secureStorage.getAccessToken()
      const refreshToken = secureStorage.getRefreshToken()
      console.log("📦 Access token guardado:", accessToken ? "SÍ" : "NO")
      console.log("📦 Refresh token guardado:", refreshToken ? "SÍ" : "NO")
      
      checkAuthStatus()
      alert("Login exitoso - Revisa la consola para detalles")
    } catch (e: any) {
      console.error("❌ Error en login:", e)
      alert(`Error: ${e.message}`)
    }
  }

  const testLogout = async () => {
    await AuthService.logout()
    checkAuthStatus()
    alert("Logout exitoso")
  }

  const testMe = async () => {
    try {
      console.log("👤 Llamando a /api/auth/me/...")
      const accessToken = secureStorage.getAccessToken()
      console.log("📝 Token a enviar:", accessToken ? accessToken.substring(0, 20) + "..." : "NO HAY TOKEN")
      
      const user = await AuthService.me()
      console.log("✅ Usuario obtenido:", user)
      alert(`Usuario: ${JSON.stringify(user, null, 2)}`)
    } catch (e: any) {
      console.error("❌ Error en me():", e)
      alert(`Error: ${e.message}`)
    }
  }

  const testApiCall = async () => {
    try {
      console.log("🌐 Haciendo llamada de prueba a /api/flocks/...")
      const token = secureStorage.getAccessToken()
      console.log("📝 Token disponible:", token ? "SÍ" : "NO")
      
      const response = await fetch("http://127.0.0.1:8000/api/flocks/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
      })
      
      console.log("📊 Status:", response.status)
      const data = await response.json()
      console.log("📦 Respuesta:", data)
      
      if (response.ok) {
        alert(`✅ API Call exitosa! Lotes encontrados: ${data.length || 0}`)
      } else {
        alert(`❌ Error ${response.status}: ${JSON.stringify(data)}`)
      }
    } catch (e: any) {
      console.error("❌ Error en API call:", e)
      alert(`Error: ${e.message}`)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔐 Auth Debug Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={testLogin}>Test Login</Button>
            <Button onClick={testLogout} variant="destructive">
              Test Logout
            </Button>
            <Button onClick={testMe} variant="outline">
              Test Me
            </Button>
            <Button onClick={testApiCall} variant="outline">
              Test API Call
            </Button>
            <Button onClick={checkAuthStatus} variant="outline" className="col-span-2">
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estado de Autenticación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Sesión Activa:</span>
            <Badge variant={hasSession ? "default" : "destructive"}>
              {hasSession ? "SÍ" : "NO"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Usuario Cargado:</span>
            <Badge variant={user ? "default" : "secondary"}>
              {user ? user.username : "NO"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Access Token:</span>
            <Badge variant={accessToken ? "default" : "secondary"}>
              {accessToken ? "PRESENTE" : "AUSENTE"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Refresh Token:</span>
            <Badge variant={refreshToken ? "default" : "secondary"}>
              {refreshToken ? "PRESENTE" : "AUSENTE"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cookies del Navegador</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {cookies || "Sin cookies"}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Access Token Decodificado</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {accessToken
              ? JSON.stringify(secureStorage.parseToken(accessToken), null, 2)
              : "No hay token"}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuario en Store</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {user ? JSON.stringify(user, null, 2) : "No hay usuario"}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {sessionData ? JSON.stringify(sessionData, null, 2) : "No hay datos"}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert } from "@/components/ui/alert"
import { USER_ROLES } from "@/lib/constants"
import { AuthService } from "@/lib/services/auth.service"
import { useAppState } from "@/lib/hooks/use-app-state"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser, setSelectedRole } = useAppState()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Obtener la URL de retorno
  const from = searchParams.get('from') || '/'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      
      const { access, refresh, user } = await AuthService.login(username, password)
      
      // Cargar información del usuario si no viene en el login
      if (!user) {
        const userData = await AuthService.me()
        setUser(userData)
        const roleValue = typeof userData.role === 'object' && userData.role?.name 
          ? userData.role.name.toLowerCase().replace(' ', '-')
          : userData.rol || USER_ROLES.ADMIN_EMPRESA
        setSelectedRole(roleValue)
      } else {
        setUser(user)
        const roleValue = typeof user.role === 'object' && user.role?.name
          ? user.role.name.toLowerCase().replace(' ', '-')
          : user.rol || USER_ROLES.ADMIN_EMPRESA
        setSelectedRole(roleValue)
      }
      
      // Redirigir a la página original o al dashboard
      router.push(from)
    } catch (err: any) {
      setError(err?.message || "Credenciales inválidas. Por favor intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ingresar al Sistema</CardTitle>
              <CardDescription>Control Avícola • Ingresa tus credenciales</CardDescription>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              v1.0
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input 
                id="username" 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="admin"
                required 
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <p className="text-sm">{error}</p>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-800 font-medium mb-1">Credenciales de prueba:</p>
              <p className="text-xs text-blue-700">Usuario: <code className="bg-blue-100 px-1 rounded">admin</code></p>
              <p className="text-xs text-blue-700">Contraseña: <code className="bg-blue-100 px-1 rounded">admin123</code></p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
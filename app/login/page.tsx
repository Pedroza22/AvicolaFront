"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { USER_ROLES } from "@/lib/constants"
import { AuthService } from "@/lib/services/auth.service"
import { useAppState } from "@/lib/hooks/use-app-state"

export default function LoginPage() {
  const router = useRouter()
  const { setUser, setSelectedRole } = useAppState()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      const { access, refresh, user } = await AuthService.login(email, password)
      // El servicio ya guarda los tokens en localStorage; setea estado de app
      if (user) {
        setUser(user)
        // user may have role under different key, try both
        setSelectedRole((user as any).role || (user as any).rol)
      }
      router.push("/")
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
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
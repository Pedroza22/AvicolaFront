"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppState } from "@/lib/hooks/use-app-state"
import { userRepository } from "@/lib/repositories/user.repository"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, Lock, Bell, Shield } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const router = useRouter()
  const { user, setUser } = useAppState()
  
  // Profile form
  const [username, setUsername] = useState(user?.username || "")
  const [email, setEmail] = useState(user?.email || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [identification, setIdentification] = useState(user?.identification || "")
  
  // Password form
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  const [loading, setLoading] = useState(false)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id) {
      toast.error("No se pudo identificar el usuario")
      return
    }

    setLoading(true)
    try {
      const payload: any = {}
      
      if (username !== user.username) payload.username = username
      if (email !== user.email) payload.email = email
      if (phone !== user.phone) payload.phone = phone
      
      if (Object.keys(payload).length === 0) {
        toast.info("No hay cambios para guardar")
        setLoading(false)
        return
      }

      const updated = await userRepository.update(String(user.id), payload)
      setUser({ ...user, ...updated })
      toast.success("Perfil actualizado correctamente")
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast.error(error?.response?.data?.detail || error?.message || "Error al actualizar el perfil")
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id) {
      toast.error("No se pudo identificar el usuario")
      return
    }

    if (!currentPassword) {
      toast.error("Ingrese su contraseña actual")
      return
    }

    if (newPassword.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    setLoading(true)
    try {
      const passwordPayload: any = {
        password: newPassword,
        current_password: currentPassword,
      }
      await userRepository.update(String(user.id), passwordPayload)
      
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success("Contraseña actualizada correctamente")
    } catch (error: any) {
      console.error("Error changing password:", error)
      toast.error(error?.response?.data?.detail || error?.message || "Error al cambiar la contraseña")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Configuración de Cuenta</h1>
            <p className="text-muted-foreground">Administra tu perfil y preferencias</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4 mr-2" />
              Seguridad
            </TabsTrigger>
            <TabsTrigger value="notifications" disabled>
              <Bell className="h-4 w-4 mr-2" />
              Notificaciones
            </TabsTrigger>
            <TabsTrigger value="privacy" disabled>
              <Shield className="h-4 w-4 mr-2" />
              Privacidad
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Información del Perfil</CardTitle>
                <CardDescription>
                  Actualiza tu información personal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username">Nombre de Usuario</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="identification">Identificación</Label>
                      <Input
                        id="identification"
                        value={identification}
                        disabled
                        className="bg-gray-100"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        La identificación no se puede modificar
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={loading}
                        placeholder="+57 300 123 4567"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Rol</Label>
                    <div className="px-3 py-2 bg-gray-100 rounded-md text-sm">
                      {user.role?.name || user.rol || "Sin rol asignado"}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Cambiar Contraseña</CardTitle>
                <CardDescription>
                  Actualiza tu contraseña regularmente para mantener tu cuenta segura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Contraseña Actual</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={loading}
                      placeholder="Ingresa tu contraseña actual"
                    />
                  </div>

                  <div>
                    <Label htmlFor="newPassword">Nueva Contraseña</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={loading}
                      placeholder="Mínimo 8 caracteres"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Debe contener al menos 8 caracteres, mayúsculas, minúsculas y números
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      placeholder="Confirma tu nueva contraseña"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => {
                      setCurrentPassword("")
                      setNewPassword("")
                      setConfirmPassword("")
                    }}>
                      Limpiar
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Actualizando..." : "Cambiar Contraseña"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Sesiones Activas</CardTitle>
                <CardDescription>
                  Administra tus sesiones activas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div>
                    <p className="font-medium">Sesión Actual</p>
                    <p className="text-sm text-muted-foreground">
                      Última actividad: Ahora
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Activa</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Preferencias de Notificaciones</CardTitle>
                <CardDescription>
                  Próximamente disponible
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Privacidad</CardTitle>
                <CardDescription>
                  Próximamente disponible
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

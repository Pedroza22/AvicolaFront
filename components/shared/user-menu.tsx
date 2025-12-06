"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import { AuthService } from "@/lib/services/auth.service"
import { useAppState } from "@/lib/hooks/use-app-state"

export function UserMenu() {
  const router = useRouter()
  const { user, setUser } = useAppState()

  const handleLogout = async () => {
    try {
      await AuthService.logout()
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      // Incluso si hay error, limpiamos el estado
      setUser(null)
      router.push('/login')
    }
  }

  if (!user) return null

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-md">
        <User className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {user.username || user.email?.split('@')[0] || 'Usuario'}
        </span>
      </div>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleLogout}
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
        Salir
      </Button>
    </div>
  )
}

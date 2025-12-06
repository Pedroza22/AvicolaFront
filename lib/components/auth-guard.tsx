"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAppState } from "@/lib/hooks/use-app-state"
import { AuthService } from "@/lib/services/auth.service"

/**
 * Componente para proteger rutas que requieren autenticación
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAppState((s) => s.user)
  const setUser = useAppState((s) => s.setUser)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Si estamos en el login, no verificar nada
    if (pathname === "/login") {
      setIsChecking(false)
      return
    }

    // Si ya tenemos usuario cargado, no hacer nada
    if (user) {
      setIsChecking(false)
      return
    }

    // Intentar cargar usuario si hay tokens
    const hasSession = AuthService.hasActiveSession()
    
    if (!hasSession) {
      // No hay tokens, redirigir al login
      router.push(`/login?from=${encodeURIComponent(pathname)}`)
      return
    }

    // Hay tokens, intentar cargar usuario
    AuthService.me()
      .then((userData) => {
        setUser(userData)
        setIsChecking(false)
      })
      .catch(() => {
        // Token inválido, redirigir al login
        router.push(`/login?from=${encodeURIComponent(pathname)}`)
      })
  }, [pathname, user, router, setUser])

  // Si no hay usuario y no estamos en login, mostrar loading
  if (isChecking || (!user && pathname !== "/login")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

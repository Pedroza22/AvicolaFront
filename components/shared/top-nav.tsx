"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useAppState } from "@/lib/hooks/use-app-state"
import { USER_ROLES } from "@/lib/constants"

const BASE_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/reportes", label: "Reportes" },
  { href: "/prediccion", label: "Predicción" },
  { href: "/inventario", label: "Inventario" },
  { href: "/crecimiento", label: "Crecimiento" },
]

function getNavItems(selectedRole: string) {
  const items = [...BASE_ITEMS]
  // Cámaras solo visible para Admin Empresa y Admin Granja
  if (selectedRole !== USER_ROLES.VETERINARIO && selectedRole !== USER_ROLES.GALPONERO) {
    items.splice(1, 0, { href: "/camaras", label: "Cámaras" }) // insert after Dashboard
  }
  if (selectedRole === USER_ROLES.GALPONERO) {
    items.push({ href: "/formularios", label: "Formularios" })
  }
  if (selectedRole === USER_ROLES.ADMIN_GRANJA) {
    items.push({ href: "/pedidos", label: "Pedidos" })
  }
  return items
}

export function TopNav() {
  const pathname = usePathname()
  const { selectedRole } = useAppState()
  const navItems = getNavItems(selectedRole)

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2 sticky top-0 z-20">
      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <Button variant={isActive ? "default" : "outline"} size="sm">
                {item.label}
              </Button>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
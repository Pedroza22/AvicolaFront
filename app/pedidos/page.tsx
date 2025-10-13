"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Settings } from "lucide-react"
import { RoleSelector } from "@/components/shared/role-selector"
import { FarmSelector } from "@/components/shared/farm-selector"
import { useAppState } from "@/lib/hooks/use-app-state"
import { USER_ROLES } from "@/lib/constants"
import { PedidosSistema } from "@/components/orders/pedidos-sistema"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNav } from "@/components/shared/top-nav"

export default function OrdersPage() {
  const { selectedFarm, selectedShed, selectedLote, selectedRole, setSelectedFarm, setSelectedShed, setSelectedLote, setSelectedRole } = useAppState()

  const isAllowed = selectedRole === USER_ROLES.ADMIN_GRANJA

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Sistema de Control Avícola</h1>
            <Badge variant="outline" className="bg-green-50 text-green-700">En línea</Badge>
          </div>
          <div className="flex items-center space-x-4">
            <RoleSelector selectedRole={selectedRole} onRoleChange={setSelectedRole} />
            <Button variant="outline" size="icon" onClick={() => alert("Notificaciones en desarrollo")}> <Bell className="h-4 w-4" /> </Button>
            <Button variant="outline" size="icon" onClick={() => alert("Ajustes en desarrollo")}> <Settings className="h-4 w-4" /> </Button>
          </div>
        </div>
      </header>
      <TopNav />

      <div className="flex">
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
          <FarmSelector
            selectedFarm={selectedFarm}
            selectedShed={selectedShed}
            selectedLote={selectedLote}
            onFarmChange={setSelectedFarm}
            onShedChange={setSelectedShed}
            onLoteChange={setSelectedLote}
          />
        </aside>
        <main className="flex-1 p-6">
          {isAllowed ? (
            <PedidosSistema />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Acceso restringido</CardTitle>
              </CardHeader>
              <CardContent>
                Debes tener rol "Admin Granja" para acceder a Pedidos.
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}
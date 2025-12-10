"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { GrowthChart } from "@/components/charts/growth-chart"
import { MortalityChart } from "@/components/charts/mortality-chart"
import { FarmSelector } from "@/components/shared/farm-selector"
import { InventoryAlerts } from "@/components/inventory/inventory-alerts"
import { ReportsSection } from "@/components/reports/reports-section"
import { PredictionForm } from "@/components/forms/prediction-form"
import { RoleSelector } from "@/components/shared/role-selector"
import { GalponeroForms } from "@/components/forms/galponero-forms"
import { PedidosSistema } from "@/components/orders/pedidos-sistema"
import { ConnectionStatus } from "@/components/shared/connection-status"
import { UserMenu } from "@/components/shared/user-menu"
import { NotificationsModal } from "@/components/shared/notifications-modal"
import { useAppState } from "@/lib/hooks/use-app-state"
import { USER_ROLES } from "@/lib/constants"

export default function Dashboard() {
  const {
    selectedFarm,
    selectedShed,
    selectedLote,
    selectedRole,
    setSelectedFarm,
    setSelectedShed,
    setSelectedLote,
    setSelectedRole,
  } = useAppState()

  const getTabsCount = () => {
    let count = 5 // dashboard, crecimiento, inventario, reportes, predicción
    if (selectedRole === USER_ROLES.GALPONERO) count += 1 // formularios
    if (selectedRole === USER_ROLES.ADMIN_GRANJA) count += 1 // pedidos
    return count
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Sistema de Control Avícola</h1>
            <ConnectionStatus />
          </div>
          <div className="flex items-center space-x-4">
            <RoleSelector selectedRole={selectedRole} onRoleChange={setSelectedRole} />
            <NotificationsModal />
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
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

        {/* Main Content */}
        <main className="flex-1 p-6">
          <InventoryAlerts />

          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className={`grid w-full`} style={{ gridTemplateColumns: `repeat(${getTabsCount()}, minmax(0, 1fr))` }}>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="crecimiento">Crecimiento</TabsTrigger>
              <TabsTrigger value="inventario">Inventario</TabsTrigger>
              {/* Cameras removed */}
              <TabsTrigger value="reportes">Reportes</TabsTrigger>
              <TabsTrigger value="prediccion">Predicción</TabsTrigger>
              {selectedRole === USER_ROLES.GALPONERO && <TabsTrigger value="formularios">Formularios</TabsTrigger>}
              {selectedRole === USER_ROLES.ADMIN_GRANJA && <TabsTrigger value="pedidos">Pedidos</TabsTrigger>}
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <DashboardStats selectedFarm={selectedFarm} selectedShed={selectedShed} selectedLote={selectedLote} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GrowthChart />
                <MortalityChart flockId={selectedLote} />
              </div>
            </TabsContent>

            <TabsContent value="crecimiento" className="space-y-6">
              <GrowthChart detailed />
            </TabsContent>

            <TabsContent value="inventario" className="space-y-6">
              <div className="text-center py-8 text-muted-foreground">Sección de inventario en desarrollo</div>
            </TabsContent>

            {/* Cameras removed */}

            <TabsContent value="reportes" className="space-y-6">
              <ReportsSection />
            </TabsContent>

            <TabsContent value="prediccion" className="space-y-6">
              <PredictionForm />
            </TabsContent>

            {selectedRole === USER_ROLES.GALPONERO && (
              <TabsContent value="formularios" className="space-y-6">
                <GalponeroForms />
              </TabsContent>
            )}

            {selectedRole === USER_ROLES.ADMIN_GRANJA && (
              <TabsContent value="pedidos" className="space-y-6">
                <PedidosSistema />
              </TabsContent>
            )}
          </Tabs>
        </main>
      </div>
    </div>
  )
}

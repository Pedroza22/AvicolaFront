"use client"

import React, { useEffect, useState } from "react"
import { useAppState } from "@/lib/hooks/use-app-state"
import { farmRepository } from "@/lib/repositories/farm.repository"
import { shedRepository } from "@/lib/repositories/shed.repository"
import { loteRepository } from "@/lib/repositories/lote.repository"
import { inventoryRepository } from "@/lib/repositories/inventory.repository"
import { InventoryAlerts } from "@/components/inventory/inventory-alerts"
import ShedTable from "@/components/admin/shed-table"
import InventoryOverview from "@/components/admin/inventory-overview"
import VetSchedules from "@/components/admin/vet-schedules"
import { NotificationsModal } from "@/components/shared/notifications-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Warehouse, Users, AlertTriangle } from "lucide-react"
import type { Farm, Shed, Lote, StockAlertsResponse } from "@/lib/types"

export default function AdminPage() {
  const { user, selectedRole, setSelectedFarm, selectedFarm } = useAppState()
  const [farms, setFarms] = useState<Farm[]>([])
  const [sheds, setSheds] = useState<Shed[]>([])
  const [lotes, setLotes] = useState<Lote[]>([])
  const [stockAlerts, setStockAlerts] = useState<StockAlertsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'dashboard'|'farms'|'sheds'|'inventory'|'notifications'|'schedules'>('dashboard')

  const loadFarms = async () => {
    try {
      const data = await farmRepository.getAll()
      setFarms(data)
      if (!selectedFarm && data.length) setSelectedFarm(String(data[0].id))
    } catch (e) { 
      console.error("Error loading farms:", e)
      setFarms([]) 
    }
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [farmsData, shedsData, lotesData, alertsData] = await Promise.all([
        farmRepository.getAll().catch(() => []),
        shedRepository.getAll().catch(() => []),
        loteRepository.getActive().catch(() => []),
        inventoryRepository.getStockAlerts().catch(() => null)
      ])
      
      setFarms(farmsData)
      setSheds(shedsData)
      setLotes(lotesData)
      setStockAlerts(alertsData)
      
      if (!selectedFarm && farmsData.length) {
        setSelectedFarm(String(farmsData[0].id))
      }
    } catch (e) {
      console.error("Error loading dashboard data:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    loadDashboardData()
  }, [])

  // Determine visibility by role
  const role = user?.rol || selectedRole
  const canViewAll = role === 'admin-empresa' || role === 'admin-granja'

  // Calculate stats
  const totalAlerts = stockAlerts 
    ? (stockAlerts.alerts?.critical?.length || 0) + 
      (stockAlerts.alerts?.low?.length || 0) + 
      (stockAlerts.alerts?.out_of_stock?.length || 0)
    : 0
  
  const activeLotesCount = lotes.filter(l => 
    l.status === 'ACTIVE' || l.status === 'activo' || !l.status
  ).length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Panel Administrativo</h1>
        <NotificationsModal />
      </div>

      <div className="flex gap-2 flex-wrap">
        <button className={`px-3 py-1 rounded ${activeTab==='dashboard' ? 'bg-primary text-white' : 'bg-muted'}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
        <button className={`px-3 py-1 rounded ${activeTab==='farms' ? 'bg-primary text-white' : 'bg-muted'}`} onClick={() => setActiveTab('farms')}>Granjas</button>
        <button className={`px-3 py-1 rounded ${activeTab==='sheds' ? 'bg-primary text-white' : 'bg-muted'}`} onClick={() => setActiveTab('sheds')}>Galpones</button>
        <button className={`px-3 py-1 rounded ${activeTab==='inventory' ? 'bg-primary text-white' : 'bg-muted'}`} onClick={() => setActiveTab('inventory')}>Inventario</button>
        <button className={`px-3 py-1 rounded ${activeTab==='schedules' ? 'bg-primary text-white' : 'bg-muted'}`} onClick={() => setActiveTab('schedules')}>Horarios</button>
        <button className={`px-3 py-1 rounded ${activeTab==='notifications' ? 'bg-primary text-white' : 'bg-muted'}`} onClick={() => setActiveTab('notifications')}>Notificaciones</button>
      </div>

      <div>
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {loading ? (
              <div className="grid md:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Granjas</CardTitle>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{farms.length}</div>
                      <p className="text-xs text-muted-foreground">
                        {farms.filter(f => f.status === 'activa').length} activas
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Galpones</CardTitle>
                      <Warehouse className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{sheds.length}</div>
                      <p className="text-xs text-muted-foreground">
                        {sheds.reduce((sum, shed) => sum + (shed.current || 0), 0).toLocaleString()} pollos totales
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Lotes Activos</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{activeLotesCount}</div>
                      <p className="text-xs text-muted-foreground">
                        de {lotes.length} lotes totales
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Alertas Inventario</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{totalAlerts}</div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-red-600">{stockAlerts?.alerts?.critical?.length || 0} críticas</span>
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Granjas Recientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {farms.slice(0, 5).map((f) => (
                          <div key={f.id} className="flex justify-between items-center p-2 border rounded-md">
                            <div>
                              <div className="font-medium">{f.name}</div>
                              <div className="text-sm text-muted-foreground">{f.sheds || 0} galpones</div>
                            </div>
                            <div className={`text-xs px-2 py-1 rounded ${
                              f.status === 'activa' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {f.status}
                            </div>
                          </div>
                        ))}
                        {farms.length === 0 && (
                          <p className="text-sm text-muted-foreground">No hay granjas registradas</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Alertas de Inventario</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <InventoryAlerts />
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'farms' && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Listado de Granjas</h3>
              <div className="space-y-2">
                {farms.map((f) => (
                  <div key={f.id} className="p-3 border rounded-md">
                    <div className="font-medium">{f.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {f.sheds || 0} galpones - {f.status}
                    </div>
                  </div>
                ))}
                {farms.length === 0 && (
                  <p className="text-sm text-muted-foreground">No hay granjas registradas</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Alertas de inventario</h3>
              <InventoryAlerts />
            </div>
          </div>
        )}

        {activeTab === 'sheds' && (
          <div>
            <div className="mb-3">
              <label className="text-sm">Filtrar por granja</label>
              <select className="ml-2" value={selectedFarm ?? ''} onChange={(e) => setSelectedFarm(e.target.value)}>
                <option value="">Todas</option>
                {farms.map((f) => <option key={f.id} value={String(f.id)}>{f.name}</option>)}
              </select>
            </div>
            <ShedTable farmId={selectedFarm} />
          </div>
        )}

        {activeTab === 'inventory' && (
          <div>
            <div className="mb-3">
              <label className="text-sm">Filtrar por granja</label>
              <select className="ml-2" value={selectedFarm ?? ''} onChange={(e) => setSelectedFarm(e.target.value)}>
                <option value="">Todas</option>
                {farms.map((f) => <option key={f.id} value={String(f.id)}>{f.name}</option>)}
              </select>
            </div>
            <InventoryOverview farmId={selectedFarm} />
          </div>
        )}

        {activeTab === 'schedules' && (
          <div>
            <div className="mb-3">
              <label className="text-sm">Filtrar por granja</label>
              <select className="ml-2" value={selectedFarm ?? ''} onChange={(e) => setSelectedFarm(e.target.value)}>
                <option value="">Todas</option>
                {farms.map((f) => <option key={f.id} value={String(f.id)}>{f.name}</option>)}
              </select>
            </div>
            <VetSchedules farmId={selectedFarm} />
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <NotificationsModal />
          </div>
        )}
      </div>
    </div>
  )
}

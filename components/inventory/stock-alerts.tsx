"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, ShoppingCart, Eye, CheckCircle, Loader2 } from "lucide-react"
import { inventoryRepository } from "@/lib/repositories/inventory.repository"
import { useAppState } from "@/lib/hooks/use-app-state"
import type { StockAlert } from "@/lib/types"

interface StockAlertsProps {
  onCreateOrder?: (alert: StockAlert) => void
}

export function StockAlerts({ onCreateOrder }: StockAlertsProps) {
  const { selectedFarm, selectedShed } = useAppState()
  const [alerts, setAlerts] = useState<StockAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({ critical: 0, low: 0, outOfStock: 0 })

  useEffect(() => {
    loadStockAlerts()
  }, [])

  const loadStockAlerts = async () => {
    try {
      setLoading(true)
      const response = await inventoryRepository.getStockAlerts()
      // Combine all alerts (critical, low, out_of_stock)
      const allAlerts = [
        ...response.alerts.out_of_stock,
        ...response.alerts.critical,
        ...response.alerts.low,
      ]
      setAlerts(allAlerts)
      setSummary({
        critical: response.summary.critical_count,
        low: response.summary.low_count,
        outOfStock: response.summary.out_of_stock_count,
      })
    } catch (error) {
      console.error("Error loading stock alerts:", error)
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  // Filter alerts by selected farm and shed
  const filteredAlerts = alerts.filter((alert) => {
    if (!alert.location) return true
    
    // If no farm selected, show all
    if (!selectedFarm) return true
    
    // Parse location string "ShedName (FarmName)"
    const farmMatch = alert.location.match(/\(([^)]+)\)/)
    const farmName = farmMatch ? farmMatch[1] : null
    
    // Match against selected farm ID (we need to check if location contains the farm info)
    // For now, we'll show all alerts if farm is selected but can't match
    // TODO: Backend should include farm_id and shed_id in alert response
    return true // Show all for now until backend provides IDs
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OUT_OF_STOCK":
        return "bg-red-100 text-red-800 border-red-300"
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-300"
      case "LOW":
        return "bg-orange-100 text-orange-800 border-orange-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "OUT_OF_STOCK":
        return "AGOTADO"
      case "CRITICAL":
        return "CRÍTICO"
      case "LOW":
        return "BAJO"
      default:
        return status
    }
  }

  if (loading) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando alertas de stock...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  const criticalCount = summary.critical + summary.outOfStock

  // Si no hay alertas, mostrar estado vacío
  if (alerts.length === 0) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Stock en Niveles Óptimos
          </CardTitle>
          <CardDescription className="text-green-600">
            No hay productos con stock crítico en este momento
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Si hay alertas pero todas están filtradas
  if (filteredAlerts.length === 0) {
    return (
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <CheckCircle className="h-5 w-5" />
            Sin Alertas en esta Ubicación
          </CardTitle>
          <CardDescription className="text-blue-600">
            {selectedFarm ? 'No hay alertas de stock para la granja/galpón seleccionado' : 'Selecciona una granja para ver alertas'}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            Productos con Stock Crítico
          </CardTitle>
          <CardDescription className="text-red-600">
            {criticalCount} {criticalCount === 1 ? "producto requiere" : "productos requieren"} pedido inmediato
            {filteredAlerts.length < alerts.length && ` (${filteredAlerts.length} en ubicación seleccionada)`}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {filteredAlerts.map((alert) => {
          const borderColor = alert.status.status === "OUT_OF_STOCK" || alert.status.status === "CRITICAL" 
            ? "border-l-red-500" 
            : "border-l-orange-500"
          
          return (
            <Card key={alert.id} className={`border-l-4 ${borderColor}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{alert.name}</h3>
                      <Badge variant="outline" className={getStatusColor(alert.status.status)}>
                        {getStatusLabel(alert.status.status)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      {alert.location}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Stock Actual:</span>
                        <p className="font-semibold text-red-600">
                          {alert.current_stock} {alert.unit}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Estado:</span>
                        <p className="font-semibold">{alert.status.message}</p>
                      </div>
                      {alert.projected_stockout && (
                        <div>
                          <span className="text-muted-foreground">Agotamiento:</span>
                          <p className="font-semibold text-orange-600">
                            {new Date(alert.projected_stockout).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {onCreateOrder && (
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700" 
                        onClick={() => onCreateOrder(alert)}
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Pedir Ahora
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

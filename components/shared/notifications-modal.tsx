"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, X, AlertTriangle, ShoppingCart } from "lucide-react"
import { inventoryRepository } from "@/lib/repositories/inventory.repository"
import type { StockAlert } from "@/lib/types"

export function NotificationsModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [alerts, setAlerts] = useState<StockAlert[]>([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Load alert count on mount
    loadAlertCount()
    
    // Refresh every 5 minutes
    const interval = setInterval(loadAlertCount, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadAlertCount = async () => {
    try {
      const response = await inventoryRepository.getStockAlerts()
      const count = response.summary.critical_count + response.summary.out_of_stock_count
      setUnreadCount(count)
    } catch (error) {
      console.error("Error loading alert count:", error)
    }
  }

  const loadAlerts = async () => {
    try {
      setLoading(true)
      const response = await inventoryRepository.getStockAlerts()
      const allAlerts = [
        ...response.alerts.out_of_stock,
        ...response.alerts.critical,
        ...response.alerts.low,
      ]
      setAlerts(allAlerts)
    } catch (error) {
      console.error("Error loading alerts:", error)
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = () => {
    setIsOpen(true)
    loadAlerts()
  }

  const handleClose = () => {
    setIsOpen(false)
  }

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

  return (
    <>
      {/* Botón de notificaciones */}
      <div className="relative">
        <Button variant="outline" size="icon" onClick={handleOpen}>
          <Bell className="h-4 w-4" />
        </Button>
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </div>

      {/* Modal overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end p-4"
          onClick={handleClose}
        >
          {/* Panel deslizable desde la derecha */}
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in slide-in-from-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h2 className="text-lg font-semibold">Alertas de Stock</h2>
                <Badge variant="outline" className="bg-red-100 text-red-800">
                  {alerts.length} alertas
                </Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No hay alertas de stock en este momento</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => {
                    const borderColor = alert.status.status === "OUT_OF_STOCK" || alert.status.status === "CRITICAL" 
                      ? "border-l-red-500" 
                      : "border-l-orange-500"
                    
                    return (
                      <Card key={alert.id} className={`border-l-4 ${borderColor}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{alert.name}</h3>
                                <Badge variant="outline" className={getStatusColor(alert.status.status)}>
                                  {getStatusLabel(alert.status.status)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {alert.location}
                              </p>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Stock:</span>
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
                            <Button 
                              size="sm" 
                              className="bg-blue-600 hover:bg-blue-700 shrink-0"
                              onClick={() => {
                                // Navigate to orders or inventory
                                window.location.href = '/pedidos'
                              }}
                            >
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              Pedir
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

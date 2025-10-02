"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, ShoppingCart, Eye } from "lucide-react"
import { STATUS_COLORS } from "@/lib/constants"
import type { StockAlert } from "@/lib/types"

interface StockAlertsProps {
  alerts: StockAlert[]
  onCreateOrder: (alert: StockAlert) => void
}

export function StockAlerts({ alerts, onCreateOrder }: StockAlertsProps) {
  const getUrgenciaColor = (urgencia: string) => {
    switch (urgencia) {
      case "critica":
        return STATUS_COLORS.error
      case "alta":
        return STATUS_COLORS.warning
      case "media":
        return STATUS_COLORS.info
      default:
        return STATUS_COLORS.neutral
    }
  }

  const criticalCount = alerts.filter((a) => a.urgencia === "critica").length

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
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {alerts.map((alert) => (
          <Card key={alert.id} className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{alert.producto}</h3>
                    <Badge variant="outline" className={getUrgenciaColor(alert.urgencia)}>
                      {alert.urgencia.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Stock Actual:</span>
                      <p className="font-semibold text-red-600">{alert.stockActual}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Stock Mínimo:</span>
                      <p className="font-semibold">{alert.stockMinimo}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Días Restantes:</span>
                      <p className="font-semibold text-orange-600">{alert.diasRestantes} días</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => onCreateOrder(alert)}>
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    Pedir Ahora
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

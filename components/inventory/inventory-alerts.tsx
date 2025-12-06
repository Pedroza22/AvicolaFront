"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, X, Loader2, CheckCircle } from "lucide-react"
import { useAppState } from "@/lib/hooks/use-app-state"
import { orderRepository } from "@/lib/repositories/order.repository"
import { inventoryRepository } from "@/lib/repositories/inventory.repository"
import type { StockAlert } from "@/lib/types"

export function InventoryAlerts() {
  const { selectedFarm, user } = useAppState()

  const [criticalAlerts, setCriticalAlerts] = useState<StockAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<StockAlert | null>(null)

  const [producto, setProducto] = useState("")
  const [cantidad, setCantidad] = useState<number>(50)
  const [unidad, setUnidad] = useState("KG")
  const [precio, setPrecio] = useState<number>(0)
  const [proveedorId, setProveedorId] = useState("")
  const [urgencia, setUrgencia] = useState<"normal" | "urgente" | "critica">("critica")
  const [observaciones, setObservaciones] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadStockAlerts()
  }, [])

  const loadStockAlerts = async () => {
    try {
      setLoading(true)
      const response = await inventoryRepository.getStockAlerts()
      // Show critical and out_of_stock alerts
      const urgentAlerts = [...response.alerts.critical, ...response.alerts.out_of_stock]
      setCriticalAlerts(urgentAlerts)
    } catch (error) {
      console.error("Error loading stock alerts:", error)
      setCriticalAlerts([])
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = () => setVisible(false)
  
  const handleOpen = (alert: StockAlert) => {
    setSelectedAlert(alert)
    setProducto(alert.name)
    setUnidad(alert.unit)
    // Suggest reorder quantity based on 7 days of average consumption
    const suggestedQty = Math.max(50, Math.ceil(alert.current_stock * 7))
    setCantidad(suggestedQty)
    setObservaciones(`Stock crítico: ${alert.status.message}. Ubicación: ${alert.location}`)
    setOpenModal(true)
  }
  
  const handleClose = () => {
    setOpenModal(false)
    setSelectedAlert(null)
  }

  const handleCreateOrder = async () => {
    try {
      setSaving(true)
      const pedido = {
        fecha: new Date().toISOString(),
        proveedorId,
        productos: [
          {
            producto,
            cantidad,
            unidad,
            precio,
          },
        ],
        total: precio * cantidad,
        estado: "pendiente" as const,
        fechaEntrega: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        urgencia,
        observaciones,
        farmId: selectedFarm || "farm-default",
        createdBy: user?.id || "system",
      }

      await orderRepository.create(pedido)
      setOpenModal(false)
    } catch (e) {
      console.error("Error creando pedido", e)
    } finally {
      setSaving(false)
    }
  }

  if (!visible) return null

  if (loading) {
    return (
      <div className="space-y-3 mb-6">
        <Alert className="border-blue-200 bg-blue-50">
          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
          <AlertTitle className="text-blue-800">Cargando alertas de inventario...</AlertTitle>
        </Alert>
      </div>
    )
  }

  if (criticalAlerts.length === 0) {
    return (
      <div className="space-y-3 mb-6">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Stock en Niveles Óptimos</AlertTitle>
          <AlertDescription className="text-green-700">
            No hay productos con stock crítico en este momento
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-3 mb-6">
      {criticalAlerts.map((alert) => (
        <Alert key={alert.id} className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">
            Stock {alert.status.status === "OUT_OF_STOCK" ? "Agotado" : "Crítico"} - {alert.name}
          </AlertTitle>
          <AlertDescription className="text-red-700 flex items-center justify-between">
            <span>
              {alert.location} | Stock: {alert.current_stock} {alert.unit} | {alert.status.message}
              {alert.projected_stockout && ` | Agotamiento: ${new Date(alert.projected_stockout).toLocaleDateString()}`}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="destructive" onClick={() => handleOpen(alert)}>
                Solicitar Reposición
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss} aria-label="Cerrar aviso">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ))}

      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Solicitar Reposición</h3>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Producto</Label>
                <Input value={producto} onChange={(e) => setProducto(e.target.value)} />
              </div>
              <div>
                <Label>Cantidad</Label>
                <Input type="number" value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} />
              </div>
              <div>
                <Label>Unidad</Label>
                <Input value={unidad} onChange={(e) => setUnidad(e.target.value)} />
              </div>
              <div>
                <Label>Precio (por unidad)</Label>
                <Input type="number" value={precio} onChange={(e) => setPrecio(Number(e.target.value))} />
              </div>
              <div>
                <Label>Proveedor ID</Label>
                <Input value={proveedorId} onChange={(e) => setProveedorId(e.target.value)} />
              </div>
              <div>
                <Label>Urgencia</Label>
                <Input value={urgencia} onChange={(e) => setUrgencia(e.target.value as any)} />
              </div>
              <div className="col-span-2">
                <Label>Observaciones</Label>
                <Textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button onClick={handleCreateOrder} disabled={saving}>
                {saving ? "Guardando..." : "Crear Pedido"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

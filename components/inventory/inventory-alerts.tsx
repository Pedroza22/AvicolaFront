"use client"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, X } from "lucide-react"
import { useAppState } from "@/lib/hooks/use-app-state"
import { orderRepository } from "@/lib/repositories/order.repository"

export function InventoryAlerts() {
  const { selectedFarm, user } = useAppState()

  const [visible, setVisible] = useState(true)
  const [openModal, setOpenModal] = useState(false)

  const [producto, setProducto] = useState("Alimento Concentrado")
  const [cantidad, setCantidad] = useState<number>(50)
  const [unidad, setUnidad] = useState("bultos")
  const [precio, setPrecio] = useState<number>(0)
  const [proveedorId, setProveedorId] = useState("proveedor-01")
  const [urgencia, setUrgencia] = useState<"normal" | "urgente" | "critica">("critica")
  const [observaciones, setObservaciones] = useState("")
  const [saving, setSaving] = useState(false)

  const alert = {
    id: 1,
    type: "critical",
    title: "Stock Crítico - Alimento Concentrado",
    description: "Quedan menos de 2 días de alimento en Granja Norte",
    action: "Solicitar Reposición",
  }

  const handleDismiss = () => setVisible(false)
  const handleOpen = () => setOpenModal(true)
  const handleClose = () => setOpenModal(false)

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

  return (
    <div className="space-y-3 mb-6">
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">{alert.title}</AlertTitle>
        <AlertDescription className="text-red-700 flex items-center justify-between">
          <span>{alert.description}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={handleOpen}>
              {alert.action}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss} aria-label="Cerrar aviso">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>

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

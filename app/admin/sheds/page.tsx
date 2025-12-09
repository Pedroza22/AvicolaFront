"use client"

import React, { useState, useEffect } from "react"
import { useAppState } from "@/lib/hooks/use-app-state"
import { farmRepository } from "@/lib/repositories/farm.repository"
import { shedRepository } from "@/lib/repositories/shed.repository"
import { ShedForm } from "@/components/forms/shed-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, RefreshCw } from "lucide-react"
import type { Farm, Shed } from "@/lib/types"
import { toast } from "sonner"

export default function ShedsAdminPage() {
  const { selectedFarm, setSelectedFarm } = useAppState()
  const [farms, setFarms] = useState<Farm[]>([])
  const [sheds, setSheds] = useState<Shed[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingShed, setEditingShed] = useState<Shed | null>(null)

  useEffect(() => {
    loadFarms()
  }, [])

  useEffect(() => {
    if (farms.length > 0 || selectedFarm) {
      loadSheds()
    }
  }, [selectedFarm, farms])

  const loadFarms = async () => {
    try {
      const data = await farmRepository.getAll()
      setFarms(data)
      if (!selectedFarm && data.length > 0) {
        setSelectedFarm(String(data[0].id))
      }
    } catch (e) {
      console.error("Error loading farms:", e)
      toast.error("No se pudieron cargar las granjas")
      setFarms([])
    }
  }

  const loadSheds = async () => {
    try {
      setLoading(true)
      const data = selectedFarm
        ? await shedRepository.getByFarm(selectedFarm)
        : await shedRepository.getAll()
      setSheds(data)
    } catch (e) {
      console.error("Error loading sheds:", e)
      toast.error("No se pudieron cargar los galpones")
      setSheds([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingShed(null)
    setShowForm(true)
  }

  const handleEdit = (shed: Shed) => {
    setEditingShed(shed)
    setShowForm(true)
  }

  const handleDelete = async (shed: Shed) => {
    if (!confirm(`¿Está seguro de eliminar el galpón "${shed.name}"?`)) {
      return
    }

    try {
      await shedRepository.delete(String(shed.id))
      toast.success("Galpón eliminado correctamente")
      loadSheds()
    } catch (e: any) {
      console.error("Error deleting shed:", e)
      toast.error(
        e.response?.data?.detail ||
        e.message ||
        "No se pudo eliminar el galpón"
      )
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingShed(null)
    loadSheds()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingShed(null)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Administración de Galpones</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadSheds} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Galpón
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Filtrar por granja:</label>
        <select
          className="px-3 py-2 border rounded-md"
          value={selectedFarm ?? ''}
          onChange={(e) => setSelectedFarm(e.target.value ? e.target.value : undefined)}
        >
          <option value="">Todas las granjas</option>
          {farms.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingShed ? `Editar Galpón: ${editingShed.name}` : "Crear Nuevo Galpón"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ShedForm
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
              editingShed={editingShed}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Galpones</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Cargando galpones...</span>
            </div>
          ) : sheds.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay galpones registrados.
              {selectedFarm && " en esta granja."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Nombre</th>
                    <th className="text-left p-3 font-medium">Granja</th>
                    <th className="text-right p-3 font-medium">Capacidad</th>
                    <th className="text-right p-3 font-medium">Ocupación</th>
                    <th className="text-right p-3 font-medium">% Ocupado</th>
                    <th className="text-center p-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sheds.map((shed) => {
                    const occupancyPercentage = shed.capacity > 0
                      ? ((shed.current / shed.capacity) * 100).toFixed(1)
                      : "0.0"
                    const occupancyColor =
                      parseFloat(occupancyPercentage) > 90
                        ? "text-red-600"
                        : parseFloat(occupancyPercentage) > 70
                        ? "text-yellow-600"
                        : "text-green-600"

                    return (
                      <tr key={shed.id} className="border-b hover:bg-muted/30">
                        <td className="p-3 font-medium">{shed.name}</td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {farms.find(f => f.id === shed.farmId)?.name || `ID: ${shed.farmId}`}
                        </td>
                        <td className="p-3 text-right">
                          {shed.capacity.toLocaleString()}
                        </td>
                        <td className="p-3 text-right">
                          {shed.current.toLocaleString()}
                        </td>
                        <td className={`p-3 text-right font-medium ${occupancyColor}`}>
                          {occupancyPercentage}%
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(shed)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(shed)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

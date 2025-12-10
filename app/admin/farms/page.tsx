"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react"
import { farmRepository } from "@/lib/repositories/farm.repository"
import { FarmForm } from "@/components/forms/farm-form"
import type { Farm } from "@/lib/types"

export default function FarmsPage() {
  const router = useRouter()
  const [farms, setFarms] = useState<Farm[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingFarm, setEditingFarm] = useState<Farm | undefined>()

  useEffect(() => {
    loadFarms()
  }, [])

  const loadFarms = async () => {
    try {
      setLoading(true)
      const data = await farmRepository.getAll()
      setFarms(data)
    } catch (error) {
      console.error("Error loading farms:", error)
      alert("Error al cargar granjas")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (data: Omit<Farm, "id" | "sheds">) => {
    try {
      await farmRepository.create(data as any)
      alert("Granja creada exitosamente")
      setShowForm(false)
      loadFarms()
    } catch (error) {
      console.error("Error creating farm:", error)
      alert("Error al crear granja")
      throw error
    }
  }

  const handleUpdate = async (data: Omit<Farm, "id" | "sheds">) => {
    if (!editingFarm) return
    try {
      await farmRepository.update(editingFarm.id, data as any)
      alert("Granja actualizada exitosamente")
      setEditingFarm(undefined)
      setShowForm(false)
      loadFarms()
    } catch (error) {
      console.error("Error updating farm:", error)
      alert("Error al actualizar granja")
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar esta granja?")) return
    try {
      await farmRepository.delete(id)
      alert("Granja eliminada exitosamente")
      loadFarms()
    } catch (error) {
      console.error("Error deleting farm:", error)
      alert("Error al eliminar granja")
    }
  }

  const handleEdit = (farm: Farm) => {
    setEditingFarm(farm)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setEditingFarm(undefined)
    setShowForm(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Gestión de Granjas</h1>
          </div>
          <Button onClick={() => setShowForm(true)} disabled={showForm}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Granja
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingFarm ? "Editar Granja" : "Nueva Granja"}</CardTitle>
            </CardHeader>
            <CardContent>
              <FarmForm
                farm={editingFarm}
                onSubmit={editingFarm ? handleUpdate : handleCreate}
                onCancel={handleCancelForm}
              />
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12">Cargando granjas...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {farms.map((farm) => (
              <Card key={farm.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{farm.name}</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(farm)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(farm.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estado:</span>
                      <span className={`font-medium ${
                        farm.status === "activa" ? "text-green-600" :
                        farm.status === "mantenimiento" ? "text-yellow-600" :
                        "text-gray-600"
                      }`}>
                        {farm.status.charAt(0).toUpperCase() + farm.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Galpones:</span>
                      <span className="font-medium">{farm.sheds || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && farms.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No hay granjas registradas. Crea una para comenzar.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

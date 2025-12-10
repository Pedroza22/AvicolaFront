"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react"
import { loteRepository } from "@/lib/repositories/lote.repository"
import { shedRepository } from "@/lib/repositories/shed.repository"
import { LoteForm } from "@/components/forms/lote-form"
import type { Lote } from "@/lib/types"
import { useAppState } from "@/lib/hooks/use-app-state"

export default function LotesPage() {
  const router = useRouter()
  const { selectedShed } = useAppState()
  const [lotes, setLotes] = useState<Lote[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLote, setEditingLote] = useState<Lote | undefined>()
  const [sheds, setSheds] = useState<any[]>([])

  useEffect(() => {
    loadLotes()
    loadSheds()
  }, [selectedShed])

  const loadSheds = async () => {
    try {
      const data = await shedRepository.getAll()
      setSheds(data)
    } catch (error) {
      console.error("Error loading sheds:", error)
    }
  }

  const loadLotes = async () => {
    try {
      setLoading(true)
      const data = selectedShed 
        ? await loteRepository.getByShed(selectedShed)
        : await loteRepository.getAll()
      setLotes(data)
    } catch (error) {
      console.error("Error loading lotes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (data: Omit<Lote, "id">) => {
    try {
      await loteRepository.create(data)
      alert("Lote creado exitosamente")
      setShowForm(false)
      loadLotes()
    } catch (error) {
      console.error("Error creating lote:", error)
      alert("Error al crear lote")
      throw error
    }
  }

  const handleUpdate = async (data: Omit<Lote, "id">) => {
    if (!editingLote) return
    try {
      await loteRepository.update(String(editingLote.id), data)
      alert("Lote actualizado exitosamente")
      setEditingLote(undefined)
      setShowForm(false)
      loadLotes()
    } catch (error) {
      console.error("Error updating lote:", error)
      alert("Error al actualizar lote")
      throw error
    }
  }

  const handleDelete = async (id: string | number) => {
    if (!confirm("¿Está seguro de eliminar este lote?")) return
    try {
      await loteRepository.delete(String(id))
      alert("Lote eliminado exitosamente")
      loadLotes()
    } catch (error) {
      console.error("Error deleting lote:", error)
      alert("Error al eliminar lote")
    }
  }

  const handleEdit = (lote: Lote) => {
    setEditingLote(lote)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setEditingLote(undefined)
    setShowForm(false)
  }

  const getShedName = (shedId: string | number | undefined) => {
    if (!shedId) return "N/A"
    const shed = sheds.find(s => String(s.id) === String(shedId))
    return shed?.name || `Galpón ${shedId}`
  }

  const formatDate = (date?: string) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Gestión de Lotes</h1>
              {selectedShed && <p className="text-sm text-muted-foreground">Filtrado por galpón seleccionado</p>}
            </div>
          </div>
          <Button onClick={() => setShowForm(true)} disabled={showForm}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Lote
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingLote ? "Editar Lote" : "Nuevo Lote"}</CardTitle>
            </CardHeader>
            <CardContent>
              <LoteForm
                lote={editingLote}
                preSelectedShedId={selectedShed}
                onSubmit={editingLote ? handleUpdate : handleCreate}
                onCancel={handleCancelForm}
              />
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12">Cargando lotes...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {lotes.map((lote) => (
              <Card key={lote.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Lote {lote.name || lote.id}</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(lote)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(lote.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Galpón:</span>
                      <p className="font-medium">{getShedName(lote.shed || lote.shedId)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fecha llegada:</span>
                      <p className="font-medium">{formatDate(lote.arrival_date || lote.fechaInicio)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cantidad inicial:</span>
                      <p className="font-medium">{lote.initial_quantity || lote.pollosIniciales || 0}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Raza:</span>
                      <p className="font-medium">{lote.breed || lote.raza || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Días:</span>
                      <p className="font-medium">{lote.current_age_days || lote.diasActuales || 0}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Estado:</span>
                      <p className={`font-medium ${
                        lote.status === "ACTIVE" || lote.status === "activo" ? "text-green-600" :
                        lote.status === "FINISHED" || lote.status === "completado" ? "text-gray-600" :
                        "text-yellow-600"
                      }`}>
                        {lote.status || "ACTIVE"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Proveedor:</span>
                      <p className="font-medium">{lote.supplier || lote.proveedor || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Supervivencia:</span>
                      <p className="font-medium">{lote.survival_rate ? `${lote.survival_rate}%` : "N/A"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && lotes.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No hay lotes registrados{selectedShed ? " para este galpón" : ""}. Crea uno para comenzar.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

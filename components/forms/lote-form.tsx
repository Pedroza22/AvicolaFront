"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Lote } from "@/lib/types"
import { shedRepository } from "@/lib/repositories/shed.repository"

interface LoteFormProps {
  lote?: Lote
  preSelectedShedId?: string
  onSubmit: (data: Omit<Lote, "id">) => Promise<void>
  onCancel: () => void
}

export function LoteForm({ lote, preSelectedShedId, onSubmit, onCancel }: LoteFormProps) {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sheds, setSheds] = useState<Array<{ id: string; name: string }>>([])
  const [loadingSheds, setLoadingSheds] = useState(true)
  
  const [formData, setFormData] = useState({
    shed: lote?.shed?.toString() || preSelectedShedId || "",
    arrival_date: lote?.arrival_date || "",
    initial_quantity: lote?.initial_quantity || 0,
    breed: lote?.breed || "",
    gender: lote?.gender || "mixed",
    supplier: lote?.supplier || "",
    status: (lote?.status || "ACTIVE") as "ACTIVE" | "SOLD" | "FINISHED" | "TRANSFERRED",
  })

  useEffect(() => {
    shedRepository.getAll()
      .then((data) => {
        setSheds(data.map((s: any) => ({ id: String(s.id), name: s.name })))
      })
      .catch(console.error)
      .finally(() => setLoadingSheds(false))
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.shed) {
      newErrors.shed = "Debe seleccionar un galpón"
    }

    if (!formData.arrival_date) {
      newErrors.arrival_date = "La fecha de llegada es requerida"
    }

    if (!formData.initial_quantity || formData.initial_quantity <= 0) {
      newErrors.initial_quantity = "La cantidad inicial debe ser mayor a 0"
    } else if (formData.initial_quantity > 1000000) {
      newErrors.initial_quantity = "La cantidad no puede exceder 1,000,000"
    }

    if (!formData.breed?.trim()) {
      newErrors.breed = "La raza es requerida"
    } else if (formData.breed.trim().length < 2) {
      newErrors.breed = "La raza debe tener al menos 2 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      await onSubmit({
        shed: formData.shed,
        arrival_date: formData.arrival_date,
        initial_quantity: formData.initial_quantity,
        breed: formData.breed.trim(),
        gender: formData.gender,
        supplier: formData.supplier.trim(),
        status: formData.status,
      })
    } catch (error: any) {
      console.error("Error submitting lote:", error)
      if (error?.response?.data) {
        const backendErrors: Record<string, string> = {}
        Object.entries(error.response.data).forEach(([key, value]) => {
          backendErrors[key] = Array.isArray(value) ? value[0] : String(value)
        })
        setErrors(backendErrors)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="shed">Galpón *</Label>
        <Select
          value={formData.shed}
          onValueChange={(value) => setFormData({ ...formData, shed: value })}
          disabled={loading || loadingSheds}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingSheds ? "Cargando..." : "Seleccionar galpón"} />
          </SelectTrigger>
          <SelectContent>
            {sheds.map((shed) => (
              <SelectItem key={shed.id} value={shed.id}>
                {shed.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.shed && <p className="text-sm text-red-500">{errors.shed}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="arrival_date">Fecha de Llegada *</Label>
        <Input
          id="arrival_date"
          type="date"
          value={formData.arrival_date}
          onChange={(e) => setFormData({ ...formData, arrival_date: e.target.value })}
          disabled={loading}
        />
        {errors.arrival_date && <p className="text-sm text-red-500">{errors.arrival_date}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="initial_quantity">Cantidad Inicial *</Label>
        <Input
          id="initial_quantity"
          type="number"
          min="1"
          max="1000000"
          value={formData.initial_quantity}
          onChange={(e) => setFormData({ ...formData, initial_quantity: parseInt(e.target.value) || 0 })}
          placeholder="Ej: 5000"
          disabled={loading}
        />
        {errors.initial_quantity && <p className="text-sm text-red-500">{errors.initial_quantity}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="breed">Raza *</Label>
        <Input
          id="breed"
          value={formData.breed}
          onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
          placeholder="Ej: Cobb 500, Ross 308"
          disabled={loading}
        />
        {errors.breed && <p className="text-sm text-red-500">{errors.breed}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">Género</Label>
        <Select
          value={formData.gender}
          onValueChange={(value) => setFormData({ ...formData, gender: value })}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mixed">Mixto</SelectItem>
            <SelectItem value="male">Macho</SelectItem>
            <SelectItem value="female">Hembra</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="supplier">Proveedor</Label>
        <Input
          id="supplier"
          value={formData.supplier}
          onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
          placeholder="Nombre del proveedor"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Estado</Label>
        <Select
          value={formData.status}
          onValueChange={(value: any) => setFormData({ ...formData, status: value })}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Activo</SelectItem>
            <SelectItem value="SOLD">Vendido</SelectItem>
            <SelectItem value="FINISHED">Finalizado</SelectItem>
            <SelectItem value="TRANSFERRED">Transferido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : lote ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  )
}

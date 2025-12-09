"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { farmRepository } from "@/lib/repositories/farm.repository"
import { userRepository } from "@/lib/repositories/user.repository"
import { shedRepository } from "@/lib/repositories/shed.repository"
import type { Farm, Shed, User } from "@/lib/types"
import { toast } from "sonner"

interface ShedFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  editingShed?: Shed | null
}

export function ShedForm({ onSuccess, onCancel, editingShed }: ShedFormProps) {
  const [name, setName] = useState("")
  const [capacity, setCapacity] = useState("")
  const [farmId, setFarmId] = useState("")
  const [assignedWorkerId, setAssignedWorkerId] = useState("")
  
  const [farms, setFarms] = useState<Farm[]>([])
  const [workers, setWorkers] = useState<User[]>([])
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(false)

  const loadFarms = async () => {
    try {
      const data = await farmRepository.getAll()
      setFarms(data)
    } catch (e) {
      console.error("Error loading farms:", e)
      toast.error("No se pudieron cargar las granjas")
    }
  }

  const loadWorkers = async () => {
    try {
      // userRepository.getAll returns all users from /admin-users/
      // Backend: AdminUserViewSet filters by role if needed
      // Frontend: filter by role.id=4 or role.name='Galponero'
      const data = await userRepository.getAll()
      
      // Filter galponeros: role.id=4 or role.name='Galponero'
      const galponeros = data.filter((u) => {
        if (u.role?.id === 4) return true
        if (u.role?.name && u.role.name.toLowerCase() === 'galponero') return true
        if (u.rol && u.rol.toLowerCase() === 'galponero') return true
        return false
      })
      
      setWorkers(galponeros)
    } catch (e) {
      console.error("Error loading workers:", e)
      toast.error("No se pudieron cargar los galponeros")
    }
  }

  useEffect(() => {
    loadFarms()
    loadWorkers()
    
    if (editingShed) {
      setName(editingShed.name)
      setCapacity(String(editingShed.capacity))
      setFarmId(String(editingShed.farmId))
      // Backend uses assigned_worker field - check type compatibility
      if (editingShed.farmId) {
        setAssignedWorkerId(String(editingShed.farmId))
      }
    }
  }, [editingShed])

  const sanitizeName = (input: string): string => {
    // Allow letters, numbers, spaces, hyphens, underscores, and basic accents
    // Remove dangerous chars and trim
    return input
      .replace(/[^\p{L}\p{N}\s\-_]/gu, '')
      .trim()
      .slice(0, 100)
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    // Name validation
    const cleanName = sanitizeName(name)
    if (!cleanName || cleanName.length < 3) {
      newErrors.name = "El nombre debe tener al menos 3 caracteres"
    } else if (cleanName.length > 100) {
      newErrors.name = "El nombre no puede exceder 100 caracteres"
    }
    // Check for valid characters (Unicode letters, numbers, spaces, hyphens, underscores)
    if (!/^[\p{L}\p{N}\s\-_]+$/u.test(cleanName)) {
      newErrors.name = "El nombre contiene caracteres no permitidos"
    }

    // Capacity validation
    const capacityNum = parseInt(capacity, 10)
    if (!capacity || isNaN(capacityNum) || capacityNum <= 0) {
      newErrors.capacity = "La capacidad debe ser un número mayor a 0"
    } else if (capacityNum > 1000000) {
      newErrors.capacity = "La capacidad no puede ser mayor a 1,000,000"
    }

    // Farm validation
    if (!farmId) {
      newErrors.farmId = "Debe seleccionar una granja"
    }

    // assigned_worker is optional (backend allows null/blank)
    // No validation needed for optional field

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Por favor corrija los errores en el formulario")
      return
    }

    setLoading(true)

    try {
      const cleanName = sanitizeName(name)
      const capacityNum = parseInt(capacity, 10)

      // Backend ShedSerializer expects: name, capacity, farm (FK ID), assigned_worker (FK ID or null)
      const payload: any = {
        name: cleanName,
        capacity: capacityNum,
        farm: farmId,
      }

      // Add assigned_worker only if selected (backend accepts null/undefined)
      if (assignedWorkerId) {
        payload.assigned_worker = assignedWorkerId
      }

      if (editingShed) {
        await shedRepository.update(String(editingShed.id), payload)
        toast.success("Galpón actualizado correctamente")
      } else {
        await shedRepository.create(payload)
        toast.success("Galpón creado correctamente")
      }

      // Reset form
      setName("")
      setCapacity("")
      setFarmId("")
      setAssignedWorkerId("")
      setErrors({})

      onSuccess?.()
    } catch (error: any) {
      console.error("Error saving shed:", error)
      
      // Handle validation errors from backend
      if (error.response?.data) {
        const backendErrors = error.response.data
        const newErrors: { [key: string]: string } = {}

        if (backendErrors.name) {
          newErrors.name = Array.isArray(backendErrors.name)
            ? backendErrors.name[0]
            : backendErrors.name
        }
        if (backendErrors.capacity) {
          newErrors.capacity = Array.isArray(backendErrors.capacity)
            ? backendErrors.capacity[0]
            : backendErrors.capacity
        }
        if (backendErrors.farm) {
          newErrors.farmId = Array.isArray(backendErrors.farm)
            ? backendErrors.farm[0]
            : backendErrors.farm
        }
        if (backendErrors.assigned_worker) {
          newErrors.assignedWorkerId = Array.isArray(backendErrors.assigned_worker)
            ? backendErrors.assigned_worker[0]
            : backendErrors.assigned_worker
        }

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors)
        }
      }

      toast.error(
        error.response?.data?.detail ||
        error.message ||
        "Error al guardar el galpón"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre del Galpón *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (errors.name) setErrors({ ...errors, name: "" })
          }}
          placeholder="Ej: Galpón A1"
          disabled={loading}
        />
        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
      </div>

      <div>
        <Label htmlFor="capacity">Capacidad (Número de Pollos) *</Label>
        <Input
          id="capacity"
          type="number"
          value={capacity}
          onChange={(e) => {
            setCapacity(e.target.value)
            if (errors.capacity) setErrors({ ...errors, capacity: "" })
          }}
          placeholder="Ej: 10000"
          min="1"
          max="1000000"
          disabled={loading}
        />
        {errors.capacity && <p className="text-sm text-red-600 mt-1">{errors.capacity}</p>}
      </div>

      <div>
        <Label htmlFor="farmId">Granja *</Label>
        <select
          id="farmId"
          value={farmId}
          onChange={(e) => {
            setFarmId(e.target.value)
            if (errors.farmId) setErrors({ ...errors, farmId: "" })
          }}
          className="w-full px-3 py-2 border rounded-md"
          disabled={loading}
        >
          <option value="">Seleccione una granja</option>
          {farms.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
        {errors.farmId && <p className="text-sm text-red-600 mt-1">{errors.farmId}</p>}
      </div>

      <div>
        <Label htmlFor="assignedWorkerId">Galponero Asignado (Opcional)</Label>
        <select
          id="assignedWorkerId"
          value={assignedWorkerId}
          onChange={(e) => {
            setAssignedWorkerId(e.target.value)
            if (errors.assignedWorkerId) setErrors({ ...errors, assignedWorkerId: "" })
          }}
          className="w-full px-3 py-2 border rounded-md"
          disabled={loading}
        >
          <option value="">Sin asignar</option>
          {workers.map((w) => (
            <option key={w.id} value={w.id}>
              {w.username} ({w.email})
            </option>
          ))}
        </select>
        {errors.assignedWorkerId && (
          <p className="text-sm text-red-600 mt-1">{errors.assignedWorkerId}</p>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : editingShed ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  )
}

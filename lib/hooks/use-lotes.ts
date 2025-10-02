"use client"

import { useState, useEffect } from "react"
import type { Lote } from "@/lib/types"
import { loteRepository } from "@/lib/repositories/lote.repository"
import { toast } from "sonner"

export function useLotes(shedId?: string) {
  const [lotes, setLotes] = useState<Lote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadLotes()
  }, [shedId])

  const loadLotes = async () => {
    try {
      setLoading(true)
      const data = shedId ? await loteRepository.getByShed(shedId) : await loteRepository.getActive()
      setLotes(data)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar lotes"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const createLote = async (lote: Omit<Lote, "id">) => {
    try {
      const created = await loteRepository.create(lote)
      setLotes((prev) => [...prev, created])
      toast.success("Lote creado correctamente")
      return created
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al crear lote"
      toast.error(message)
      throw err
    }
  }

  const updateLote = async (id: string, lote: Partial<Lote>) => {
    try {
      const updated = await loteRepository.update(id, lote)
      setLotes((prev) => prev.map((l) => (l.id === id ? updated : l)))
      toast.success("Lote actualizado correctamente")
      return updated
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al actualizar lote"
      toast.error(message)
      throw err
    }
  }

  const deleteLote = async (id: string) => {
    try {
      await loteRepository.delete(id)
      setLotes((prev) => prev.filter((lote) => lote.id !== id))
      toast.success("Lote eliminado correctamente")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al eliminar lote"
      toast.error(message)
      throw err
    }
  }

  return {
    lotes,
    loading,
    error,
    createLote,
    updateLote,
    deleteLote,
    refresh: loadLotes,
  }
}

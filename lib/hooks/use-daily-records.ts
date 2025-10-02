"use client"

import { useState, useEffect } from "react"
import type { DailyRecord } from "@/lib/types"
import { dailyRecordRepository } from "@/lib/repositories/daily-record.repository"
import { toast } from "sonner"

export function useDailyRecords(loteId: string) {
  const [records, setRecords] = useState<DailyRecord[]>([])
  const [latestRecord, setLatestRecord] = useState<DailyRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (loteId) {
      loadRecords()
      loadLatest()
    }
  }, [loteId])

  const loadRecords = async () => {
    try {
      setLoading(true)
      const data = await dailyRecordRepository.getByLote(loteId)
      setRecords(data)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar registros"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const loadLatest = async () => {
    try {
      const data = await dailyRecordRepository.getLatest(loteId)
      setLatestRecord(data)
    } catch (err) {
      console.error("Error loading latest record:", err)
    }
  }

  const createRecord = async (record: Omit<DailyRecord, "id">) => {
    try {
      const created = await dailyRecordRepository.create(record)
      setRecords((prev) => [created, ...prev])
      setLatestRecord(created)
      toast.success("Registro guardado correctamente")
      return created
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al guardar registro"
      toast.error(message)
      throw err
    }
  }

  const updateRecord = async (id: string, record: Partial<DailyRecord>) => {
    try {
      const updated = await dailyRecordRepository.update(id, record)
      setRecords((prev) => prev.map((r) => (r.id === id ? updated : r)))
      if (latestRecord?.id === id) {
        setLatestRecord(updated)
      }
      toast.success("Registro actualizado correctamente")
      return updated
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al actualizar registro"
      toast.error(message)
      throw err
    }
  }

  const deleteRecord = async (id: string) => {
    try {
      await dailyRecordRepository.delete(id)
      setRecords((prev) => prev.filter((record) => record.id !== id))
      if (latestRecord?.id === id) {
        setLatestRecord(null)
      }
      toast.success("Registro eliminado correctamente")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al eliminar registro"
      toast.error(message)
      throw err
    }
  }

  return {
    records,
    latestRecord,
    loading,
    error,
    createRecord,
    updateRecord,
    deleteRecord,
    refresh: loadRecords,
  }
}

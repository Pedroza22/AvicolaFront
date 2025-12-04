"use client"

import { useState, useEffect, useCallback } from "react"
import { offlineSyncService } from "@/lib/services/offline-sync.service"

interface UseConnectionStatusReturn {
  isOnline: boolean
  pendingOperations: number
  syncPending: () => Promise<void>
  isSyncing: boolean
}

/**
 * Hook para manejar el estado de conexión y sincronización offline
 */
export function useConnectionStatus(): UseConnectionStatusReturn {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingOperations, setPendingOperations] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    // Suscribirse a cambios de conexión
    const unsubscribe = offlineSyncService.onConnectionChange((online) => {
      setIsOnline(online)
    })

    // Cargar conteo de operaciones pendientes
    const loadPendingCount = async () => {
      const count = await offlineSyncService.getPendingCount()
      setPendingOperations(count)
    }
    loadPendingCount()

    // Actualizar conteo periódicamente
    const interval = setInterval(loadPendingCount, 5000)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [])

  const syncPending = useCallback(async () => {
    if (!isOnline || isSyncing) return

    setIsSyncing(true)
    try {
      const result = await offlineSyncService.syncPendingOperations()
      const newCount = await offlineSyncService.getPendingCount()
      setPendingOperations(newCount)
      
      if (result.success > 0) {
        console.log(`Sincronizadas ${result.success} operaciones`)
      }
      if (result.failed > 0) {
        console.warn(`${result.failed} operaciones fallaron`)
      }
    } finally {
      setIsSyncing(false)
    }
  }, [isOnline, isSyncing])

  return {
    isOnline,
    pendingOperations,
    syncPending,
    isSyncing,
  }
}

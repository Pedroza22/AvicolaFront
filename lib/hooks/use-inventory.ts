"use client"

import { useState, useEffect } from "react"
import type { InventoryItem, StockAlert } from "@/lib/types"
import { inventoryRepository } from "@/lib/repositories/inventory.repository"
import { toast } from "sonner"

export function useInventory(farmId: string) {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [alerts, setAlerts] = useState<StockAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInventory()
    loadAlerts()
  }, [farmId])

  const loadInventory = async () => {
    try {
      setLoading(true)
      const data = await inventoryRepository.getByFarm(farmId)
      setInventory(data)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar inventario"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const loadAlerts = async () => {
    try {
      const data = await inventoryRepository.getAlerts(farmId)
      setAlerts(data)
    } catch (err) {
      console.error("Error loading alerts:", err)
    }
  }

  const updateStock = async (itemId: string, newStock: number) => {
    try {
      const updated = await inventoryRepository.updateStock(itemId, newStock)
      setInventory((prev) => prev.map((item) => (item.id === itemId ? updated : item)))
      toast.success("Stock actualizado correctamente")

      // Reload alerts after stock update
      loadAlerts()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al actualizar stock"
      toast.error(message)
      throw err
    }
  }

  const createItem = async (item: Omit<InventoryItem, "id">) => {
    try {
      const created = await inventoryRepository.create(item)
      setInventory((prev) => [...prev, created])
      toast.success("Producto agregado correctamente")
      return created
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al crear producto"
      toast.error(message)
      throw err
    }
  }

  const updateItem = async (id: string, item: Partial<InventoryItem>) => {
    try {
      const updated = await inventoryRepository.update(id, item)
      setInventory((prev) => prev.map((i) => (i.id === id ? updated : i)))
      toast.success("Producto actualizado correctamente")
      return updated
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al actualizar producto"
      toast.error(message)
      throw err
    }
  }

  const deleteItem = async (id: string) => {
    try {
      await inventoryRepository.delete(id)
      setInventory((prev) => prev.filter((item) => item.id !== id))
      toast.success("Producto eliminado correctamente")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al eliminar producto"
      toast.error(message)
      throw err
    }
  }

  return {
    inventory,
    alerts,
    loading,
    error,
    updateStock,
    createItem,
    updateItem,
    deleteItem,
    refresh: loadInventory,
  }
}

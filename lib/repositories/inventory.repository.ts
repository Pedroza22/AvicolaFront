import { httpClient } from "@/lib/api/http-client"
import { API_ENDPOINTS } from "@/lib/config/api.config"
import type { InventoryItem, StockAlert } from "@/lib/types"

export class InventoryRepository {
  async getAll(): Promise<InventoryItem[]> {
    const response = await httpClient.get<InventoryItem[]>(API_ENDPOINTS.inventory.list)
    return response.data
  }

  async getByFarm(farmId: string): Promise<InventoryItem[]> {
    const response = await httpClient.get<InventoryItem[]>(API_ENDPOINTS.inventory.byFarm(farmId))
    return response.data
  }

  async getAlerts(farmId: string): Promise<StockAlert[]> {
    const response = await httpClient.get<StockAlert[]>(API_ENDPOINTS.inventory.alerts(farmId))
    return response.data
  }

  async getById(id: string): Promise<InventoryItem> {
    const response = await httpClient.get<InventoryItem>(API_ENDPOINTS.inventory.detail(id))
    return response.data
  }

  async create(item: Omit<InventoryItem, "id">): Promise<InventoryItem> {
    const response = await httpClient.post<InventoryItem>(API_ENDPOINTS.inventory.create, item)
    return response.data
  }

  async update(id: string, item: Partial<InventoryItem>): Promise<InventoryItem> {
    const response = await httpClient.put<InventoryItem>(API_ENDPOINTS.inventory.update(id), item)
    return response.data
  }

  async updateStock(id: string, stockActual: number): Promise<InventoryItem> {
    const response = await httpClient.patch<InventoryItem>(API_ENDPOINTS.inventory.updateStock(id), {
      stockActual,
    })
    return response.data
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(API_ENDPOINTS.inventory.delete(id))
  }
}

export const inventoryRepository = new InventoryRepository()

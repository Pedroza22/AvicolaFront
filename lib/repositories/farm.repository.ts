import { httpClient } from "@/lib/api/http-client"
import { API_ENDPOINTS } from "@/lib/config/api.config"
import type { Farm } from "@/lib/types"

export class FarmRepository {
  async getAll(): Promise<Farm[]> {
    const response = await httpClient.get<Farm[]>(API_ENDPOINTS.farms.list)
    return response.data
  }

  async getById(id: string): Promise<Farm> {
    const response = await httpClient.get<Farm>(API_ENDPOINTS.farms.detail(id))
    return response.data
  }

  async create(farm: Omit<Farm, "id">): Promise<Farm> {
    const response = await httpClient.post<Farm>(API_ENDPOINTS.farms.create, farm)
    return response.data
  }

  async update(id: string, farm: Partial<Farm>): Promise<Farm> {
    const response = await httpClient.put<Farm>(API_ENDPOINTS.farms.update(id), farm)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(API_ENDPOINTS.farms.delete(id))
  }
}

export const farmRepository = new FarmRepository()

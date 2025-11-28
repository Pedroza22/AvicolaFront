import { httpClient } from "@/lib/api/http-client"
import { API_ENDPOINTS } from "@/lib/config/api.config"
import type { Shed } from "@/lib/types"

export class ShedRepository {
  async getAll(): Promise<Shed[]> {
    const response = await httpClient.get<Shed[]>(API_ENDPOINTS.sheds.list)
    return response.data
  }

  async getByFarm(farmId: string): Promise<Shed[]> {
    const response = await httpClient.get<Shed[]>(API_ENDPOINTS.sheds.byFarm(farmId))
    return response.data
  }

  async getById(id: string): Promise<Shed> {
    const response = await httpClient.get<Shed>(API_ENDPOINTS.sheds.detail(id))
    return response.data
  }
}

export const shedRepository = new ShedRepository()

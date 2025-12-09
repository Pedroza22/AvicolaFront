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

  async create(shed: Omit<Shed, "id">): Promise<Shed> {
    const response = await httpClient.post<Shed>(API_ENDPOINTS.sheds.create, shed)
    return response.data
  }

  async update(id: string, shed: Partial<Shed>): Promise<Shed> {
    const response = await httpClient.put<Shed>(API_ENDPOINTS.sheds.update(id), shed)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(API_ENDPOINTS.sheds.delete(id))
  }
}

export const shedRepository = new ShedRepository()


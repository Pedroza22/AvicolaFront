import { httpClient } from "@/lib/api/http-client"
import { API_ENDPOINTS } from "@/lib/config/api.config"
import type { Lote } from "@/lib/types"

export class LoteRepository {
  async getAll(): Promise<Lote[]> {
    const response = await httpClient.get<Lote[]>(API_ENDPOINTS.lotes.list)
    return response.data
  }

  async getByShed(shedId: string): Promise<Lote[]> {
    const response = await httpClient.get<Lote[]>(API_ENDPOINTS.lotes.byShed(shedId))
    return response.data
  }

  async getActive(): Promise<Lote[]> {
    const response = await httpClient.get<Lote[]>(API_ENDPOINTS.lotes.active)
    return response.data
  }

  async getById(id: string): Promise<Lote> {
    const response = await httpClient.get<Lote>(API_ENDPOINTS.lotes.detail(id))
    return response.data
  }

  async create(lote: Omit<Lote, "id">): Promise<Lote> {
    const response = await httpClient.post<Lote>(API_ENDPOINTS.lotes.create, lote)
    return response.data
  }

  async update(id: string, lote: Partial<Lote>): Promise<Lote> {
    const response = await httpClient.put<Lote>(API_ENDPOINTS.lotes.update(id), lote)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(API_ENDPOINTS.lotes.delete(id))
  }
}

export const loteRepository = new LoteRepository()

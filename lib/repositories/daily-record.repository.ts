import { httpClient } from "@/lib/api/http-client"
import { API_ENDPOINTS } from "@/lib/config/api.config"
import type { DailyRecord } from "@/lib/types"

export class DailyRecordRepository {
  async getAll(): Promise<DailyRecord[]> {
    const response = await httpClient.get<DailyRecord[]>(API_ENDPOINTS.dailyRecords.list)
    return response.data
  }

  async getByLote(loteId: string): Promise<DailyRecord[]> {
    const response = await httpClient.get<DailyRecord[]>(API_ENDPOINTS.dailyRecords.byLote(loteId))
    return response.data
  }

  async getLatest(loteId: string): Promise<DailyRecord | null> {
    const response = await httpClient.get<DailyRecord | null>(API_ENDPOINTS.dailyRecords.latest(loteId))
    return response.data
  }

  async getById(id: string): Promise<DailyRecord> {
    const response = await httpClient.get<DailyRecord>(API_ENDPOINTS.dailyRecords.detail(id))
    return response.data
  }

  async create(record: Omit<DailyRecord, "id">): Promise<DailyRecord> {
    const response = await httpClient.post<DailyRecord>(API_ENDPOINTS.dailyRecords.create, record)
    return response.data
  }

  async update(id: string, record: Partial<DailyRecord>): Promise<DailyRecord> {
    const response = await httpClient.put<DailyRecord>(API_ENDPOINTS.dailyRecords.update(id), record)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(API_ENDPOINTS.dailyRecords.delete(id))
  }
}

export const dailyRecordRepository = new DailyRecordRepository()

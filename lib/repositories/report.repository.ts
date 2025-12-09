import { httpClient } from "@/lib/api/http-client"
import { API_ENDPOINTS } from "@/lib/config/api.config"

export class ReportRepository {
  async getSchedules(): Promise<any[]> {
    const response = await httpClient.get<any[]>('/schedules/')
    return response.data
  }

  async getSchedulesByFarm(farmId: string): Promise<any[]> {
    const response = await httpClient.get<any[]>(`/schedules/?farm=${farmId}`)
    return response.data
  }
}

export const reportRepository = new ReportRepository()

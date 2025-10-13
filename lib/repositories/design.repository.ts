import { httpClient } from "@/lib/api/http-client"
import { API_ENDPOINTS } from "@/lib/config/api.config"

export class DesignRepository {
  async getCategorias(): Promise<any[]> {
    const response = await httpClient.get<any[]>(API_ENDPOINTS.design.categories)
    return response.data
  }

  async getServicios(): Promise<any[]> {
    const response = await httpClient.get<any[]>(API_ENDPOINTS.design.services)
    return response.data
  }

  async getConfiguracion(): Promise<any> {
    const response = await httpClient.get<any>(API_ENDPOINTS.design.configuration)
    return response.data
  }
}

export const designRepository = new DesignRepository()
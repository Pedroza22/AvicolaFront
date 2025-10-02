import { httpClient } from "@/lib/api/http-client"
import { API_ENDPOINTS } from "@/lib/config/api.config"
import type { Proveedor } from "@/lib/types"

export class SupplierRepository {
  async getAll(): Promise<Proveedor[]> {
    const response = await httpClient.get<Proveedor[]>(API_ENDPOINTS.suppliers.list)
    return response.data
  }

  async getById(id: string): Promise<Proveedor> {
    const response = await httpClient.get<Proveedor>(API_ENDPOINTS.suppliers.detail(id))
    return response.data
  }

  async create(supplier: Omit<Proveedor, "id">): Promise<Proveedor> {
    const response = await httpClient.post<Proveedor>(API_ENDPOINTS.suppliers.create, supplier)
    return response.data
  }

  async update(id: string, supplier: Partial<Proveedor>): Promise<Proveedor> {
    const response = await httpClient.put<Proveedor>(API_ENDPOINTS.suppliers.update(id), supplier)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(API_ENDPOINTS.suppliers.delete(id))
  }
}

export const supplierRepository = new SupplierRepository()

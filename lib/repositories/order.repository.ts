import { httpClient } from "@/lib/api/http-client"
import { API_ENDPOINTS } from "@/lib/config/api.config"
import type { Pedido } from "@/lib/types"

export class OrderRepository {
  async getAll(): Promise<Pedido[]> {
    const response = await httpClient.get<Pedido[]>(API_ENDPOINTS.orders.list)
    return response.data
  }

  async getByFarm(farmId: string): Promise<Pedido[]> {
    const response = await httpClient.get<Pedido[]>(API_ENDPOINTS.orders.byFarm(farmId))
    return response.data
  }

  async getById(id: string): Promise<Pedido> {
    const response = await httpClient.get<Pedido>(API_ENDPOINTS.orders.detail(id))
    return response.data
  }

  async create(order: Omit<Pedido, "id">): Promise<Pedido> {
    const response = await httpClient.post<Pedido>(API_ENDPOINTS.orders.create, order)
    return response.data
  }

  async update(id: string, order: Partial<Pedido>): Promise<Pedido> {
    const response = await httpClient.put<Pedido>(API_ENDPOINTS.orders.update(id), order)
    return response.data
  }

  async updateStatus(id: string, estado: Pedido["estado"]): Promise<Pedido> {
    const response = await httpClient.patch<Pedido>(API_ENDPOINTS.orders.updateStatus(id), {
      estado,
    })
    return response.data
  }

  async sendToSupplier(id: string): Promise<{ success: boolean; message: string }> {
    const response = await httpClient.post<{ success: boolean; message: string }>(API_ENDPOINTS.orders.send(id))
    return response.data
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(API_ENDPOINTS.orders.delete(id))
  }
}

export const orderRepository = new OrderRepository()

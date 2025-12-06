import { httpClient } from "@/lib/api/http-client"
import { API_ENDPOINTS } from "@/lib/config/api.config"
import type { User } from "@/lib/types"

export class UserRepository {
  async getAll(): Promise<User[]> {
    const response = await httpClient.get<User[]>("/admin-users/")
    return response.data
  }

  async create(payload: Partial<User> & { password?: string }): Promise<User> {
    const response = await httpClient.post<User>("/admin-users/", payload)
    return response.data
  }

  async update(id: string, payload: Partial<User>): Promise<User> {
    const response = await httpClient.put<User>(`/admin-users/${id}/`, payload)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/admin-users/${id}/`)
  }
}

export const userRepository = new UserRepository()

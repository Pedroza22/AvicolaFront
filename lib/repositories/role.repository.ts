import { httpClient } from "@/lib/api/http-client"
import type { Role } from "@/lib/types"

export interface Role {
  id: number
  name: string
}

export class RoleRepository {
  async getAll(): Promise<Role[]> {
    const response = await httpClient.get<Role[]>("/roles/")
    return response.data
  }

  async getById(id: number): Promise<Role> {
    const response = await httpClient.get<Role>(`/roles/${id}/`)
    return response.data
  }
}

export const roleRepository = new RoleRepository()

"use client"

import React, { useEffect, useState } from "react"
import AdminUserForm from "@/components/forms/admin-user-form"
import { userRepository } from "@/lib/repositories/user.repository"
import { Card } from "@/components/ui/card"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])

  const load = async () => {
    try {
      const res = await userRepository.getAll()
      setUsers(res)
    } catch (err) {
      // ignore - may require admin privileges
      setUsers([])
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Administración de Usuarios</h2>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <Card className="p-4">
            <h3 className="font-medium mb-2">Crear usuario</h3>
            <AdminUserForm onCreated={(u) => { load() }} />
          </Card>
        </div>
        <div>
          <Card className="p-4">
            <h3 className="font-medium mb-2">Lista de usuarios (admin)</h3>
            <div className="space-y-2">
              {users.length === 0 && <div className="text-sm text-muted-foreground">No hay usuarios visibles</div>}
              {users.map((u) => (
                <div key={u.id} className="border-b pb-2">
                  <div className="font-medium">{u.username} {u.role ? `(${u.role})` : ''}</div>
                  <div className="text-sm text-muted-foreground">{u.email}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

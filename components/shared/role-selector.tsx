"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { User, Shield, Stethoscope, Clipboard } from "lucide-react"

interface RoleSelectorProps {
  selectedRole: string
  onRoleChange: (role: string) => void
}

export function RoleSelector({ selectedRole, onRoleChange }: RoleSelectorProps) {
  const roles = [
    {
      id: "admin-empresa",
      name: "Administrador Empresa",
      icon: Shield,
      color: "bg-red-50 text-red-700",
    },
    {
      id: "veterinario",
      name: "Veterinario",
      icon: Stethoscope,
      color: "bg-blue-50 text-blue-700",
    },
    {
      id: "admin-granja",
      name: "Administrador Granja",
      icon: User,
      color: "bg-green-50 text-green-700",
    },
    {
      id: "galponero",
      name: "Galponero",
      icon: Clipboard,
      color: "bg-orange-50 text-orange-700",
    },
  ]

  const currentRole = roles.find((role) => role.id === selectedRole)

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedRole} onValueChange={onRoleChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Seleccionar rol" />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role.id} value={role.id}>
              <div className="flex items-center gap-2">
                <role.icon className="h-4 w-4" />
                {role.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {currentRole && (
        <Badge variant="outline" className={currentRole.color}>
          <currentRole.icon className="h-3 w-3 mr-1" />
          {currentRole.name}
        </Badge>
      )}
    </div>
  )
}

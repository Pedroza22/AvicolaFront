"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { userRepository } from "@/lib/repositories/user.repository"
import { USER_ROLES } from "@/lib/constants"

type Props = {
  onCreated?: (u: any) => void
}

const usernameRx = /^[a-zA-Z0-9._-]{3,30}$/
const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const identificationRx = /^\d{8,20}$/
const phoneRx = /^\+?[0-9]{7,15}$/
const nameRx = /^[\p{L}0-9 .,'-]{3,100}$/u
const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

function sanitize(input: string, allowUnicode = true) {
  if (!input) return input
  // remove control characters
  let s = input.replace(/[\x00-\x1F\x7F]/g, "")
  // collapse spaces
  s = s.replace(/\s+/g, " ").trim()
  return s
}

export default function AdminUserForm({ onCreated }: Props) {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [identification, setIdentification] = useState("")
  const [phone, setPhone] = useState("")
  const [roleId, setRoleId] = useState<string | undefined>(undefined)
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    setError(null)
    const u = sanitize(username)
    if (!usernameRx.test(u)) return "Usuario inválido (solo letras, números, . _ - ; 3-30)"
    const e = sanitize(email)
    if (!emailRx.test(e)) return "Email inválido"
    const id = sanitize(identification)
    if (!identificationRx.test(id)) return "Identificación inválida (8-20 dígitos)"
    if (phone && !phoneRx.test(sanitize(phone))) return "Teléfono inválido"
    if (!passwordPolicy.test(password)) return "Contraseña no cumple la política (8+, mayúscula, minúscula, dígito)"
    if (password !== passwordConfirm) return "Las contraseñas no coinciden"
    return null
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const v = validate()
    if (v) {
      setError(v)
      return
    }

    setLoading(true)
    try {
      const payload: any = {
        username: sanitize(username),
        email: sanitize(email),
        identification: sanitize(identification),
        phone: sanitize(phone),
        password,
      }
      if (roleId) payload.role = Number(roleId)

      const created = await userRepository.create(payload)
      setUsername("")
      setEmail("")
      setIdentification("")
      setPhone("")
      setPassword("")
      setPasswordConfirm("")
      setRoleId(undefined)
      onCreated?.(created)
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Error al crear usuario")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 max-w-xl">
      {error && <div className="text-sm text-red-600">{error}</div>}

      <div>
        <Label htmlFor="username">Usuario</Label>
        <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="identification">Identificación</Label>
        <Input id="identification" value={identification} onChange={(e) => setIdentification(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="phone">Teléfono (opcional)</Label>
        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="role">Rol (opcional)</Label>
        <select id="role" className="w-full rounded-md border px-2 py-2" value={roleId ?? ""} onChange={(e) => setRoleId(e.target.value || undefined)}>
          <option value="">Sin rol</option>
          <option value="1">Administrador Sistema</option>
          <option value="2">Administrador de Granja</option>
          <option value="3">Veterinario</option>
          <option value="4">Galponero</option>
        </select>
        <div className="text-xs text-muted-foreground mt-1">Si los IDs de rol difieren, deja Sin rol y asigna desde el backend.</div>
      </div>

      <div>
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="confirm">Confirmar contraseña</Label>
        <Input id="confirm" type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>{loading ? 'Creando...' : 'Crear usuario'}</Button>
      </div>
    </form>
  )
}

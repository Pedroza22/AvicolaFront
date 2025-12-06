"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { farmRepository } from "@/lib/repositories/farm.repository"

const nameRx = /^[\p{L}0-9 .,'-]{3,100}$/u

function sanitize(input: string) {
  if (!input) return input
  return input.replace(/[\x00-\x1F\x7F]/g, "").replace(/\s+/g, " ").trim()
}

export default function FarmForm({ onCreated }: { onCreated?: (f: any) => void }) {
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    if (!nameRx.test(sanitize(name))) return "Nombre inválido (3-100 caracteres, letras y números)"
    if (location.trim().length < 5) return "Ubicación muy corta"
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
      const payload = { name: sanitize(name), location: sanitize(location) }
      const created = await farmRepository.create(payload)
      setName("")
      setLocation("")
      onCreated?.(created)
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Error al crear granja")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 max-w-xl">
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div>
        <Label htmlFor="name">Nombre de la granja</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="location">Ubicación</Label>
        <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>{loading ? 'Creando...' : 'Crear granja'}</Button>
      </div>
    </form>
  )
}

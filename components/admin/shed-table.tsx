"use client"

import React, { useEffect, useState } from "react"
import { shedRepository } from "@/lib/repositories/shed.repository"
import type { Shed } from "@/lib/types"
import { Card } from "@/components/ui/card"

export default function ShedTable({ farmId }: { farmId?: string }) {
  const [sheds, setSheds] = useState<Shed[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = farmId ? await shedRepository.getByFarm(farmId) : await shedRepository.getAll()
      setSheds(data)
    } catch (e) {
      setSheds([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [farmId])

  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium mb-2">Galpones</h3>
      {loading && <div>Cargando galpones...</div>}
      {!loading && sheds.length === 0 && <div className="text-sm text-muted-foreground">No hay galpones</div>}
      <div className="grid gap-2">
        {sheds.map((s) => (
          <div key={s.id} className="p-3 border rounded-md">
            <div className="font-medium">{s.name}</div>
            <div className="text-sm text-muted-foreground">Capacidad: {s.capacity} — Ocupado: {s.current ?? 'N/A'}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}

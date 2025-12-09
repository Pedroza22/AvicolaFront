"use client"

import React, { useEffect, useState } from "react"
import { reportRepository } from "@/lib/repositories/report.repository"
import { Card } from "@/components/ui/card"

export default function VetSchedules({ farmId, shedId }: { farmId?: string, shedId?: string }) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      let data = await reportRepository.getSchedules()
      if (farmId) data = data.filter((d: any) => d.farm === Number(farmId))
      if (shedId) data = data.filter((d: any) => d.shed === Number(shedId))
      setSchedules(data)
    } catch (e) {
      setSchedules([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [farmId, shedId])

  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium mb-2">Horarios / Citas - Veterinarios</h3>
      {loading && <div>Cargando horarios...</div>}
      {!loading && schedules.length === 0 && <div className="text-sm text-muted-foreground">No hay registros</div>}
      <div className="space-y-2">
        {schedules.map((s) => (
          <div key={s.id} className="p-2 border rounded-md">
            <div className="font-medium">{s.name}</div>
            <div className="text-sm text-muted-foreground">Frecuencia: {s.frequency} — Próxima: {s.next_run}</div>
            <div className="text-sm">Farm: {s.farm ?? '—'} • Shed: {s.shed ?? '—'}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}

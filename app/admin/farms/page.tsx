"use client"

import React, { useEffect, useState } from "react"
import FarmForm from "@/components/forms/farm-form"
import { farmRepository } from "@/lib/repositories/farm.repository"
import { Card } from "@/components/ui/card"

export default function AdminFarmsPage() {
  const [farms, setFarms] = useState<any[]>([])

  const load = async () => {
    try {
      const res = await farmRepository.getAll()
      setFarms(res)
    } catch (err) {
      setFarms([])
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Administración de Granjas</h2>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <Card className="p-4">
            <h3 className="font-medium mb-2">Crear granja</h3>
            <FarmForm onCreated={() => load()} />
          </Card>
        </div>
        <div>
          <Card className="p-4">
            <h3 className="font-medium mb-2">Lista de granjas</h3>
            <div className="space-y-3">
              {farms.length === 0 && <div className="text-sm text-muted-foreground">No se encontraron granjas</div>}
              {farms.map((f) => (
                <div key={f.id} className="border-b pb-2">
                  <div className="font-medium">{f.name}</div>
                  <div className="text-sm text-muted-foreground">{f.location}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

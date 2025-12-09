"use client"

import React from "react"
import { useInventory } from "@/lib/hooks/use-inventory"
import { Card } from "@/components/ui/card"

export default function InventoryOverview({ farmId }: { farmId?: string }) {
  const { inventory, refresh } = useInventory(farmId ?? "")

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Inventario</h3>
        <button onClick={refresh} className="text-sm text-primary">Refrescar</button>
      </div>
      <div className="mt-3 grid gap-2">
        {inventory.length === 0 && <div className="text-sm text-muted-foreground">No hay items</div>}
        {inventory.map((it) => (
          <div key={it.id} className="p-2 border rounded-md flex justify-between">
            <div>
              <div className="font-medium">{it.producto}</div>
              <div className="text-sm text-muted-foreground">{it.categoria} • {it.unidad}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{it.stockActual}</div>
              <div className="text-sm text-muted-foreground">Mín: {it.stockMinimo}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

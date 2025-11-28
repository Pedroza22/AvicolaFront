"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Home, Calendar } from "lucide-react"
import React from "react"

interface FarmSelectorProps {
  selectedFarm?: string
  selectedShed?: string
  selectedLote?: string
  onFarmChange: (farm: string) => void
  onShedChange: (shed: string) => void
  onLoteChange: (lote: string) => void
}

export function FarmSelector({
  selectedFarm,
  selectedShed,
  selectedLote,
  onFarmChange,
  onShedChange,
  onLoteChange,
}: FarmSelectorProps) {
  const [farms, setFarms] = React.useState<Array<{ id: string; name: string }>>([])
  const [sheds, setSheds] = React.useState<Array<{ id: string; name: string }>>([])
  const [lotes, setLotes] = React.useState<Array<{ id: string; name: string; diasActuales?: number }>>([])
  const [loadingFarms, setLoadingFarms] = React.useState(false)
  const [loadingSheds, setLoadingSheds] = React.useState(false)
  const [loadingLotes, setLoadingLotes] = React.useState(false)

  React.useEffect(() => {
    let mounted = true
    setLoadingFarms(true)
    import("@/lib/repositories/farm.repository").then((mod) => {
      return mod.farmRepository.getAll()
    }).then((data) => {
      if (mounted) setFarms(data.map((f: any) => ({ id: String(f.id), name: f.name })))
    }).catch(() => {
      // keep fallback empty
    }).finally(() => mounted && setLoadingFarms(false))
    return () => { mounted = false }
  }, [])

  React.useEffect(() => {
    if (!selectedFarm) {
      setSheds([])
      return
    }
    let mounted = true
    setLoadingSheds(true)
    import("@/lib/repositories/shed.repository").then((mod) => mod.shedRepository.getByFarm(selectedFarm))
      .then((data) => {
        if (mounted) setSheds(data.map((s: any) => ({ id: String(s.id), name: s.name })))
      })
      .catch(() => {})
      .finally(() => mounted && setLoadingSheds(false))
    return () => { mounted = false }
  }, [selectedFarm])

  React.useEffect(() => {
    if (!selectedShed) {
      setLotes([])
      return
    }
    let mounted = true
    setLoadingLotes(true)
    import("@/lib/repositories/lote.repository").then((mod) => mod.loteRepository.getByShed(selectedShed))
      .then((data) => {
        if (mounted) setLotes(data.map((l: any) => ({ id: String(l.id), name: l.name, diasActuales: l.current_age_days ?? l.diasActuales })))
      })
      .catch(() => {})
      .finally(() => mounted && setLoadingLotes(false))
    return () => { mounted = false }
  }, [selectedShed])

  const selectedLoteData = lotes.find((lote) => lote.id === selectedLote)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Seleccionar Granja
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedFarm ?? ""} onValueChange={onFarmChange}>
            <SelectTrigger>
              <SelectValue placeholder={loadingFarms ? "Cargando..." : "Seleccionar granja"} />
            </SelectTrigger>
            <SelectContent>
              {farms.map((farm) => (
                <SelectItem key={farm.id} value={farm.id}>
                  {farm.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Seleccionar Galpón
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedShed ?? ""} onValueChange={onShedChange}>
            <SelectTrigger>
              <SelectValue placeholder={loadingSheds ? "Cargando..." : "Seleccionar galpón"} />
            </SelectTrigger>
            <SelectContent>
              {sheds.map((shed) => (
                <SelectItem key={shed.id} value={shed.id}>
                  {shed.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Seleccionar Lote
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedLote ?? ""} onValueChange={onLoteChange}>
            <SelectTrigger>
              <SelectValue placeholder={loadingLotes ? "Cargando..." : "Seleccionar lote"} />
            </SelectTrigger>
            <SelectContent>
              {lotes.map((lote) => (
                <SelectItem key={lote.id} value={lote.id}>
                  {lote.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedLoteData && (
        <Card>
          <CardHeader>
            <CardTitle>Información del Lote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Lote:</span>
                <p className="font-semibold">{selectedLoteData.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Día:</span>
                <p className="font-semibold">{selectedLoteData.diasActuales ?? "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

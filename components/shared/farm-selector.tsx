"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Home, Calendar } from "lucide-react"

interface FarmSelectorProps {
  selectedFarm: string
  selectedShed: string
  selectedLote: string
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
  const farms = [
    { id: "granja-1", name: "Granja Norte", sheds: 8, status: "activa" },
    { id: "granja-2", name: "Granja Sur", sheds: 6, status: "activa" },
    { id: "granja-3", name: "Granja Este", sheds: 10, status: "mantenimiento" },
  ]

  const sheds = [
    { id: "galpon-1", name: "Galpón 1", capacity: 1200, current: 1150 },
    { id: "galpon-2", name: "Galpón 2", capacity: 1200, current: 1180 },
    { id: "galpon-3", name: "Galpón 3", capacity: 1200, current: 1100 },
    { id: "galpon-4", name: "Galpón 4", capacity: 1200, current: 1190 },
  ]

  const lotes = [
    {
      id: "lote-09",
      name: "Lote 09",
      fechaInicio: "2023-10-16",
      raza: "Cobb 500",
      proveedor: "Incuves",
      pollosIniciales: 9549,
      diasActuales: 35,
      status: "activo",
    },
    {
      id: "lote-10",
      name: "Lote 10",
      fechaInicio: "2023-11-01",
      raza: "Ross 308",
      proveedor: "Aviagen",
      pollosIniciales: 8750,
      diasActuales: 20,
      status: "activo",
    },
  ]

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
          <Select value={selectedFarm} onValueChange={onFarmChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar granja" />
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
          <Select value={selectedShed} onValueChange={onShedChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar galpón" />
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
          <Select value={selectedLote} onValueChange={onLoteChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar lote" />
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
                <p className="font-semibold">{selectedLoteData.diasActuales}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

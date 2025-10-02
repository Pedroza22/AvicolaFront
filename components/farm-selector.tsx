"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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
    {
      id: "lote-08",
      name: "Lote 08",
      fechaInicio: "2023-09-28",
      raza: "Cobb 500",
      proveedor: "Incuves",
      pollosIniciales: 9200,
      diasActuales: 49,
      status: "finalizando",
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
                  <div className="flex items-center justify-between w-full">
                    <span>{farm.name}</span>
                    <Badge variant={farm.status === "activa" ? "default" : "secondary"}>{farm.status}</Badge>
                  </div>
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
                  <div className="flex flex-col">
                    <span>{shed.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {shed.current}/{shed.capacity} pollos
                    </span>
                  </div>
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
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span>{lote.name}</span>
                      <Badge
                        variant="outline"
                        className={
                          lote.status === "activo"
                            ? "bg-green-50 text-green-700"
                            : lote.status === "finalizando"
                              ? "bg-orange-50 text-orange-700"
                              : "bg-gray-50 text-gray-700"
                        }
                      >
                        {lote.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {lote.raza} • Día {lote.diasActuales} • {lote.pollosIniciales.toLocaleString()} pollos
                    </span>
                  </div>
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
              <div>
                <span className="text-muted-foreground">Raza:</span>
                <p className="font-semibold">{selectedLoteData.raza}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Proveedor:</span>
                <p className="font-semibold">{selectedLoteData.proveedor}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Inicio:</span>
                <p className="font-semibold">{new Date(selectedLoteData.fechaInicio).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Pollos Iniciales:</span>
                <p className="font-semibold">{selectedLoteData.pollosIniciales.toLocaleString()}</p>
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span>Temperatura:</span>
                <span className="font-semibold">24°C</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Humedad:</span>
                <span className="font-semibold">65%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Ventilación:</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Óptima
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

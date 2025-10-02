"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Grid3X3, Maximize2, Search, Settings, Filter, Camera } from "lucide-react"
import { LiveStreamPlayer } from "./live-stream-player"
import type { Camera as CameraType } from "@/lib/types"

interface CameraGridProps {
  selectedFarm: string
  selectedShed: string
}

export function CameraGrid({ selectedFarm, selectedShed }: CameraGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "single">("grid")
  const [selectedCamera, setSelectedCamera] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const cameras: CameraType[] = [
    {
      id: "1",
      name: "Entrada Principal",
      status: "online",
      location: "Galpón 1 - Norte",
      resolution: "1080p",
      fps: 30,
      lastUpdate: "En vivo",
      shedId: "galpon-1",
    },
    {
      id: "2",
      name: "Área de Alimentación",
      status: "online",
      location: "Galpón 1 - Centro",
      resolution: "1080p",
      fps: 30,
      lastUpdate: "En vivo",
      shedId: "galpon-1",
    },
    {
      id: "3",
      name: "Zona de Descanso",
      status: "offline",
      location: "Galpón 1 - Sur",
      resolution: "720p",
      fps: 0,
      lastUpdate: "Hace 15 min",
      shedId: "galpon-1",
    },
    {
      id: "4",
      name: "Bebederos",
      status: "online",
      location: "Galpón 1 - Este",
      resolution: "1080p",
      fps: 25,
      lastUpdate: "En vivo",
      shedId: "galpon-1",
    },
  ]

  const filteredCameras = cameras.filter((camera) => camera.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Centro de Monitoreo</h2>
          <p className="text-muted-foreground">
            {selectedFarm} - {selectedShed} • {cameras.filter((c) => c.status === "online").length} de {cameras.length}{" "}
            cámaras activas
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cámaras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[200px]"
            />
          </div>
          <Select value={viewMode} onValueChange={(value: "grid" | "single") => setViewMode(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="h-4 w-4" />
                  Vista Grid
                </div>
              </SelectItem>
              <SelectItem value="single">
                <div className="flex items-center gap-2">
                  <Maximize2 className="h-4 w-4" />
                  Vista Individual
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Vista Grid */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCameras.map((camera) => (
            <LiveStreamPlayer key={camera.id} camera={camera} autoPlay={false} />
          ))}
        </div>
      )}

      {/* Vista Individual */}
      {viewMode === "single" && (
        <div className="space-y-4">
          {/* Selector de Cámara */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filteredCameras.map((camera) => (
              <Button
                key={camera.id}
                variant={selectedCamera === Number.parseInt(camera.id) ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCamera(Number.parseInt(camera.id))}
                className="whitespace-nowrap"
              >
                <Camera className="h-4 w-4 mr-2" />
                {camera.name}
              </Button>
            ))}
          </div>

          {/* Reproductor Grande */}
          {selectedCamera && (
            <LiveStreamPlayer
              camera={filteredCameras.find((c) => c.id === selectedCamera.toString())!}
              className="lg:col-span-2"
              autoPlay
            />
          )}
        </div>
      )}

      {/* Empty State */}
      {filteredCameras.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Camera className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No se encontraron cámaras</p>
            <p className="text-muted-foreground">Intenta con otros términos de búsqueda</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Camera,
  Play,
  Pause,
  Maximize,
  Settings,
  RepeatIcon as Record,
  Download,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Volume2,
  VolumeX,
  Grid3X3,
  Maximize2,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react"

interface CameraGridProps {
  selectedFarm: string
  selectedShed: string
}

export function CameraGrid({ selectedFarm, selectedShed }: CameraGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "single">("grid")
  const [selectedCamera, setSelectedCamera] = useState<number | null>(null)
  const [isRecording, setIsRecording] = useState<Record<number, boolean>>({})
  const [isMuted, setIsMuted] = useState<Record<number, boolean>>({})

  const cameras = [
    {
      id: 1,
      name: "Entrada Principal",
      status: "online",
      location: "Galpón 1 - Norte",
      resolution: "1080p",
      fps: 30,
      lastUpdate: "Hace 2 min",
    },
    {
      id: 2,
      name: "Área de Alimentación",
      status: "online",
      location: "Galpón 1 - Centro",
      resolution: "1080p",
      fps: 30,
      lastUpdate: "En vivo",
    },
    {
      id: 3,
      name: "Zona de Descanso",
      status: "offline",
      location: "Galpón 1 - Sur",
      resolution: "720p",
      fps: 0,
      lastUpdate: "Hace 15 min",
    },
    {
      id: 4,
      name: "Bebederos",
      status: "online",
      location: "Galpón 1 - Este",
      resolution: "1080p",
      fps: 25,
      lastUpdate: "En vivo",
    },
    {
      id: 5,
      name: "Ventilación",
      status: "warning",
      location: "Galpón 1 - Oeste",
      resolution: "720p",
      fps: 15,
      lastUpdate: "Hace 1 min",
    },
    {
      id: 6,
      name: "Salida de Emergencia",
      status: "online",
      location: "Galpón 1 - Sur",
      resolution: "1080p",
      fps: 30,
      lastUpdate: "En vivo",
    },
  ]

  const toggleRecording = (cameraId: number) => {
    setIsRecording((prev) => ({
      ...prev,
      [cameraId]: !prev[cameraId],
    }))
  }

  const toggleMute = (cameraId: number) => {
    setIsMuted((prev) => ({
      ...prev,
      [cameraId]: !prev[cameraId],
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-50 text-green-700 border-green-200"
      case "offline":
        return "bg-red-50 text-red-700 border-red-200"
      case "warning":
        return "bg-orange-50 text-orange-700 border-orange-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <Wifi className="h-3 w-3" />
      case "offline":
        return <WifiOff className="h-3 w-3" />
      case "warning":
        return <AlertCircle className="h-3 w-3" />
      default:
        return <Camera className="h-3 w-3" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header de Cámaras */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Centro de Monitoreo</h2>
          <p className="text-muted-foreground">
            {selectedFarm} - {selectedShed} • {cameras.filter((c) => c.status === "online").length} de {cameras.length}{" "}
            cámaras activas
          </p>
        </div>
        <div className="flex gap-2">
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
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
          <Button>
            <Record className="h-4 w-4 mr-2" />
            Grabar Todo
          </Button>
        </div>
      </div>

      {/* Vista Grid */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cameras.map((camera) => (
            <Card key={camera.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{camera.name}</CardTitle>
                  <Badge variant="outline" className={getStatusColor(camera.status)}>
                    {getStatusIcon(camera.status)}
                    <span className="ml-1 capitalize">
                      {camera.status === "online"
                        ? "En línea"
                        : camera.status === "offline"
                          ? "Desconectada"
                          : "Advertencia"}
                    </span>
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{camera.location}</span>
                  <span>
                    {camera.resolution} • {camera.fps}fps
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-video bg-gray-900 relative group">
                  {camera.status === "online" || camera.status === "warning" ? (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <div className="text-center">
                          <Camera className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">Transmisión en vivo</p>
                          <p className="text-xs opacity-75">{camera.lastUpdate}</p>
                        </div>
                      </div>

                      {/* Controles superpuestos */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary" onClick={() => toggleRecording(camera.id)}>
                            <Record className={`h-3 w-3 ${isRecording[camera.id] ? "text-red-500" : ""}`} />
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => toggleMute(camera.id)}>
                            {isMuted[camera.id] ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="secondary">
                                <Maximize className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>
                                  {camera.name} - {camera.location}
                                </DialogTitle>
                              </DialogHeader>
                              <CameraFullView camera={camera} />
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>

                      {/* Indicador de grabación */}
                      {isRecording[camera.id] && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded text-xs">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          REC
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <WifiOff className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Sin señal</p>
                        <p className="text-xs">{camera.lastUpdate}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 border-t">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" disabled={camera.status === "offline"}>
                      <Play className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    <Button size="sm" variant="outline" disabled={camera.status === "offline"}>
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Vista Individual */}
      {viewMode === "single" && (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {cameras.map((camera) => (
              <Button
                key={camera.id}
                variant={selectedCamera === camera.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCamera(camera.id)}
                className="whitespace-nowrap"
              >
                {getStatusIcon(camera.status)}
                <span className="ml-2">{camera.name}</span>
              </Button>
            ))}
          </div>

          {selectedCamera && (
            <Card>
              <CardContent className="p-0">
                <CameraFullView camera={cameras.find((c) => c.id === selectedCamera)!} />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

// Componente para vista completa de cámara
function CameraFullView({ camera }: { camera: any }) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [zoom, setZoom] = useState(100)

  return (
    <div className="space-y-4">
      <div className="aspect-video bg-gray-900 relative rounded-lg overflow-hidden">
        {camera.status === "online" || camera.status === "warning" ? (
          <>
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <Camera className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg">Transmisión en vivo</p>
                <p className="text-sm opacity-75">
                  {camera.resolution} • {camera.fps}fps
                </p>
              </div>
            </div>

            {/* Controles de video */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/70 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? <Pause className="h-4 w-4 text-white" /> : <Play className="h-4 w-4 text-white" />}
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Volume2 className="h-4 w-4 text-white" />
                  </Button>
                  <span className="text-white text-sm">{camera.lastUpdate}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setZoom(Math.max(50, zoom - 25))}>
                    <ZoomOut className="h-4 w-4 text-white" />
                  </Button>
                  <span className="text-white text-sm">{zoom}%</span>
                  <Button size="sm" variant="ghost" onClick={() => setZoom(Math.min(200, zoom + 25))}>
                    <ZoomIn className="h-4 w-4 text-white" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <RotateCw className="h-4 w-4 text-white" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Record className="h-4 w-4 text-white" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Download className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <WifiOff className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg">Cámara desconectada</p>
              <p className="text-sm">{camera.lastUpdate}</p>
            </div>
          </div>
        )}
      </div>

      {/* Información de la cámara */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Estado:</span>
          <p className="font-semibold capitalize">{camera.status}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Resolución:</span>
          <p className="font-semibold">{camera.resolution}</p>
        </div>
        <div>
          <span className="text-muted-foreground">FPS:</span>
          <p className="font-semibold">{camera.fps}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Ubicación:</span>
          <p className="font-semibold">{camera.location}</p>
        </div>
      </div>
    </div>
  )
}

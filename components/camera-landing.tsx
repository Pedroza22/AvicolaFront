"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Camera,
  Monitor,
  Wifi,
  WifiOff,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Download,
  Clock,
  HardDrive,
} from "lucide-react"

export function CameraLanding() {
  const [searchTerm, setSearchTerm] = useState("")

  const cameraStats = {
    total: 24,
    online: 20,
    offline: 2,
    warning: 2,
    recording: 18,
    storage: "2.4 TB / 5 TB",
  }

  const recentEvents = [
    { id: 1, camera: "Galpón 1 - Entrada", event: "Movimiento detectado", time: "Hace 2 min", type: "info" },
    { id: 2, camera: "Galpón 2 - Alimentación", event: "Cámara desconectada", time: "Hace 5 min", type: "error" },
    { id: 3, camera: "Galpón 1 - Bebederos", event: "Grabación iniciada", time: "Hace 8 min", type: "success" },
    { id: 4, camera: "Galpón 3 - Ventilación", event: "Calidad de imagen baja", time: "Hace 12 min", type: "warning" },
  ]

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Centro de Cámaras</h1>
          <p className="text-muted-foreground">Monitoreo y gestión de todas las cámaras del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Grabaciones
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Cámara
          </Button>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cámaras</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cameraStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Línea</CardTitle>
            <Wifi className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{cameraStats.online}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Desconectadas</CardTitle>
            <WifiOff className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{cameraStats.offline}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Advertencias</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{cameraStats.warning}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grabando</CardTitle>
            <Monitor className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{cameraStats.recording}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Almacenamiento</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">{cameraStats.storage}</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: "48%" }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="monitor" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monitor">Monitoreo</TabsTrigger>
          <TabsTrigger value="recordings">Grabaciones</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
        </TabsList>

        <TabsContent value="monitor" className="space-y-4">
          {/* Filtros y Búsqueda */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cámaras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          {/* Aquí se incluiría el CameraGrid existente */}
          <div className="text-center py-8 text-muted-foreground">
            <Camera className="h-12 w-12 mx-auto mb-4" />
            <p>El grid de cámaras se mostraría aquí</p>
            <p className="text-sm">Usa el componente CameraGrid existente</p>
          </div>
        </TabsContent>

        <TabsContent value="recordings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grabaciones Recientes</CardTitle>
              <CardDescription>Últimas grabaciones de todas las cámaras</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <Camera className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium">Galpón {i} - Entrada Principal</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date().toLocaleDateString()} • 2:30:45 duración
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">1080p</Badge>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Grabación</CardTitle>
                <CardDescription>Ajustes generales para todas las cámaras</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-record">Grabación Automática</Label>
                  <Switch id="auto-record" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="motion-detect">Detección de Movimiento</Label>
                  <Switch id="motion-detect" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="night-vision">Visión Nocturna</Label>
                  <Switch id="night-vision" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retention">Retención de Grabaciones (días)</Label>
                  <Input id="retention" type="number" defaultValue="30" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuración de Calidad</CardTitle>
                <CardDescription>Ajustes de video y audio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resolution">Resolución por Defecto</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option>1080p (Recomendado)</option>
                    <option>720p</option>
                    <option>480p</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fps">Frames por Segundo</Label>
                  <Input id="fps" type="number" defaultValue="30" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="audio">Grabación de Audio</Label>
                  <Switch id="audio" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eventos Recientes</CardTitle>
              <CardDescription>Actividad y alertas del sistema de cámaras</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        event.type === "error"
                          ? "bg-red-500"
                          : event.type === "warning"
                            ? "bg-orange-500"
                            : event.type === "success"
                              ? "bg-green-500"
                              : "bg-blue-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{event.camera}</p>
                      <p className="text-sm text-muted-foreground">{event.event}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {event.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

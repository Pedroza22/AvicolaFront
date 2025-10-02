"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clipboard, Save, Calendar } from "lucide-react"

export function GalponeroForms() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Formularios de Galponero</h2>
          <p className="text-muted-foreground">Registro diario de actividades del galpón</p>
        </div>
        <Badge variant="outline" className="bg-orange-50 text-orange-700">
          <Clipboard className="h-3 w-3 mr-1" />
          Galponero
        </Badge>
      </div>

      <Tabs defaultValue="registro-diario" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="registro-diario">Registro Diario</TabsTrigger>
          <TabsTrigger value="inventario">Control Inventario</TabsTrigger>
          <TabsTrigger value="mortalidad">Mortalidad</TabsTrigger>
        </TabsList>

        <TabsContent value="registro-diario" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Registro Diario</CardTitle>
              <CardDescription>Formulario de registro en desarrollo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Registro
                </Button>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver Historial
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventario" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Control de Inventario</CardTitle>
              <CardDescription>Formulario en desarrollo</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Próximamente</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mortalidad" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Mortalidad</CardTitle>
              <CardDescription>Formulario en desarrollo</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Próximamente</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

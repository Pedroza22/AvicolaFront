"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clipboard, Save, Calendar } from "lucide-react"
import { DailyRecordForm } from "@/components/forms/daily-record-form"
import { useLotes } from "@/lib/hooks/use-lotes"
import { useDailyRecords } from "@/lib/hooks/use-daily-records"
import { useAppState } from "@/lib/hooks/use-app-state"
import type { DailyRecord } from "@/lib/types"

export function GalponeroForms() {
  const { selectedLote, user } = useAppState()
  const { lotes, loading } = useLotes()
  const { createRecord } = useDailyRecords(selectedLote || lotes[0]?.id || "")

  const handleSave = async (record: Partial<DailyRecord>) => {
    const payload: Omit<DailyRecord, "id"> = {
      fecha: record.fecha!,
      loteId: record.loteId!,
      diaLote: record.diaLote!,
      numeroPollos: record.numeroPollos!,
      pesoPromedio: record.pesoPromedio || 0,
      consumoAlimento: record.consumoAlimento!,
      totalBultos: record.totalBultos || 0,
      consumoSemanal: record.consumoSemanal || 0,
      observaciones: record.observaciones || "",
      createdBy: user?.id || "system",
    }
    await createRecord(payload)
  }

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
              <CardDescription>Registra consumo y peso diario del lote</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-sm text-muted-foreground">Cargando lotes...</div>
              ) : (
                <DailyRecordForm lotes={lotes} onSave={handleSave} />
              )}
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

export default GalponeroForms

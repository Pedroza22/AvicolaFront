"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Calendar, Calculator, Clipboard } from "lucide-react"
import { useConsumption } from "@/lib/hooks/use-consumption"
import { WEEKDAYS } from "@/lib/constants"
import type { DailyRecord, Lote } from "@/lib/types"

interface DailyRecordFormProps {
  lotes: Lote[]
  onSave: (record: Partial<DailyRecord>) => void
}

export function DailyRecordForm({ lotes, onSave }: DailyRecordFormProps) {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    loteId: lotes[0]?.id || "",
    diaLote: lotes[0]?.diasActuales || 0,
    numeroPollos: lotes[0]?.pollosActuales || 0,
    pesoPromedio: 0,
    observaciones: "",
  })

  const { consumption, totalBultos, consumoSemanal, updateDay } = useConsumption({
    lunes: 0,
    martes: 0,
    miercoles: 0,
    jueves: 0,
    viernes: 0,
    sabado: 0,
    domingo: 0,
  })

  const handleLoteChange = (loteId: string) => {
    const selectedLote = lotes.find((l) => l.id === loteId)
    if (selectedLote) {
      setFormData({
        ...formData,
        loteId,
        diaLote: selectedLote.diasActuales,
        numeroPollos: selectedLote.pollosActuales,
      })
    }
  }

  const handleSave = () => {
    const record: Partial<DailyRecord> = {
      ...formData,
      consumoAlimento: consumption,
      totalBultos,
      consumoSemanal,
    }
    onSave(record)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clipboard className="h-5 w-5" />
            Información del Lote
          </CardTitle>
          <CardDescription>Datos básicos del galpón y lote actual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="dia-lote">Día del Lote</Label>
              <Input id="dia-lote" type="number" value={formData.diaLote} readOnly className="bg-gray-50" />
            </div>
          </div>

          <div>
            <Label htmlFor="lote">Lote</Label>
            <Select value={formData.loteId} onValueChange={handleLoteChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar lote" />
              </SelectTrigger>
              <SelectContent>
                {lotes.map((lote) => (
                  <SelectItem key={lote.id} value={lote.id}>
                    <div className="flex flex-col">
                      <span>{lote.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {lote.raza} • Día {lote.diasActuales}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numero-pollos">Número de Pollos</Label>
              <Input id="numero-pollos" type="number" value={formData.numeroPollos} readOnly className="bg-gray-50" />
            </div>
            <div>
              <Label htmlFor="peso-promedio">Peso Promedio (gr)</Label>
              <Input
                id="peso-promedio"
                type="number"
                step="0.1"
                value={formData.pesoPromedio}
                onChange={(e) => setFormData({ ...formData, pesoPromedio: Number.parseFloat(e.target.value) })}
                placeholder="Ej: 2100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Consumo de Alimento Diario</CardTitle>
          <CardDescription>Registro de bultos consumidos por día (40kg/bulto)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {WEEKDAYS.map((day) => (
              <div key={day}>
                <Label htmlFor={day} className="capitalize">
                  {day}
                </Label>
                <Input
                  id={day}
                  type="number"
                  step="0.5"
                  value={consumption[day]}
                  onChange={(e) => updateDay(day, Number.parseFloat(e.target.value) || 0)}
                  placeholder="Bultos"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <Label>Total Bultos Semana</Label>
              <Input value={totalBultos.toFixed(1)} readOnly className="bg-gray-50 font-semibold text-green-700" />
              <p className="text-xs text-muted-foreground mt-1">Suma automática</p>
            </div>
            <div>
              <Label>Consumo Semanal (kg)</Label>
              <Input value={consumoSemanal.toFixed(0)} readOnly className="bg-gray-50 font-semibold text-blue-700" />
              <p className="text-xs text-muted-foreground mt-1">Total bultos × 40kg</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <Calculator className="h-4 w-4" />
              <span className="font-medium">Cálculo Automático:</span>
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {totalBultos.toFixed(1)} bultos × 40kg = {consumoSemanal.toFixed(0)}kg de alimento semanal
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Observaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.observaciones}
            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            placeholder="Observaciones del día: comportamiento de los pollos, condiciones ambientales, incidencias..."
            rows={4}
          />
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSave} className="flex-1">
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
    </div>
  )
}

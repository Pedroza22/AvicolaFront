"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Plus, Trash2, Calendar, Package, Clipboard, AlertCircle, Calculator } from "lucide-react"

export function GalponeroForms() {
  const [selectedForm, setSelectedForm] = useState("registro-diario")

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

      <Tabs value={selectedForm} onValueChange={setSelectedForm} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="registro-diario">Registro Diario</TabsTrigger>
          <TabsTrigger value="inventario">Control Inventario</TabsTrigger>
          <TabsTrigger value="mortalidad">Mortalidad</TabsTrigger>
        </TabsList>

        <TabsContent value="registro-diario" className="space-y-6">
          <RegistroDiarioForm />
        </TabsContent>

        <TabsContent value="inventario" className="space-y-6">
          <InventarioForm />
        </TabsContent>

        <TabsContent value="mortalidad" className="space-y-6">
          <MortalidadForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function RegistroDiarioForm() {
  const [lotes] = useState([
    { id: "lote-09", name: "Lote 09", raza: "Cobb 500", pollosIniciales: 9549, diasActuales: 35 },
    { id: "lote-10", name: "Lote 10", raza: "Ross 308", pollosIniciales: 8750, diasActuales: 20 },
    { id: "lote-08", name: "Lote 08", raza: "Cobb 500", pollosIniciales: 9200, diasActuales: 49 },
  ])

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    granja: "oasis",
    galpon: "4",
    lote: "lote-09",
    diaLote: "35",
    numeroPollos: "9549",
    pesoPromedio: "",
    consumoAlimento: {
      lunes: "",
      martes: "",
      miercoles: "",
      jueves: "",
      viernes: "",
      sabado: "",
      domingo: "",
    },
    totalBultos: "0",
    consumoSemanal: "0",
    observaciones: "",
  })

  // Cálculo automático de totales
  useEffect(() => {
    const { lunes, martes, miercoles, jueves, viernes, sabado, domingo } = formData.consumoAlimento

    // Convertir a números y sumar (si están vacíos, usar 0)
    const totalBultos = [lunes, martes, miercoles, jueves, viernes, sabado, domingo].reduce(
      (sum, value) => sum + (Number.parseFloat(value) || 0),
      0,
    )

    // Calcular consumo semanal en kg (40kg por bulto estándar)
    const consumoSemanalKg = totalBultos * 40

    setFormData((prev) => ({
      ...prev,
      totalBultos: totalBultos.toFixed(1),
      consumoSemanal: consumoSemanalKg.toFixed(0),
    }))
  }, [formData.consumoAlimento])

  const handleSave = () => {
    console.log("Guardando registro diario:", formData)
    // Aquí se enviaría la data al backend
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
              <Input
                id="dia-lote"
                type="number"
                value={formData.diaLote}
                onChange={(e) => setFormData({ ...formData, diaLote: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="granja">Granja</Label>
              <Select value={formData.granja} onValueChange={(value) => setFormData({ ...formData, granja: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oasis">Oasis</SelectItem>
                  <SelectItem value="san-lorenzo">San Lorenzo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="galpon">Galpón</Label>
              <Input
                id="galpon"
                value={formData.galpon}
                onChange={(e) => setFormData({ ...formData, galpon: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="lote">Lote</Label>
              <Select
                value={formData.lote}
                onValueChange={(value) => {
                  const selectedLote = lotes.find((l) => l.id === value)
                  setFormData({
                    ...formData,
                    lote: value,
                    numeroPollos: selectedLote?.pollosIniciales.toString() || "",
                    diaLote: selectedLote?.diasActuales.toString() || "",
                  })
                }}
              >
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numero-pollos">Número de Pollos</Label>
              <Input
                id="numero-pollos"
                type="number"
                value={formData.numeroPollos}
                onChange={(e) => setFormData({ ...formData, numeroPollos: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="peso-promedio">Peso Promedio (gr)</Label>
              <Input
                id="peso-promedio"
                type="number"
                step="0.1"
                value={formData.pesoPromedio}
                onChange={(e) => setFormData({ ...formData, pesoPromedio: e.target.value })}
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
            <div>
              <Label htmlFor="lunes">Lunes</Label>
              <Input
                id="lunes"
                type="number"
                step="0.5"
                value={formData.consumoAlimento.lunes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    consumoAlimento: { ...formData.consumoAlimento, lunes: e.target.value },
                  })
                }
                placeholder="Bultos"
              />
            </div>
            <div>
              <Label htmlFor="martes">Martes</Label>
              <Input
                id="martes"
                type="number"
                step="0.5"
                value={formData.consumoAlimento.martes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    consumoAlimento: { ...formData.consumoAlimento, martes: e.target.value },
                  })
                }
                placeholder="Bultos"
              />
            </div>
            <div>
              <Label htmlFor="miercoles">Miércoles</Label>
              <Input
                id="miercoles"
                type="number"
                step="0.5"
                value={formData.consumoAlimento.miercoles}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    consumoAlimento: { ...formData.consumoAlimento, miercoles: e.target.value },
                  })
                }
                placeholder="Bultos"
              />
            </div>
            <div>
              <Label htmlFor="jueves">Jueves</Label>
              <Input
                id="jueves"
                type="number"
                step="0.5"
                value={formData.consumoAlimento.jueves}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    consumoAlimento: { ...formData.consumoAlimento, jueves: e.target.value },
                  })
                }
                placeholder="Bultos"
              />
            </div>
            <div>
              <Label htmlFor="viernes">Viernes</Label>
              <Input
                id="viernes"
                type="number"
                step="0.5"
                value={formData.consumoAlimento.viernes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    consumoAlimento: { ...formData.consumoAlimento, viernes: e.target.value },
                  })
                }
                placeholder="Bultos"
              />
            </div>
            <div>
              <Label htmlFor="sabado">Sábado</Label>
              <Input
                id="sabado"
                type="number"
                step="0.5"
                value={formData.consumoAlimento.sabado}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    consumoAlimento: { ...formData.consumoAlimento, sabado: e.target.value },
                  })
                }
                placeholder="Bultos"
              />
            </div>
            <div>
              <Label htmlFor="domingo">Domingo</Label>
              <Input
                id="domingo"
                type="number"
                step="0.5"
                value={formData.consumoAlimento.domingo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    consumoAlimento: { ...formData.consumoAlimento, domingo: e.target.value },
                  })
                }
                placeholder="Bultos"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <Label htmlFor="total-bultos">Total Bultos Semana</Label>
              <Input
                id="total-bultos"
                type="number"
                value={formData.totalBultos}
                readOnly
                className="bg-gray-50 font-semibold text-green-700"
                placeholder="Calculado automáticamente"
              />
              <p className="text-xs text-muted-foreground mt-1">Suma automática L+M+M+J+V+S+D</p>
            </div>
            <div>
              <Label htmlFor="consumo-semanal">Consumo Semanal (kg)</Label>
              <Input
                id="consumo-semanal"
                type="number"
                value={formData.consumoSemanal}
                readOnly
                className="bg-gray-50 font-semibold text-blue-700"
                placeholder="Calculado automáticamente"
              />
              <p className="text-xs text-muted-foreground mt-1">Total bultos × 40kg</p>
            </div>
          </div>

          {/* Indicador visual de cálculo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <Calculator className="h-4 w-4" />
              <span className="font-medium">Cálculo Automático:</span>
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {formData.totalBultos} bultos × 40kg = {formData.consumoSemanal}kg de alimento semanal
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

function InventarioForm() {
  const [inventarioItems, setInventarioItems] = useState([
    { id: 1, producto: "Alimento Iniciador", entrada: "", salida: "", stock: "150", unidad: "bultos" },
    { id: 2, producto: "Alimento Crecimiento", entrada: "", salida: "", stock: "200", unidad: "bultos" },
    { id: 3, producto: "Alimento Finalizador", entrada: "", salida: "", stock: "180", unidad: "bultos" },
    { id: 4, producto: "Antibiótico", entrada: "", salida: "", stock: "25", unidad: "frascos" },
    { id: 5, producto: "Vacuna Newcastle", entrada: "", salida: "", stock: "12", unidad: "dosis" },
  ])

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      producto: "",
      entrada: "",
      salida: "",
      stock: "",
      unidad: "bultos",
    }
    setInventarioItems([...inventarioItems, newItem])
  }

  const removeItem = (id: number) => {
    setInventarioItems(inventarioItems.filter((item) => item.id !== id))
  }

  const updateItem = (id: number, field: string, value: string) => {
    setInventarioItems(inventarioItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Control de Inventario Diario
        </CardTitle>
        <CardDescription>Registro de entradas y salidas de productos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-6 gap-4 font-semibold text-sm border-b pb-2">
            <div>Producto</div>
            <div>Entrada</div>
            <div>Salida</div>
            <div>Stock Actual</div>
            <div>Unidad</div>
            <div>Acciones</div>
          </div>

          {inventarioItems.map((item) => (
            <div key={item.id} className="grid grid-cols-6 gap-4 items-center">
              <Input
                value={item.producto}
                onChange={(e) => updateItem(item.id, "producto", e.target.value)}
                placeholder="Nombre del producto"
              />
              <Input
                type="number"
                value={item.entrada}
                onChange={(e) => updateItem(item.id, "entrada", e.target.value)}
                placeholder="0"
              />
              <Input
                type="number"
                value={item.salida}
                onChange={(e) => updateItem(item.id, "salida", e.target.value)}
                placeholder="0"
              />
              <Input
                type="number"
                value={item.stock}
                onChange={(e) => updateItem(item.id, "stock", e.target.value)}
                placeholder="0"
              />
              <Select value={item.unidad} onValueChange={(value) => updateItem(item.id, "unidad", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bultos">Bultos</SelectItem>
                  <SelectItem value="kg">Kg</SelectItem>
                  <SelectItem value="frascos">Frascos</SelectItem>
                  <SelectItem value="dosis">Dosis</SelectItem>
                  <SelectItem value="litros">Litros</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => removeItem(item.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}

          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </Button>
            <Button className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Guardar Inventario
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MortalidadForm() {
  const [mortalidadData, setMortalidadData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    mortalidadDia: "",
    causas: {
      enfermedad: "",
      accidente: "",
      estres: "",
      otros: "",
    },
    observaciones: "",
    accionesTomadas: "",
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Registro de Mortalidad
          </CardTitle>
          <CardDescription>Control diario de bajas en el galpón</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="fecha-mortalidad">Fecha</Label>
            <Input
              id="fecha-mortalidad"
              type="date"
              value={mortalidadData.fecha}
              onChange={(e) => setMortalidadData({ ...mortalidadData, fecha: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="mortalidad-dia">Mortalidad del Día</Label>
            <Input
              id="mortalidad-dia"
              type="number"
              value={mortalidadData.mortalidadDia}
              onChange={(e) => setMortalidadData({ ...mortalidadData, mortalidadDia: e.target.value })}
              placeholder="Número de pollos"
            />
          </div>

          <div className="space-y-3">
            <Label>Causas de Mortalidad</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="enfermedad" className="text-sm">
                  Enfermedad
                </Label>
                <Input
                  id="enfermedad"
                  type="number"
                  value={mortalidadData.causas.enfermedad}
                  onChange={(e) =>
                    setMortalidadData({
                      ...mortalidadData,
                      causas: { ...mortalidadData.causas, enfermedad: e.target.value },
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="accidente" className="text-sm">
                  Accidente
                </Label>
                <Input
                  id="accidente"
                  type="number"
                  value={mortalidadData.causas.accidente}
                  onChange={(e) =>
                    setMortalidadData({
                      ...mortalidadData,
                      causas: { ...mortalidadData.causas, accidente: e.target.value },
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="estres" className="text-sm">
                  Estrés
                </Label>
                <Input
                  id="estres"
                  type="number"
                  value={mortalidadData.causas.estres}
                  onChange={(e) =>
                    setMortalidadData({
                      ...mortalidadData,
                      causas: { ...mortalidadData.causas, estres: e.target.value },
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="otros" className="text-sm">
                  Otros
                </Label>
                <Input
                  id="otros"
                  type="number"
                  value={mortalidadData.causas.otros}
                  onChange={(e) =>
                    setMortalidadData({
                      ...mortalidadData,
                      causas: { ...mortalidadData.causas, otros: e.target.value },
                    })
                  }
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observaciones y Acciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="observaciones-mortalidad">Observaciones</Label>
            <Textarea
              id="observaciones-mortalidad"
              value={mortalidadData.observaciones}
              onChange={(e) => setMortalidadData({ ...mortalidadData, observaciones: e.target.value })}
              placeholder="Descripción detallada de las causas observadas..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="acciones-tomadas">Acciones Tomadas</Label>
            <Textarea
              id="acciones-tomadas"
              value={mortalidadData.accionesTomadas}
              onChange={(e) => setMortalidadData({ ...mortalidadData, accionesTomadas: e.target.value })}
              placeholder="Medidas correctivas aplicadas, tratamientos, etc..."
              rows={4}
            />
          </div>

          <Button className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Guardar Registro de Mortalidad
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, AlertTriangle, Home, MapPin, Calendar } from "lucide-react"
import { loteRepository } from "@/lib/repositories/lote.repository"
import { farmRepository } from "@/lib/repositories/farm.repository"
import { shedRepository } from "@/lib/repositories/shed.repository"
import type { Lote } from "@/lib/types"

interface DashboardStatsProps {
  selectedFarm?: string
  selectedShed?: string
  selectedLote?: string
  galponeroData?: any
}

export function DashboardStats({ selectedFarm, selectedShed, selectedLote, galponeroData }: DashboardStatsProps) {
  const [loteData, setLoteData] = useState<Lote | null>(null)
  const [generalStats, setGeneralStats] = useState({
    totalFarms: 0,
    totalSheds: 0,
    totalLotes: 0,
    totalChickens: 0,
  })
  const [loading, setLoading] = useState(false)

  // Cargar estadísticas generales cuando no hay selección específica
  useEffect(() => {
    const loadGeneralStats = async () => {
      try {
        setLoading(true)
        const [farms, sheds, lotes] = await Promise.all([
          farmRepository.getAll(),
          shedRepository.getAll(),
          loteRepository.getActive(),
        ])

        const totalChickens = lotes.reduce((sum, lote) => {
          return sum + (lote.current_quantity || lote.pollosActuales || 0)
        }, 0)

        setGeneralStats({
          totalFarms: farms.length,
          totalSheds: sheds.length,
          totalLotes: lotes.length,
          totalChickens,
        })
      } catch (error) {
        console.error("Error loading general stats:", error)
      } finally {
        setLoading(false)
      }
    }

    if (!selectedLote) {
      loadGeneralStats()
    }
  }, [selectedLote])

  // Cargar datos específicos del lote cuando hay selección
  useEffect(() => {
    if (!selectedLote) {
      setLoteData(null)
      return
    }

    const loadLoteData = async () => {
      try {
        setLoading(true)
        const data = await loteRepository.getById(selectedLote)
        setLoteData(data)
      } catch (error) {
        console.error("Error loading lote data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadLoteData()
  }, [selectedLote])

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse bg-gray-100">
          <CardHeader><div className="h-6 bg-gray-200 rounded w-1/3"></div></CardHeader>
          <CardContent><div className="h-20 bg-gray-200 rounded"></div></CardContent>
        </Card>
      </div>
    )
  }

  // Mostrar estadísticas generales cuando no hay lote seleccionado
  if (!selectedLote) {
    return (
      <div className="space-y-4">
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-800">
              Estadísticas Generales del Comercio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Vista general de todas las operaciones. Selecciona una granja, galpón o lote para ver detalles específicos.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Granjas</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{generalStats.totalFarms}</div>
              <p className="text-xs text-muted-foreground">
                Granjas activas en el sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Galpones</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{generalStats.totalSheds}</div>
              <p className="text-xs text-muted-foreground">
                Galpones en operación
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lotes Activos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{generalStats.totalLotes}</div>
              <p className="text-xs text-muted-foreground">
                Lotes en producción
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Aves</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{generalStats.totalChickens.toLocaleString("es-ES")}</div>
              <p className="text-xs text-muted-foreground">
                Pollos en todos los lotes activos
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Estadísticas específicas del lote seleccionado
  const liveData = {
    pollosActivos: loteData?.current_quantity || loteData?.pollosActuales || galponeroData?.numeroPollos || 8450,
    pesoPromedio: loteData?.pesoPromedio || galponeroData?.pesoPromedio || 2.1,
    consumoDiario: galponeroData?.consumoAlimento || 58,
    mortalidadDia: galponeroData?.mortalidadDia || 5,
    diaLote: loteData?.current_age_days || loteData?.diasActuales || galponeroData?.diaLote || 35,
    conversionAlimenticia: 1.65,
    raza: loteData?.breed || loteData?.raza || galponeroData?.raza || "Cobb 500",
    mortalidadTotal: loteData?.mortalidadTotal || 0,
  }

  const loteIdDisplay = loteData?.id ?? (typeof selectedLote === "string"
    ? (selectedLote.startsWith("lote-") ? selectedLote.replace("lote-", "") : selectedLote)
    : undefined)

  const loteDisplay = loteData?.name || `Lote ${loteIdDisplay ?? "—"}`
  const tasaMortalidadHoy = liveData.pollosActivos > 0 
    ? ((liveData.mortalidadDia / liveData.pollosActivos) * 100).toFixed(2)
    : "0.00"

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">
            {loteDisplay} - {selectedFarm} {selectedShed}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-blue-600">Lote:</span>
              <p className="font-bold text-lg">{loteDisplay}</p>
            </div>
            <div>
              <span className="text-blue-600">Día del Lote:</span>
              <p className="font-bold text-lg">{liveData.diaLote}</p>
            </div>
            <div>
              <span className="text-blue-600">Raza:</span>
              <p className="font-bold text-sm">{liveData.raza}</p>
            </div>
            <div>
              <span className="text-blue-600">Pollos Activos:</span>
              <p className="font-bold text-lg">{liveData.pollosActivos.toLocaleString("es-ES")}</p>
            </div>
            <div>
              <span className="text-blue-600">Última Actualización:</span>
              <p className="font-bold text-sm">Hace 2 horas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pollos Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveData.pollosActivos.toLocaleString("es-ES")}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">Día {liveData.diaLote}</span> del lote
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mortalidad Hoy</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveData.mortalidadDia}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`${parseFloat(tasaMortalidadHoy) > 1 ? 'text-red-600' : 'text-green-600'}`}>
                {tasaMortalidadHoy}%
              </span> del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peso Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveData.pesoPromedio} kg</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{liveData.consumoDiario}g</span> ganancia diaria
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversión Alimenticia</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveData.conversionAlimenticia}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">Óptimo</span> rango objetivo
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

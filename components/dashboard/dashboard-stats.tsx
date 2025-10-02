import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, AlertTriangle } from "lucide-react"

interface DashboardStatsProps {
  selectedFarm: string
  selectedShed: string
  selectedLote: string
  galponeroData?: any
}

export function DashboardStats({ selectedFarm, selectedShed, selectedLote, galponeroData }: DashboardStatsProps) {
  const liveData = {
    pollosActivos: galponeroData?.numeroPollos || 8450,
    pesoPromedio: galponeroData?.pesoPromedio || 2.1,
    consumoDiario: galponeroData?.consumoAlimento || 58,
    mortalidadDia: galponeroData?.mortalidadDia || 5,
    diaLote: galponeroData?.diaLote || 35,
    conversionAlimenticia: 1.65,
  }

  const loteDisplay = selectedLote.replace("lote-", "Lote ")

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
              <p className="font-bold text-sm">{galponeroData?.raza || "Cobb 500"}</p>
            </div>
            <div>
              <span className="text-blue-600">Pollos Activos:</span>
              <p className="font-bold text-lg">{liveData.pollosActivos.toLocaleString()}</p>
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
            <div className="text-2xl font-bold">{liveData.pollosActivos.toLocaleString()}</div>
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
              <span className="text-green-600">0.06%</span> del total
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

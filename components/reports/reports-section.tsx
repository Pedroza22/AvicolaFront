import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, BarChart3, TrendingUp, Users } from "lucide-react"

export function ReportsSection() {
  const reportTypes = [
    { id: "crecimiento", name: "Reporte de Crecimiento", icon: TrendingUp },
    { id: "mortalidad", name: "Análisis de Mortalidad", icon: BarChart3 },
    { id: "inventario", name: "Estado de Inventario", icon: FileText },
    { id: "produccion", name: "Productividad General", icon: Users },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reportes y Análisis</h2>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Exportar Todo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generar Reporte Personalizado</CardTitle>
          <CardDescription>Selecciona los parámetros para generar un reporte detallado</CardDescription>
        </CardHeader>
        <CardContent>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Generar Reporte
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

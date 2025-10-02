import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/date-picker-range"
import { FileText, Download, Calendar, BarChart3, TrendingUp, Users } from "lucide-react"

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
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Reporte</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Granja</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las granjas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las granjas</SelectItem>
                  <SelectItem value="granja-1">Granja Norte</SelectItem>
                  <SelectItem value="granja-2">Granja Sur</SelectItem>
                  <SelectItem value="granja-3">Granja Este</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Período</label>
              <DatePickerWithRange />
            </div>
          </div>

          <div className="flex gap-2">
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Generar Reporte
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Programar Envío
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportTypes.map((type) => (
          <Card key={type.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <type.icon className="h-5 w-5" />
                {type.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Último reporte generado hace 2 horas</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <FileText className="h-3 w-3 mr-1" />
                  Ver
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-3 w-3 mr-1" />
                  Descargar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

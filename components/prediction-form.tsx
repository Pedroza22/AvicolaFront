import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Calculator, Save, RotateCcw } from "lucide-react"

export function PredictionForm() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Predicción de Crecimiento</h2>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          Modelo IA Activo
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Parámetros de Predicción
            </CardTitle>
            <CardDescription>Ingresa los datos para generar predicciones precisas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edad-actual">Edad Actual (días)</Label>
                <Input id="edad-actual" type="number" placeholder="35" />
              </div>
              <div>
                <Label htmlFor="peso-actual">Peso Actual (kg)</Label>
                <Input id="peso-actual" type="number" step="0.01" placeholder="2.10" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="temperatura">Temperatura Promedio (°C)</Label>
                <Input id="temperatura" type="number" placeholder="24" />
              </div>
              <div>
                <Label htmlFor="humedad">Humedad Promedio (%)</Label>
                <Input id="humedad" type="number" placeholder="65" />
              </div>
            </div>

            <div>
              <Label htmlFor="tipo-alimento">Tipo de Alimento</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iniciador">Alimento Iniciador</SelectItem>
                  <SelectItem value="crecimiento">Alimento de Crecimiento</SelectItem>
                  <SelectItem value="finalizador">Alimento Finalizador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="densidad">Densidad (pollos/m²)</Label>
              <Input id="densidad" type="number" step="0.1" placeholder="12.5" />
            </div>

            <div>
              <Label htmlFor="raza">Raza/Línea Genética</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar raza" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cobb500">Cobb 500</SelectItem>
                  <SelectItem value="ross308">Ross 308</SelectItem>
                  <SelectItem value="hubbard">Hubbard Classic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="observaciones">Observaciones Adicionales</Label>
              <Textarea
                id="observaciones"
                placeholder="Cualquier factor especial que pueda afectar el crecimiento..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button className="flex-1">
                <TrendingUp className="h-4 w-4 mr-2" />
                Generar Predicción
              </Button>
              <Button variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
              <Button variant="outline">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultados de Predicción</CardTitle>
            <CardDescription>Proyección basada en los parámetros ingresados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Predicción a 7 días</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Peso Estimado:</span>
                  <p className="font-semibold">2.85 kg</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Ganancia Diaria:</span>
                  <p className="font-semibold">+107g</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Predicción a 14 días</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Peso Estimado:</span>
                  <p className="font-semibold">3.65 kg</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Conversión Alimenticia:</span>
                  <p className="font-semibold">1.72</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-800 mb-2">Recomendaciones</h4>
              <ul className="text-sm space-y-1">
                <li>• Mantener temperatura entre 22-26°C</li>
                <li>• Ajustar densidad a 10 pollos/m² en 2 semanas</li>
                <li>• Cambiar a alimento finalizador en día 42</li>
                <li>• Monitorear conversión alimenticia semanalmente</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Factores de Riesgo</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Estrés por calor:</span>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    Medio
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Densidad poblacional:</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Bajo
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Variabilidad de peso:</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Bajo
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

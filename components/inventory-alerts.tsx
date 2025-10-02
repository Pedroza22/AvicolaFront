import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X } from "lucide-react"

export function InventoryAlerts() {
  const alerts = [
    {
      id: 1,
      type: "critical",
      title: "Stock Crítico - Alimento Concentrado",
      description: "Quedan menos de 2 días de alimento en Granja Norte",
      action: "Solicitar Reposición",
    },
    {
      id: 2,
      type: "warning",
      title: "Vacunas Próximas a Vencer",
      description: "12 dosis de vacuna Newcastle vencen en 3 días",
      action: "Programar Aplicación",
    },
  ]

  return (
    <div className="space-y-3 mb-6">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          className={alert.type === "critical" ? "border-red-200 bg-red-50" : "border-orange-200 bg-orange-50"}
        >
          <AlertTriangle className={`h-4 w-4 ${alert.type === "critical" ? "text-red-600" : "text-orange-600"}`} />
          <AlertTitle className={alert.type === "critical" ? "text-red-800" : "text-orange-800"}>
            {alert.title}
          </AlertTitle>
          <AlertDescription
            className={`${alert.type === "critical" ? "text-red-700" : "text-orange-700"} flex items-center justify-between`}
          >
            <span>{alert.description}</span>
            <div className="flex gap-2">
              <Button size="sm" variant={alert.type === "critical" ? "destructive" : "default"}>
                {alert.action}
              </Button>
              <Button size="sm" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  )
}

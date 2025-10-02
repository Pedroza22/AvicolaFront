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
  ]

  return (
    <div className="space-y-3 mb-6">
      {alerts.map((alert) => (
        <Alert key={alert.id} className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">{alert.title}</AlertTitle>
          <AlertDescription className="text-red-700 flex items-center justify-between">
            <span>{alert.description}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="destructive">
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

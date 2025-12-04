"use client"

import { useConnectionStatus } from "@/lib/hooks/use-connection-status"
import { Wifi, WifiOff, RefreshCw, Cloud, CloudOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function ConnectionStatus() {
  const { isOnline, pendingOperations, syncPending, isSyncing } = useConnectionStatus()

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* Indicador de conexión */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              {isOnline ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                  <Wifi className="h-3 w-3" />
                  <span className="hidden sm:inline">En línea</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 animate-pulse">
                  <WifiOff className="h-3 w-3" />
                  <span className="hidden sm:inline">Sin conexión</span>
                </Badge>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {isOnline
              ? "Conectado al servidor"
              : "Sin conexión. Los cambios se guardarán localmente."}
          </TooltipContent>
        </Tooltip>

        {/* Indicador de operaciones pendientes */}
        {pendingOperations > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 gap-1">
                  <CloudOff className="h-3 w-3" />
                  <span>{pendingOperations}</span>
                </Badge>
                {isOnline && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={syncPending}
                    disabled={isSyncing}
                  >
                    <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
                  </Button>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {pendingOperations} {pendingOperations === 1 ? "operación pendiente" : "operaciones pendientes"} de sincronizar
            </TooltipContent>
          </Tooltip>
        )}

        {/* Indicador de sincronización activa */}
        {isSyncing && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
            <Cloud className="h-3 w-3 animate-pulse" />
            <span className="hidden sm:inline">Sincronizando...</span>
          </Badge>
        )}
      </div>
    </TooltipProvider>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Settings } from "lucide-react"
import { RoleSelector } from "@/components/shared/role-selector"
import { FarmSelector } from "@/components/shared/farm-selector"
import { useAppState } from "@/lib/hooks/use-app-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNav } from "@/components/shared/top-nav"
import { designRepository } from "@/lib/repositories/design.repository"

export default function DisenaPage() {
  const { selectedFarm, selectedShed, selectedLote, selectedRole, setSelectedFarm, setSelectedShed, setSelectedLote, setSelectedRole } = useAppState()

  const [categorias, setCategorias] = useState<any[]>([])
  const [servicios, setServicios] = useState<any[]>([])
  const [configuracion, setConfiguracion] = useState<any | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)

      const results = await Promise.allSettled([
        designRepository.getCategorias(),
        designRepository.getServicios(),
        designRepository.getConfiguracion(),
      ])

      const errors: string[] = []

      const categoriasRes = results[0]
      const serviciosRes = results[1]
      const configuracionRes = results[2]

      if (categoriasRes.status === "fulfilled") {
        setCategorias(categoriasRes.value)
      } else {
        errors.push(`Categorías: ${categoriasRes.reason?.message || "Error al cargar"}`)
      }

      if (serviciosRes.status === "fulfilled") {
        setServicios(serviciosRes.value)
      } else {
        errors.push(`Servicios: ${serviciosRes.reason?.message || "Error al cargar"}`)
      }

      if (configuracionRes.status === "fulfilled") {
        setConfiguracion(configuracionRes.value)
      } else {
        errors.push(`Configuración: ${configuracionRes.reason?.message || "Error al cargar"}`)
      }

      if (errors.length) {
        setError(errors.join(" | "))
      }

      setLoading(false)
    }

    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Sistema de Control Avícola</h1>
            <Badge variant="outline" className="bg-green-50 text-green-700">En línea</Badge>
          </div>
          <div className="flex items-center space-x-4">
            <RoleSelector selectedRole={selectedRole} onRoleChange={setSelectedRole} />
            <Button variant="outline" size="icon" onClick={() => alert("Notificaciones en desarrollo")}> <Bell className="h-4 w-4" /> </Button>
            <Button variant="outline" size="icon" onClick={() => alert("Ajustes en desarrollo")}> <Settings className="h-4 w-4" /> </Button>
          </div>
        </div>
      </header>
      <TopNav />

      <div className="flex">
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
          <FarmSelector
            selectedFarm={selectedFarm}
            selectedShed={selectedShed}
            selectedLote={selectedLote}
            onFarmChange={setSelectedFarm}
            onShedChange={setSelectedShed}
            onLoteChange={setSelectedLote}
          />
        </aside>

        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Categorías</CardTitle>
              </CardHeader>
              <CardContent>
                {loading && <div>Cargando...</div>}
                {!loading && categorias?.length === 0 && <div>No hay categorías</div>}
                {!loading && categorias?.length > 0 && (
                  <ul className="list-disc pl-5">
                    {categorias.map((c: any, idx: number) => (
                      <li key={c?.id ?? idx}>{c?.nombre ?? JSON.stringify(c)}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Servicios</CardTitle>
              </CardHeader>
              <CardContent>
                {loading && <div>Cargando...</div>}
                {!loading && servicios?.length === 0 && <div>No hay servicios</div>}
                {!loading && servicios?.length > 0 && (
                  <ul className="list-disc pl-5">
                    {servicios.map((s: any, idx: number) => (
                      <li key={s?.id ?? idx}>{s?.nombre ?? JSON.stringify(s)}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuración</CardTitle>
              </CardHeader>
              <CardContent>
                {loading && <div>Cargando...</div>}
                {!loading && configuracion && (
                  <pre className="text-xs bg-gray-50 p-2 rounded border border-gray-200 overflow-auto">
                    {JSON.stringify(configuracion, null, 2)}
                  </pre>
                )}
                {!loading && !configuracion && <div>Sin configuración</div>}
              </CardContent>
            </Card>
          </div>

          {error && (
            <Card className="mt-6 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700">Errores al cargar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-red-600 text-sm">{error}</div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}
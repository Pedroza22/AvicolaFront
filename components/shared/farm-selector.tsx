"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { MapPin, Home, Calendar, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import React from "react"

interface FarmSelectorProps {
  selectedFarm?: string
  selectedShed?: string
  selectedLote?: string
  onFarmChange: (farm: string) => void
  onShedChange: (shed: string) => void
  onLoteChange: (lote: string) => void
}

export function FarmSelector({
  selectedFarm,
  selectedShed,
  selectedLote,
  onFarmChange,
  onShedChange,
  onLoteChange,
}: FarmSelectorProps) {
  const router = useRouter()
  const [farms, setFarms] = React.useState<Array<{ id: string; name: string }>>([])
  const [sheds, setSheds] = React.useState<Array<{ id: string; name: string }>>([])
  const [lotes, setLotes] = React.useState<Array<{ id: string; name: string; diasActuales?: number }>>([])
  const [loadingFarms, setLoadingFarms] = React.useState(false)
  const [loadingSheds, setLoadingSheds] = React.useState(false)
  const [loadingLotes, setLoadingLotes] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let mounted = true
    setLoadingFarms(true)
    import("@/lib/repositories/farm.repository").then((mod) => {
      return mod.farmRepository.getAll()
    }).then((data) => {
      if (mounted) {
        // Ensure data is an array
        const dataArray = Array.isArray(data) ? data : []
        const farmList = dataArray.map((f: any) => ({ id: String(f.id), name: f.name }))
        console.log('🏠 Farms loaded:', farmList)
        setFarms(farmList)
        setError(null)
      }
    }).catch(async (error) => {
      console.error('❌ Error loading farms:', error)
      setError(error?.message || 'Error cargando granjas')
      // If unauthorized, try refresh once and retry
      try {
        const isUnauthorized = error?.status === 401 || error?.code === 'UNAUTHORIZED' || (error?.message && error.message.toLowerCase().includes('sesión'))
        if (isUnauthorized) {
          const { AuthService } = await import('@/lib/services/auth.service')
          const refreshed = await AuthService.refresh()
          if (refreshed?.access) {
            // retry fetch
            const mod = await import('@/lib/repositories/farm.repository')
            const data = await mod.farmRepository.getAll()
            if (mounted) {
              const dataArray = Array.isArray(data) ? data : []
              const farmList = dataArray.map((f: any) => ({ id: String(f.id), name: f.name }))
              console.log('🏠 Farms loaded after refresh:', farmList)
              setFarms(farmList)
            }
          }
        }
      } catch (e) {
        console.error('❌ Error during refresh+retry:', e)
      }
    }).finally(() => mounted && setLoadingFarms(false))
    return () => { mounted = false }
  }, [])

  React.useEffect(() => {
    if (!selectedFarm) {
      setSheds([])
      return
    }
    let mounted = true
    setLoadingSheds(true)
    import("@/lib/repositories/shed.repository").then((mod) => mod.shedRepository.getByFarm(selectedFarm))
      .then((data) => {
        if (mounted) {
          const shedList = data.map((s: any) => ({ id: String(s.id), name: s.name }))
          console.log('🏚️ Sheds loaded for farm', selectedFarm, ':', shedList)
          setSheds(shedList)
        }
      })
      .catch(async (error) => {
        console.error('❌ Error loading sheds:', error)
        try {
          const isUnauthorized = error?.status === 401 || error?.code === 'UNAUTHORIZED' || (error?.message && error.message.toLowerCase().includes('sesión'))
          if (isUnauthorized) {
            const { AuthService } = await import('@/lib/services/auth.service')
            const refreshed = await AuthService.refresh()
            if (refreshed?.access) {
              const mod = await import('@/lib/repositories/shed.repository')
              const data = await mod.shedRepository.getByFarm(selectedFarm)
              if (mounted) {
                const shedList = data.map((s: any) => ({ id: String(s.id), name: s.name }))
                console.log('🏚️ Sheds loaded after refresh for farm', selectedFarm, ':', shedList)
                setSheds(shedList)
              }
            }
          }
        } catch (e) {
          console.error('❌ Error during refresh+retry for sheds:', e)
        }
      })
      .finally(() => mounted && setLoadingSheds(false))
    return () => { mounted = false }
  }, [selectedFarm])

  React.useEffect(() => {
    if (!selectedShed) {
      setLotes([])
      return
    }
    let mounted = true
    setLoadingLotes(true)
    import("@/lib/repositories/lote.repository").then((mod) => mod.loteRepository.getByShed(selectedShed))
      .then((data) => {
        if (mounted) {
          const loteList = data.map((l: any) => ({ id: String(l.id), name: l.name || `Lote ${l.id}`, diasActuales: l.current_age_days ?? l.diasActuales }))
          console.log('🐔 Lotes loaded for shed', selectedShed, ':', loteList)
          setLotes(loteList)
        }
      })
      .catch(async (error) => {
        console.error('❌ Error loading lotes:', error)
        try {
          const isUnauthorized = error?.status === 401 || error?.code === 'UNAUTHORIZED' || (error?.message && error.message.toLowerCase().includes('sesión'))
          if (isUnauthorized) {
            const { AuthService } = await import('@/lib/services/auth.service')
            const refreshed = await AuthService.refresh()
            if (refreshed?.access) {
              const mod = await import('@/lib/repositories/lote.repository')
              const data = await mod.loteRepository.getByShed(selectedShed)
              if (mounted) {
                const loteList = data.map((l: any) => ({ id: String(l.id), name: l.name || `Lote ${l.id}`, diasActuales: l.current_age_days ?? l.diasActuales }))
                console.log('🐔 Lotes loaded after refresh for shed', selectedShed, ':', loteList)
                setLotes(loteList)
              }
            }
          }
        } catch (e) {
          console.error('❌ Error during refresh+retry for lotes:', e)
        }
      })
      .finally(() => mounted && setLoadingLotes(false))
    return () => { mounted = false }
  }, [selectedShed])

  const selectedLoteData = lotes.find((lote) => lote.id === selectedLote)

  if (error && farms.length === 0) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-yellow-800">No se pudieron cargar las granjas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-700">{error}. Abre la consola para ver detalles o vuelve a iniciar sesión.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Seleccionar Granja
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/admin/farms')}
              title="Agregar granja"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedFarm ?? ""} onValueChange={onFarmChange}>
            <SelectTrigger>
              <SelectValue placeholder={loadingFarms ? "Cargando..." : "Seleccionar granja"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas las granjas</SelectItem>
              {farms.map((farm) => (
                <SelectItem key={farm.id} value={farm.id}>
                  {farm.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Seleccionar Galpón
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/admin/sheds')}
              disabled={!selectedFarm}
              title="Agregar galpón"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedShed ?? ""} onValueChange={onShedChange} disabled={!selectedFarm}>
            <SelectTrigger>
              <SelectValue placeholder={loadingSheds ? "Cargando..." : selectedFarm ? "Seleccionar galpón" : "Primero selecciona una granja"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los galpones</SelectItem>
              {sheds.map((shed) => (
                <SelectItem key={shed.id} value={shed.id}>
                  {shed.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Seleccionar Lote
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/admin/lotes')}
              disabled={!selectedShed}
              title="Agregar lote"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedLote ?? ""} onValueChange={onLoteChange} disabled={!selectedShed}>
            <SelectTrigger>
              <SelectValue placeholder={loadingLotes ? "Cargando..." : selectedShed ? "Seleccionar lote" : "Primero selecciona un galpón"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los lotes</SelectItem>
              {lotes.map((lote) => (
                <SelectItem key={lote.id} value={lote.id}>
                  {lote.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedLoteData && (
        <Card>
          <CardHeader>
            <CardTitle>Información del Lote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Lote:</span>
                <p className="font-semibold">{selectedLoteData.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Día:</span>
                <p className="font-semibold">{selectedLoteData.diasActuales ?? "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

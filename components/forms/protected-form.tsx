"use client"

import React, { useCallback, useEffect, useState } from "react"
import { useFormPersistence } from "@/lib/hooks/use-form-persistence"
import { useConnectionStatus } from "@/lib/hooks/use-connection-status"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  AlertTriangle, 
  Save, 
  RefreshCw, 
  Trash2, 
  Clock, 
  WifiOff,
  CheckCircle,
  FileWarning 
} from "lucide-react"

interface ProtectedFormProps<T extends Record<string, any>> {
  formType: string
  initialData: T
  title: string
  description?: string
  children: (props: {
    formData: T
    updateField: <K extends keyof T>(field: K, value: T[K]) => void
    setFormData: (data: T | ((prev: T) => T)) => void
  }) => React.ReactNode
  onSubmit: (data: T) => Promise<void>
  onSubmitOffline?: (data: T) => Promise<void>
  validateForm?: (data: T) => { valid: boolean; errors: Record<string, string> }
}

/**
 * Componente wrapper para formularios con:
 * - Auto-guardado de borradores
 * - Protección contra pérdida de datos
 * - Soporte offline
 * - Validación
 */
export function ProtectedForm<T extends Record<string, any>>({
  formType,
  initialData,
  title,
  description,
  children,
  onSubmit,
  onSubmitOffline,
  validateForm,
}: ProtectedFormProps<T>) {
  const { isOnline, pendingOperations } = useConnectionStatus()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showDraftAlert, setShowDraftAlert] = useState(false)

  const {
    formData,
    setFormData,
    updateField,
    isDirty,
    isSaving,
    lastSaved,
    hasDraft,
    saveDraft,
    clearDraft,
    restoreDraft,
  } = useFormPersistence({
    formType,
    initialData,
    autoSaveInterval: 3000,
    onDraftRestored: () => {
      setShowDraftAlert(false)
    },
  })

  // Mostrar alerta si hay un borrador guardado
  useEffect(() => {
    if (hasDraft && !isDirty) {
      setShowDraftAlert(true)
    }
  }, [hasDraft, isDirty])

  // Validar en tiempo real
  useEffect(() => {
    if (validateForm && isDirty) {
      const result = validateForm(formData)
      setValidationErrors(result.errors)
    }
  }, [formData, validateForm, isDirty])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitSuccess(false)

    // Validar antes de enviar
    if (validateForm) {
      const result = validateForm(formData)
      if (!result.valid) {
        setValidationErrors(result.errors)
        setSubmitError("Por favor corrige los errores del formulario")
        return
      }
    }

    setIsSubmitting(true)

    try {
      if (!isOnline && onSubmitOffline) {
        await onSubmitOffline(formData)
        setSubmitSuccess(true)
        // No limpiar el formulario, pero marcar como guardado offline
      } else if (isOnline) {
        await onSubmit(formData)
        setSubmitSuccess(true)
        // Limpiar borrador después de envío exitoso
        await clearDraft()
      } else {
        setSubmitError("Sin conexión. Los datos se guardarán localmente y se sincronizarán cuando vuelva la conexión.")
        // Guardar borrador
        await saveDraft()
      }
    } catch (error: any) {
      setSubmitError(error.message || "Error al enviar el formulario")
      // Guardar borrador en caso de error
      await saveDraft()
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, isOnline, onSubmit, onSubmitOffline, validateForm, clearDraft, saveDraft])

  const formatLastSaved = (date: Date | null) => {
    if (!date) return null
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diff < 60) return "Hace unos segundos"
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minutos`
    return date.toLocaleTimeString()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">
            {/* Indicador de estado offline */}
            {!isOnline && (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 gap-1">
                <WifiOff className="h-3 w-3" />
                Modo Offline
              </Badge>
            )}
            
            {/* Indicador de auto-guardado */}
            {isSaving && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Guardando...
              </Badge>
            )}
            
            {/* Último guardado */}
            {lastSaved && !isSaving && (
              <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 gap-1">
                <Clock className="h-3 w-3" />
                {formatLastSaved(lastSaved)}
              </Badge>
            )}
            
            {/* Indicador de cambios sin guardar */}
            {isDirty && !isSaving && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1">
                <FileWarning className="h-3 w-3" />
                Sin guardar
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Alerta de borrador existente */}
        {showDraftAlert && hasDraft && (
          <Alert className="mb-4 border-blue-200 bg-blue-50">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Borrador encontrado</AlertTitle>
            <AlertDescription className="text-blue-700">
              <div className="flex items-center justify-between">
                <span>Tienes un formulario sin terminar guardado. ¿Deseas recuperarlo?</span>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={() => setShowDraftAlert(false)}>
                    Ignorar
                  </Button>
                  <Button size="sm" onClick={restoreDraft}>
                    Restaurar
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Alerta de modo offline */}
        {!isOnline && (
          <Alert className="mb-4 border-orange-200 bg-orange-50">
            <WifiOff className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-800">Modo sin conexión</AlertTitle>
            <AlertDescription className="text-orange-700">
              Los datos se guardarán localmente y se sincronizarán automáticamente cuando vuelva la conexión.
            </AlertDescription>
          </Alert>
        )}

        {/* Mensaje de éxito */}
        {submitSuccess && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">
              {!isOnline ? "Guardado localmente" : "Enviado correctamente"}
            </AlertTitle>
            <AlertDescription className="text-green-700">
              {!isOnline 
                ? "Los datos se sincronizarán cuando vuelva la conexión."
                : "El formulario se ha enviado exitosamente."}
            </AlertDescription>
          </Alert>
        )}

        {/* Mensaje de error */}
        {submitError && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Error</AlertTitle>
            <AlertDescription className="text-red-700">{submitError}</AlertDescription>
          </Alert>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          {/* Contenido del formulario (children render prop) */}
          {children({ formData, updateField, setFormData })}

          {/* Errores de validación */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm font-medium text-red-800 mb-2">
                Por favor corrige los siguientes errores:
              </p>
              <ul className="text-sm text-red-700 list-disc list-inside">
                {Object.entries(validationErrors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="flex gap-2">
              {hasDraft && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearDraft}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Descartar borrador
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={saveDraft}
                disabled={!isDirty || isSaving}
              >
                <Save className="h-4 w-4 mr-1" />
                Guardar borrador
              </Button>
              
              <Button
                type="submit"
                disabled={isSubmitting || Object.keys(validationErrors).length > 0}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {!isOnline ? "Guardar (Offline)" : "Enviar"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

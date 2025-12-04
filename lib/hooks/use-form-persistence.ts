"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { offlineSyncService } from "@/lib/services/offline-sync.service"

interface UseFormPersistenceOptions<T> {
  formType: string
  initialData: T
  draftId?: string
  autoSaveInterval?: number // ms, default 5000
  onDraftRestored?: (data: T) => void
}

interface UseFormPersistenceReturn<T> {
  formData: T
  setFormData: (data: T | ((prev: T) => T)) => void
  updateField: <K extends keyof T>(field: K, value: T[K]) => void
  isDirty: boolean
  isSaving: boolean
  lastSaved: Date | null
  hasDraft: boolean
  saveDraft: () => Promise<void>
  clearDraft: () => Promise<void>
  restoreDraft: () => Promise<void>
}

/**
 * Hook para persistir formularios automáticamente
 * Protege contra pérdida de datos por desconexión o cierre accidental
 */
export function useFormPersistence<T extends Record<string, any>>(
  options: UseFormPersistenceOptions<T>
): UseFormPersistenceReturn<T> {
  const { formType, initialData, draftId, autoSaveInterval = 5000, onDraftRestored } = options

  const [formData, setFormDataState] = useState<T>(initialData)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasDraft, setHasDraft] = useState(false)
  
  const currentDraftId = useRef(draftId || `draft_${formType}_${Date.now()}`)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const initialDataRef = useRef(initialData)

  // Verificar si hay un borrador existente al montar
  useEffect(() => {
    const checkExistingDraft = async () => {
      try {
        const drafts = await offlineSyncService.getDraftsByType(formType)
        if (drafts.length > 0) {
          setHasDraft(true)
          // Si hay un draftId específico, usar ese
          if (draftId) {
            const draft = await offlineSyncService.getDraft(draftId)
            if (draft) {
              currentDraftId.current = draftId
            }
          }
        }
      } catch (error) {
        console.error("Error verificando borradores:", error)
      }
    }
    checkExistingDraft()
  }, [formType, draftId])

  // Función para guardar borrador
  const saveDraft = useCallback(async () => {
    if (!isDirty) return

    setIsSaving(true)
    try {
      await offlineSyncService.saveDraft(formType, formData, currentDraftId.current)
      setLastSaved(new Date())
      setHasDraft(true)
    } catch (error) {
      console.error("Error guardando borrador:", error)
    } finally {
      setIsSaving(false)
    }
  }, [formType, formData, isDirty])

  // Auto-guardado
  useEffect(() => {
    if (!isDirty) return

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveDraft()
    }, autoSaveInterval)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [formData, isDirty, autoSaveInterval, saveDraft])

  // Guardar al cerrar/recargar página
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        // Guardar síncronamente antes de cerrar
        offlineSyncService.saveDraft(formType, formData, currentDraftId.current)
        // Mostrar diálogo de confirmación
        e.preventDefault()
        e.returnValue = "Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?"
        return e.returnValue
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty, formType, formData])

  // Actualizar datos del formulario
  const setFormData = useCallback((data: T | ((prev: T) => T)) => {
    setFormDataState((prev) => {
      const newData = typeof data === "function" ? data(prev) : data
      return newData
    })
    setIsDirty(true)
  }, [])

  // Actualizar un campo específico
  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setFormDataState((prev) => ({
      ...prev,
      [field]: value,
    }))
    setIsDirty(true)
  }, [])

  // Restaurar borrador
  const restoreDraft = useCallback(async () => {
    try {
      const draft = await offlineSyncService.getDraft(currentDraftId.current)
      if (draft) {
        setFormDataState(draft.data)
        setIsDirty(false)
        setLastSaved(new Date(draft.lastModified))
        onDraftRestored?.(draft.data)
      } else {
        // Buscar el borrador más reciente del tipo
        const drafts = await offlineSyncService.getDraftsByType(formType)
        if (drafts.length > 0) {
          const latestDraft = drafts.sort((a, b) => b.lastModified - a.lastModified)[0]
          currentDraftId.current = latestDraft.id
          setFormDataState(latestDraft.data)
          setIsDirty(false)
          setLastSaved(new Date(latestDraft.lastModified))
          onDraftRestored?.(latestDraft.data)
        }
      }
    } catch (error) {
      console.error("Error restaurando borrador:", error)
    }
  }, [formType, onDraftRestored])

  // Limpiar borrador
  const clearDraft = useCallback(async () => {
    try {
      await offlineSyncService.deleteDraft(currentDraftId.current)
      setFormDataState(initialDataRef.current)
      setIsDirty(false)
      setLastSaved(null)
      setHasDraft(false)
    } catch (error) {
      console.error("Error eliminando borrador:", error)
    }
  }, [])

  return {
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
  }
}

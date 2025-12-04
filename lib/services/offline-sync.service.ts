/**
 * Offline Sync Service
 * 
 * Maneja sincronización de datos cuando no hay conexión:
 * - Cola de operaciones pendientes en IndexedDB
 * - Retry automático cuando vuelve la conexión
 * - Resolución de conflictos básica
 */

const DB_NAME = "avicola_offline_db"
const DB_VERSION = 1
const PENDING_STORE = "pending_operations"
const FORM_DRAFTS_STORE = "form_drafts"

export interface PendingOperation {
  id: string
  endpoint: string
  method: "POST" | "PUT" | "PATCH" | "DELETE"
  data: any
  timestamp: number
  retryCount: number
  maxRetries: number
  entityType: string
  entityId?: string
}

export interface FormDraft {
  id: string
  formType: string
  data: any
  timestamp: number
  lastModified: number
}

class OfflineSyncService {
  private db: IDBDatabase | null = null
  private isOnline: boolean = true
  private syncInProgress: boolean = false
  private listeners: Set<(online: boolean) => void> = new Set()

  constructor() {
    if (typeof window !== "undefined") {
      this.initDB()
      this.setupConnectionListeners()
    }
  }

  /**
   * Inicializa IndexedDB
   */
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") {
        resolve()
        return
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        console.error("Error abriendo IndexedDB:", request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Store para operaciones pendientes
        if (!db.objectStoreNames.contains(PENDING_STORE)) {
          const pendingStore = db.createObjectStore(PENDING_STORE, { keyPath: "id" })
          pendingStore.createIndex("timestamp", "timestamp", { unique: false })
          pendingStore.createIndex("entityType", "entityType", { unique: false })
        }

        // Store para borradores de formularios
        if (!db.objectStoreNames.contains(FORM_DRAFTS_STORE)) {
          const draftsStore = db.createObjectStore(FORM_DRAFTS_STORE, { keyPath: "id" })
          draftsStore.createIndex("formType", "formType", { unique: false })
          draftsStore.createIndex("timestamp", "timestamp", { unique: false })
        }
      }
    })
  }

  /**
   * Configura listeners para detectar cambios de conexión
   */
  private setupConnectionListeners(): void {
    if (typeof window === "undefined") return

    this.isOnline = navigator.onLine

    window.addEventListener("online", () => {
      this.isOnline = true
      this.notifyListeners(true)
      this.syncPendingOperations()
    })

    window.addEventListener("offline", () => {
      this.isOnline = false
      this.notifyListeners(false)
    })
  }

  /**
   * Suscribe un listener a cambios de conexión
   */
  onConnectionChange(callback: (online: boolean) => void): () => void {
    this.listeners.add(callback)
    // Notificar estado actual inmediatamente
    callback(this.isOnline)
    return () => this.listeners.delete(callback)
  }

  private notifyListeners(online: boolean): void {
    this.listeners.forEach((listener) => listener(online))
  }

  /**
   * Verifica si está online
   */
  getOnlineStatus(): boolean {
    return this.isOnline
  }

  /**
   * Agrega una operación a la cola de pendientes
   */
  async queueOperation(operation: Omit<PendingOperation, "id" | "timestamp" | "retryCount">): Promise<string> {
    await this.ensureDB()

    const id = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const pendingOp: PendingOperation = {
      ...operation,
      id,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: operation.maxRetries || 5,
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("DB no inicializada"))
        return
      }

      const transaction = this.db.transaction([PENDING_STORE], "readwrite")
      const store = transaction.objectStore(PENDING_STORE)
      const request = store.add(pendingOp)

      request.onsuccess = () => resolve(id)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Obtiene todas las operaciones pendientes
   */
  async getPendingOperations(): Promise<PendingOperation[]> {
    await this.ensureDB()

    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve([])
        return
      }

      const transaction = this.db.transaction([PENDING_STORE], "readonly")
      const store = transaction.objectStore(PENDING_STORE)
      const index = store.index("timestamp")
      const request = index.getAll()

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Elimina una operación completada
   */
  async removeOperation(id: string): Promise<void> {
    await this.ensureDB()

    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve()
        return
      }

      const transaction = this.db.transaction([PENDING_STORE], "readwrite")
      const store = transaction.objectStore(PENDING_STORE)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Actualiza el contador de reintentos de una operación
   */
  async updateRetryCount(id: string, count: number): Promise<void> {
    await this.ensureDB()

    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve()
        return
      }

      const transaction = this.db.transaction([PENDING_STORE], "readwrite")
      const store = transaction.objectStore(PENDING_STORE)
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const operation = getRequest.result
        if (operation) {
          operation.retryCount = count
          store.put(operation)
        }
        resolve()
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  /**
   * Sincroniza operaciones pendientes cuando hay conexión
   */
  async syncPendingOperations(): Promise<{ success: number; failed: number }> {
    if (!this.isOnline || this.syncInProgress) {
      return { success: 0, failed: 0 }
    }

    this.syncInProgress = true
    let success = 0
    let failed = 0

    try {
      const operations = await this.getPendingOperations()
      const { httpClient } = await import("@/lib/api/http-client")

      for (const op of operations) {
        try {
          let response
          switch (op.method) {
            case "POST":
              response = await httpClient.post(op.endpoint, op.data)
              break
            case "PUT":
              response = await httpClient.put(op.endpoint, op.data)
              break
            case "PATCH":
              response = await httpClient.patch(op.endpoint, op.data)
              break
            case "DELETE":
              response = await httpClient.delete(op.endpoint)
              break
          }

          if (response?.success) {
            await this.removeOperation(op.id)
            success++
          } else {
            throw new Error("Operación fallida")
          }
        } catch (error) {
          if (op.retryCount >= op.maxRetries) {
            // Máximo de reintentos alcanzado, remover operación
            await this.removeOperation(op.id)
            failed++
          } else {
            await this.updateRetryCount(op.id, op.retryCount + 1)
          }
        }
      }
    } finally {
      this.syncInProgress = false
    }

    return { success, failed }
  }

  // ============== FORM DRAFTS ==============

  /**
   * Guarda un borrador de formulario
   */
  async saveDraft(formType: string, data: any, id?: string): Promise<string> {
    await this.ensureDB()

    const draftId = id || `draft_${formType}_${Date.now()}`
    const draft: FormDraft = {
      id: draftId,
      formType,
      data,
      timestamp: Date.now(),
      lastModified: Date.now(),
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("DB no inicializada"))
        return
      }

      const transaction = this.db.transaction([FORM_DRAFTS_STORE], "readwrite")
      const store = transaction.objectStore(FORM_DRAFTS_STORE)
      const request = store.put(draft)

      request.onsuccess = () => resolve(draftId)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Obtiene un borrador de formulario
   */
  async getDraft(id: string): Promise<FormDraft | null> {
    await this.ensureDB()

    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve(null)
        return
      }

      const transaction = this.db.transaction([FORM_DRAFTS_STORE], "readonly")
      const store = transaction.objectStore(FORM_DRAFTS_STORE)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Obtiene todos los borradores de un tipo de formulario
   */
  async getDraftsByType(formType: string): Promise<FormDraft[]> {
    await this.ensureDB()

    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve([])
        return
      }

      const transaction = this.db.transaction([FORM_DRAFTS_STORE], "readonly")
      const store = transaction.objectStore(FORM_DRAFTS_STORE)
      const index = store.index("formType")
      const request = index.getAll(formType)

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Elimina un borrador
   */
  async deleteDraft(id: string): Promise<void> {
    await this.ensureDB()

    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve()
        return
      }

      const transaction = this.db.transaction([FORM_DRAFTS_STORE], "readwrite")
      const store = transaction.objectStore(FORM_DRAFTS_STORE)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Obtiene el número de operaciones pendientes
   */
  async getPendingCount(): Promise<number> {
    const operations = await this.getPendingOperations()
    return operations.length
  }

  /**
   * Asegura que la DB esté inicializada
   */
  private async ensureDB(): Promise<void> {
    if (!this.db && typeof window !== "undefined") {
      await this.initDB()
    }
  }
}

export const offlineSyncService = new OfflineSyncService()

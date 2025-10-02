import type { InventoryItem, StockAlert } from "@/lib/types"
import { INVENTORY_CONFIG } from "@/lib/constants"

export class InventoryService {
  /**
   * Calcula los días restantes de stock basado en consumo promedio
   */
  static calculateRemainingDays(stockActual: number, consumoDiario: number): number {
    if (consumoDiario === 0) return Number.POSITIVE_INFINITY
    return Math.floor(stockActual / consumoDiario)
  }

  /**
   * Determina el nivel de urgencia basado en días restantes
   */
  static getUrgencyLevel(diasRestantes: number): "critica" | "alta" | "media" {
    if (diasRestantes <= INVENTORY_CONFIG.criticalThresholdDays) {
      return "critica"
    }
    if (diasRestantes <= INVENTORY_CONFIG.alertThresholdDays) {
      return "alta"
    }
    return "media"
  }

  /**
   * Verifica si un producto necesita reabastecimiento
   */
  static needsRestock(item: InventoryItem): boolean {
    return item.stockActual < item.stockMinimo
  }

  /**
   * Genera alertas de stock bajo
   */
  static generateStockAlerts(inventory: InventoryItem[], consumoDiario: Record<string, number>): StockAlert[] {
    return inventory
      .filter((item) => this.needsRestock(item))
      .map((item) => {
        const diasRestantes = this.calculateRemainingDays(item.stockActual, consumoDiario[item.id] || 0)
        const urgencia = this.getUrgencyLevel(diasRestantes)

        return {
          id: item.id,
          producto: item.producto,
          stockActual: item.stockActual,
          stockMinimo: item.stockMinimo,
          urgencia,
          diasRestantes,
          proveedorId: item.proveedorId,
        }
      })
      .sort((a, b) => a.diasRestantes - b.diasRestantes)
  }

  /**
   * Calcula la cantidad sugerida para pedido
   */
  static calculateSuggestedOrder(
    stockActual: number,
    stockMinimo: number,
    consumoDiario: number,
    diasBuffer = 30,
  ): number {
    const stockObjetivo = consumoDiario * diasBuffer
    const cantidadNecesaria = Math.max(stockObjetivo - stockActual, stockMinimo * 2)
    return Math.ceil(cantidadNecesaria)
  }
}

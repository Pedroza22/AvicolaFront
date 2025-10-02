import type { WeeklyConsumption } from "@/lib/types"
import { INVENTORY_CONFIG, WEEKDAYS } from "@/lib/constants"

export class ConsumptionService {
  /**
   * Calcula el total de bultos consumidos en la semana
   */
  static calculateTotalBultos(consumption: WeeklyConsumption): number {
    return WEEKDAYS.reduce((sum, day) => sum + (consumption[day] || 0), 0)
  }

  /**
   * Calcula el consumo semanal en kilogramos
   */
  static calculateWeeklyKg(consumption: WeeklyConsumption): number {
    const totalBultos = this.calculateTotalBultos(consumption)
    return totalBultos * INVENTORY_CONFIG.bultoWeight
  }

  /**
   * Calcula el promedio diario de consumo
   */
  static calculateDailyAverage(consumption: WeeklyConsumption): number {
    const total = this.calculateTotalBultos(consumption)
    const daysWithData = WEEKDAYS.filter((day) => consumption[day] > 0).length
    return daysWithData > 0 ? total / daysWithData : 0
  }

  /**
   * Calcula la conversión alimenticia
   */
  static calculateFeedConversion(consumoAlimento: number, gananciaPeso: number): number {
    if (gananciaPeso === 0) return 0
    return Number((consumoAlimento / gananciaPeso).toFixed(2))
  }

  /**
   * Valida que los datos de consumo sean correctos
   */
  static validateConsumption(consumption: WeeklyConsumption): boolean {
    return WEEKDAYS.every((day) => {
      const value = consumption[day]
      return typeof value === "number" && value >= 0
    })
  }
}

"use client"

import { useState, useEffect } from "react"
import type { WeeklyConsumption } from "@/lib/types"
import { ConsumptionService } from "@/lib/services/consumption.service"

export function useConsumption(initialConsumption: WeeklyConsumption) {
  const [consumption, setConsumption] = useState<WeeklyConsumption>(initialConsumption)
  const [totalBultos, setTotalBultos] = useState(0)
  const [consumoSemanal, setConsumoSemanal] = useState(0)

  useEffect(() => {
    const total = ConsumptionService.calculateTotalBultos(consumption)
    const semanal = ConsumptionService.calculateWeeklyKg(consumption)

    setTotalBultos(total)
    setConsumoSemanal(semanal)
  }, [consumption])

  const updateDay = (day: keyof WeeklyConsumption, value: number) => {
    setConsumption((prev) => ({
      ...prev,
      [day]: value,
    }))
  }

  return {
    consumption,
    totalBultos,
    consumoSemanal,
    updateDay,
    setConsumption,
  }
}

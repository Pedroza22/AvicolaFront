"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"

interface CalendarProps {
  initialFocus?: boolean
  mode?: string
  defaultMonth?: Date
  selected?: DateRange | undefined
  onSelect?: (d: DateRange | undefined) => void
  numberOfMonths?: number
}

export function Calendar(_props: CalendarProps) {
  // Minimal stub for typechecking and basic UI. For full behaviour keep using react-day-picker.
  return <div />
}

export default Calendar

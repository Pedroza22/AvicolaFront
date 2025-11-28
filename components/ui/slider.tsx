"use client"

import * as React from "react"

interface SliderProps {
  value?: number[]
  min?: number
  max?: number
  step?: number
  onValueChange?: (v: number[]) => void
  className?: string
}

export function Slider({ value = [0], min = 0, max = 100, step = 1, onValueChange }: SliderProps) {
  const v = value[0]
  return (
    <input
      type="range"
      className={"w-full"}
      min={min}
      max={max}
      step={step}
      value={v}
      onChange={(e) => onValueChange?.([Number(e.target.value)])}
    />
  )
}

export default Slider

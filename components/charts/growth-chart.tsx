"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const growthData = [
  { day: 1, peso: 0.045, esperado: 0.045 },
  { day: 7, peso: 0.18, esperado: 0.17 },
  { day: 14, peso: 0.42, esperado: 0.4 },
  { day: 21, peso: 0.85, esperado: 0.82 },
  { day: 28, peso: 1.45, esperado: 1.4 },
  { day: 35, peso: 2.1, esperado: 2.05 },
  { day: 42, peso: 2.85, esperado: 2.8 },
]

interface GrowthChartProps {
  detailed?: boolean
}

export function GrowthChart({ detailed = false }: GrowthChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Curva de Crecimiento</CardTitle>
        <CardDescription>Peso promedio vs. peso esperado por día de crianza</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={detailed ? 400 : 300}>
          <LineChart data={growthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" label={{ value: "Días", position: "insideBottom", offset: -10 }} />
            <YAxis label={{ value: "Peso (kg)", angle: -90, position: "insideLeft" }} />
            <Tooltip
              formatter={(value, name) => [`${value} kg`, name === "peso" ? "Peso Real" : "Peso Esperado"]}
              labelFormatter={(day) => `Día ${day}`}
            />
            <Legend />
            <Line type="monotone" dataKey="peso" stroke="#22c55e" strokeWidth={3} name="Peso Real" />
            <Line
              type="monotone"
              dataKey="esperado"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Peso Esperado"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

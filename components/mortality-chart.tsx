"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const mortalityData = [
  { week: "Sem 1", mortalidad: 1.2, promedio: 1.5 },
  { week: "Sem 2", mortalidad: 0.8, promedio: 1.2 },
  { week: "Sem 3", mortalidad: 1.5, promedio: 1.8 },
  { week: "Sem 4", mortalidad: 2.1, promedio: 2.0 },
  { week: "Sem 5", mortalidad: 1.9, promedio: 2.2 },
  { week: "Sem 6", mortalidad: 2.3, promedio: 2.5 },
]

export function MortalityChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Índice de Mortalidad</CardTitle>
        <CardDescription>Porcentaje semanal vs. promedio de la industria</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mortalityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis label={{ value: "Mortalidad (%)", angle: -90, position: "insideLeft" }} />
            <Tooltip
              formatter={(value, name) => [
                `${value}%`,
                name === "mortalidad" ? "Mortalidad Real" : "Promedio Industria",
              ]}
            />
            <Bar dataKey="mortalidad" fill="#ef4444" name="Mortalidad Real" />
            <Bar dataKey="promedio" fill="#94a3b8" name="Promedio Industria" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

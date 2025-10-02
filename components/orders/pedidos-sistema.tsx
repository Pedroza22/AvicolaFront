"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, AlertTriangle } from "lucide-react"

export function PedidosSistema() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sistema de Pedidos</h2>
          <p className="text-muted-foreground">Gestión automática de inventario y pedidos a proveedores</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          <ShoppingCart className="h-3 w-3 mr-1" />
          Admin Granja
        </Badge>
      </div>

      <Tabs defaultValue="alertas" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alertas">Alertas Stock</TabsTrigger>
          <TabsTrigger value="pedidos">Hacer Pedidos</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
          <TabsTrigger value="proveedores">Proveedores</TabsTrigger>
        </TabsList>

        <TabsContent value="alertas" className="space-y-6">
          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                Productos con Stock Crítico
              </CardTitle>
              <CardDescription className="text-red-600">Sistema de alertas en desarrollo</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="pedidos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nuevo Pedido</CardTitle>
              <CardDescription>Formulario en desarrollo</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Próximamente</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Pedidos</CardTitle>
              <CardDescription>Registro en desarrollo</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Próximamente</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proveedores" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Proveedores</CardTitle>
              <CardDescription>Sistema en desarrollo</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Próximamente</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

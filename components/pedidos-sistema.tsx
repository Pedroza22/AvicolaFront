"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ShoppingCart,
  Send,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Plus,
  Eye,
  Truck,
} from "lucide-react"

export function PedidosSistema() {
  const [selectedTab, setSelectedTab] = useState("alertas")

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

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alertas">Alertas Stock</TabsTrigger>
          <TabsTrigger value="pedidos">Hacer Pedidos</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
          <TabsTrigger value="proveedores">Proveedores</TabsTrigger>
        </TabsList>

        <TabsContent value="alertas" className="space-y-6">
          <AlertasStock />
        </TabsContent>

        <TabsContent value="pedidos" className="space-y-6">
          <HacerPedidos />
        </TabsContent>

        <TabsContent value="historial" className="space-y-6">
          <HistorialPedidos />
        </TabsContent>

        <TabsContent value="proveedores" className="space-y-6">
          <GestionProveedores />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AlertasStock() {
  const productosStockBajo = [
    {
      id: 1,
      producto: "Alimento Concentrado Iniciador",
      stockActual: 45,
      stockMinimo: 100,
      unidad: "bultos",
      proveedor: "Fábrica de Concentrados La Esperanza",
      urgencia: "crítica",
      diasRestantes: 2,
    },
    {
      id: 2,
      producto: "Vacuna Newcastle",
      stockActual: 8,
      stockMinimo: 20,
      unidad: "dosis",
      proveedor: "Laboratorio Veterinario San Martín",
      urgencia: "alta",
      diasRestantes: 5,
    },
    {
      id: 3,
      producto: "Antibiótico Enrofloxacina",
      stockActual: 12,
      stockMinimo: 25,
      unidad: "frascos",
      proveedor: "Distribuidora Agropecuaria Norte",
      urgencia: "media",
      diasRestantes: 8,
    },
    {
      id: 4,
      producto: "Desinfectante Yodo",
      stockActual: 3,
      stockMinimo: 10,
      unidad: "litros",
      proveedor: "Químicos Industriales del Campo",
      urgencia: "crítica",
      diasRestantes: 1,
    },
  ]

  const getUrgenciaColor = (urgencia: string) => {
    switch (urgencia) {
      case "crítica":
        return "bg-red-50 text-red-700 border-red-200"
      case "alta":
        return "bg-orange-50 text-orange-700 border-orange-200"
      case "media":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            Productos con Stock Crítico
          </CardTitle>
          <CardDescription className="text-red-600">
            {productosStockBajo.filter((p) => p.urgencia === "crítica").length} productos requieren pedido inmediato
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {productosStockBajo.map((producto) => (
          <Card key={producto.id} className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{producto.producto}</h3>
                    <Badge variant="outline" className={getUrgenciaColor(producto.urgencia)}>
                      {producto.urgencia.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Stock Actual:</span>
                      <p className="font-semibold text-red-600">
                        {producto.stockActual} {producto.unidad}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Stock Mínimo:</span>
                      <p className="font-semibold">
                        {producto.stockMinimo} {producto.unidad}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Días Restantes:</span>
                      <p className="font-semibold text-orange-600">{producto.diasRestantes} días</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Proveedor:</span>
                      <p className="font-semibold text-xs">{producto.proveedor}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Detalles del Producto</DialogTitle>
                        <DialogDescription>Información completa del stock</DialogDescription>
                      </DialogHeader>
                      <DetalleProducto producto={producto} />
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    Pedir Ahora
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function HacerPedidos() {
  const [pedidoData, setPedidoData] = useState({
    proveedor: "",
    productos: [{ producto: "", cantidad: "", unidad: "bultos", precio: "" }],
    fechaEntrega: "",
    observaciones: "",
    urgencia: "normal",
  })

  const proveedores = [
    {
      id: "concentrados-esperanza",
      name: "Fábrica de Concentrados La Esperanza",
      email: "pedidos@concentradosesperanza.com",
    },
    { id: "lab-san-martin", name: "Laboratorio Veterinario San Martín", email: "ventas@labsanmartin.com" },
    { id: "agropecuaria-norte", name: "Distribuidora Agropecuaria Norte", email: "pedidos@agronorte.com" },
    { id: "quimicos-campo", name: "Químicos Industriales del Campo", email: "ordenes@quimicoscampo.com" },
  ]

  const agregarProducto = () => {
    setPedidoData({
      ...pedidoData,
      productos: [...pedidoData.productos, { producto: "", cantidad: "", unidad: "bultos", precio: "" }],
    })
  }

  const enviarPedido = () => {
    // Simular envío de correo
    console.log("Enviando pedido:", pedidoData)
    alert("¡Pedido enviado exitosamente! Se ha notificado al proveedor por correo electrónico.")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Nuevo Pedido
          </CardTitle>
          <CardDescription>Crear pedido y enviar automáticamente al proveedor</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="proveedor">Proveedor</Label>
            <Select
              value={pedidoData.proveedor}
              onValueChange={(value) => setPedidoData({ ...pedidoData, proveedor: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar proveedor" />
              </SelectTrigger>
              <SelectContent>
                {proveedores.map((proveedor) => (
                  <SelectItem key={proveedor.id} value={proveedor.id}>
                    {proveedor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Productos a Pedir</Label>
            <div className="space-y-3">
              {pedidoData.productos.map((producto, index) => (
                <div key={index} className="grid grid-cols-4 gap-2">
                  <Input
                    placeholder="Producto"
                    value={producto.producto}
                    onChange={(e) => {
                      const newProductos = [...pedidoData.productos]
                      newProductos[index].producto = e.target.value
                      setPedidoData({ ...pedidoData, productos: newProductos })
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="Cantidad"
                    value={producto.cantidad}
                    onChange={(e) => {
                      const newProductos = [...pedidoData.productos]
                      newProductos[index].cantidad = e.target.value
                      setPedidoData({ ...pedidoData, productos: newProductos })
                    }}
                  />
                  <Select
                    value={producto.unidad}
                    onValueChange={(value) => {
                      const newProductos = [...pedidoData.productos]
                      newProductos[index].unidad = value
                      setPedidoData({ ...pedidoData, productos: newProductos })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bultos">Bultos</SelectItem>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="frascos">Frascos</SelectItem>
                      <SelectItem value="dosis">Dosis</SelectItem>
                      <SelectItem value="litros">Litros</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Precio"
                    value={producto.precio}
                    onChange={(e) => {
                      const newProductos = [...pedidoData.productos]
                      newProductos[index].precio = e.target.value
                      setPedidoData({ ...pedidoData, productos: newProductos })
                    }}
                  />
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={agregarProducto}>
                <Plus className="h-3 w-3 mr-1" />
                Agregar Producto
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fecha-entrega">Fecha Entrega Deseada</Label>
              <Input
                id="fecha-entrega"
                type="date"
                value={pedidoData.fechaEntrega}
                onChange={(e) => setPedidoData({ ...pedidoData, fechaEntrega: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="urgencia">Urgencia</Label>
              <Select
                value={pedidoData.urgencia}
                onValueChange={(value) => setPedidoData({ ...pedidoData, urgencia: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={pedidoData.observaciones}
              onChange={(e) => setPedidoData({ ...pedidoData, observaciones: e.target.value })}
              placeholder="Instrucciones especiales, horarios de entrega, etc..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vista Previa del Pedido</CardTitle>
          <CardDescription>Correo que se enviará al proveedor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-sm">
            <div className="border-b pb-2">
              <p className="font-semibold">
                Para: {proveedores.find((p) => p.id === pedidoData.proveedor)?.email || "Seleccionar proveedor"}
              </p>
              <p className="font-semibold">De: admin@granjaavicola.com</p>
              <p className="font-semibold">Asunto: Pedido Urgente - Granja Avícola Oasis</p>
            </div>

            <div>
              <p className="font-semibold mb-2">Estimados,</p>
              <p>Solicitamos cotización y disponibilidad para los siguientes productos:</p>
            </div>

            <div className="bg-white p-3 rounded border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left">Producto</th>
                    <th className="text-left">Cantidad</th>
                    <th className="text-left">Unidad</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidoData.productos.map((producto, index) => (
                    <tr key={index}>
                      <td>{producto.producto || "Producto"}</td>
                      <td>{producto.cantidad || "0"}</td>
                      <td>{producto.unidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <p>
                <strong>Fecha de entrega deseada:</strong> {pedidoData.fechaEntrega || "Por definir"}
              </p>
              <p>
                <strong>Urgencia:</strong> {pedidoData.urgencia.toUpperCase()}
              </p>
              {pedidoData.observaciones && (
                <p>
                  <strong>Observaciones:</strong> {pedidoData.observaciones}
                </p>
              )}
            </div>

            <div>
              <p>Favor confirmar disponibilidad y tiempo de entrega.</p>
              <p className="mt-2">
                Saludos cordiales,
                <br />
                Administración Granja Avícola
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={enviarPedido} className="flex-1">
              <Send className="h-4 w-4 mr-2" />
              Enviar Pedido por Correo
            </Button>
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Guardar Borrador
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function HistorialPedidos() {
  const pedidos = [
    {
      id: "PED-001",
      fecha: "2024-01-15",
      proveedor: "Fábrica de Concentrados La Esperanza",
      productos: "Alimento Iniciador (200 bultos)",
      total: "$8,000",
      estado: "entregado",
      fechaEntrega: "2024-01-18",
    },
    {
      id: "PED-002",
      fecha: "2024-01-20",
      proveedor: "Laboratorio Veterinario San Martín",
      productos: "Vacuna Newcastle (50 dosis)",
      total: "$1,250",
      estado: "en-transito",
      fechaEntrega: "2024-01-25",
    },
    {
      id: "PED-003",
      fecha: "2024-01-22",
      proveedor: "Distribuidora Agropecuaria Norte",
      productos: "Antibiótico (30 frascos)",
      total: "$900",
      estado: "pendiente",
      fechaEntrega: "2024-01-28",
    },
  ]

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "entregado":
        return "bg-green-50 text-green-700 border-green-200"
      case "en-transito":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "pendiente":
        return "bg-orange-50 text-orange-700 border-orange-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "entregado":
        return <CheckCircle className="h-4 w-4" />
      case "en-transito":
        return <Truck className="h-4 w-4" />
      case "pendiente":
        return <Clock className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Pedidos Este Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+3 vs mes anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Gastado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$24,500</div>
            <p className="text-xs text-muted-foreground">En productos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Pedidos Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Esperando entrega</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Pedidos</CardTitle>
          <CardDescription>Registro completo de todas las órdenes realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pedidos.map((pedido) => (
              <div key={pedido.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold">{pedido.id}</span>
                    <Badge variant="outline" className={getEstadoColor(pedido.estado)}>
                      {getEstadoIcon(pedido.estado)}
                      <span className="ml-1 capitalize">{pedido.estado.replace("-", " ")}</span>
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Fecha:</span>
                      <p className="font-medium">{new Date(pedido.fecha).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Proveedor:</span>
                      <p className="font-medium text-xs">{pedido.proveedor}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Productos:</span>
                      <p className="font-medium text-xs">{pedido.productos}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total:</span>
                      <p className="font-medium">{pedido.total}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Button>
                  {pedido.estado === "pendiente" && (
                    <Button size="sm" variant="outline">
                      <Phone className="h-3 w-3 mr-1" />
                      Seguimiento
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function GestionProveedores() {
  const proveedores = [
    {
      id: 1,
      nombre: "Fábrica de Concentrados La Esperanza",
      contacto: "María González",
      email: "pedidos@concentradosesperanza.com",
      telefono: "+57 300 123 4567",
      direccion: "Km 15 Vía Bogotá - Medellín",
      productos: ["Alimento Iniciador", "Alimento Crecimiento", "Alimento Finalizador"],
      tiempoEntrega: "2-3 días",
      calificacion: 4.8,
    },
    {
      id: 2,
      nombre: "Laboratorio Veterinario San Martín",
      contacto: "Dr. Carlos Ruiz",
      email: "ventas@labsanmartin.com",
      telefono: "+57 301 987 6543",
      direccion: "Calle 45 #23-67, Zona Industrial",
      productos: ["Vacuna Newcastle", "Vacuna Gumboro", "Vitaminas"],
      tiempoEntrega: "1-2 días",
      calificacion: 4.9,
    },
    {
      id: 3,
      nombre: "Distribuidora Agropecuaria Norte",
      contacto: "Ana Martínez",
      email: "pedidos@agronorte.com",
      telefono: "+57 302 456 7890",
      direccion: "Carrera 30 #15-45",
      productos: ["Antibióticos", "Desparasitantes", "Suplementos"],
      tiempoEntrega: "3-5 días",
      calificacion: 4.5,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Proveedores Registrados</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Proveedor
        </Button>
      </div>

      <div className="grid gap-4">
        {proveedores.map((proveedor) => (
          <Card key={proveedor.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-lg">{proveedor.nombre}</h4>
                  <p className="text-muted-foreground">Contacto: {proveedor.contacto}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="font-semibold">{proveedor.calificacion}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{proveedor.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{proveedor.telefono}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs">{proveedor.direccion}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span>Entrega: {proveedor.tiempoEntrega}</span>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Productos:</p>
                <div className="flex flex-wrap gap-2">
                  {proveedor.productos.map((producto, index) => (
                    <Badge key={index} variant="outline">
                      {producto}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline">
                  <Mail className="h-3 w-3 mr-1" />
                  Contactar
                </Button>
                <Button size="sm" variant="outline">
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  Hacer Pedido
                </Button>
                <Button size="sm" variant="outline">
                  <Eye className="h-3 w-3 mr-1" />
                  Ver Historial
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function DetalleProducto({ producto }: { producto: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Stock Actual</Label>
          <p className="font-semibold text-red-600">
            {producto.stockActual} {producto.unidad}
          </p>
        </div>
        <div>
          <Label>Stock Mínimo</Label>
          <p className="font-semibold">
            {producto.stockMinimo} {producto.unidad}
          </p>
        </div>
        <div>
          <Label>Días Restantes</Label>
          <p className="font-semibold text-orange-600">{producto.diasRestantes} días</p>
        </div>
        <div>
          <Label>Urgencia</Label>
          <Badge variant="outline" className="bg-red-50 text-red-700">
            {producto.urgencia.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div>
        <Label>Proveedor</Label>
        <p className="font-semibold">{producto.proveedor}</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-sm text-yellow-800">
          <strong>Recomendación:</strong> Se sugiere realizar pedido inmediato de al menos {producto.stockMinimo * 2}{" "}
          {producto.unidad}
          para evitar desabastecimiento.
        </p>
      </div>
    </div>
  )
}

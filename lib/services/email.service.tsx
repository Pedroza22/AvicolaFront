import type { Pedido, Proveedor } from "@/lib/types"

export class EmailService {
  /**
   * Genera el contenido del correo para un pedido
   */
  static generateOrderEmail(pedido: Pedido, proveedor: Proveedor, farmName: string): string {
    const productosTable = pedido.productos
      .map(
        (p) =>
          `<tr>
          <td>${p.producto}</td>
          <td>${p.cantidad}</td>
          <td>${p.unidad}</td>
        </tr>`,
      )
      .join("")

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .urgente { color: #ff6b6b; font-weight: bold; }
        </style>
      </head>
      <body>
        <h2>Pedido ${pedido.urgencia === "critica" ? "URGENTE" : ""} - ${farmName}</h2>
        <p>Estimados ${proveedor.nombre},</p>
        <p>Solicitamos cotización y disponibilidad para los siguientes productos:</p>
        
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Unidad</th>
            </tr>
          </thead>
          <tbody>
            ${productosTable}
          </tbody>
        </table>
        
        <p><strong>Fecha de entrega deseada:</strong> ${pedido.fechaEntrega}</p>
        <p><strong>Urgencia:</strong> <span class="${pedido.urgencia === "critica" ? "urgente" : ""}">${pedido.urgencia.toUpperCase()}</span></p>
        ${pedido.observaciones ? `<p><strong>Observaciones:</strong> ${pedido.observaciones}</p>` : ""}
        
        <p>Favor confirmar disponibilidad y tiempo de entrega.</p>
        <p>Saludos cordiales,<br/>Administración ${farmName}</p>
      </body>
      </html>
    `
  }

  /**
   * Simula el envío de correo (en producción usaría un servicio real)
   */
  static async sendEmail(to: string, subject: string, content: string): Promise<boolean> {
    // Aquí iría la integración con un servicio de email real
    // Por ejemplo: SendGrid, AWS SES, Resend, etc.
    // Only log in development to avoid leaking data in production logs
    try {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log("Enviando correo a:", to)
        // eslint-disable-next-line no-console
        console.log("Asunto:", subject)
        // eslint-disable-next-line no-console
        console.log("Contenido:", content)
      }
    } catch (_e) {
      // ignore if env is not available
    }

    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return true
  }

  /**
   * Envía un pedido por correo al proveedor
   */
  static async sendOrderEmail(pedido: Pedido, proveedor: Proveedor, farmName: string): Promise<boolean> {
    const subject = `Pedido ${pedido.urgencia === "critica" ? "URGENTE" : ""} - ${farmName}`
    const content = this.generateOrderEmail(pedido, proveedor, farmName)

    return this.sendEmail(proveedor.email, subject, content)
  }
}

import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import AuthInit from '@/lib/components/auth-init'
import { AuthGuard } from '@/lib/components/auth-guard'

export const metadata: Metadata = {
  title: 'AvicolaTrack - Sistema de Control Avícola',
  description: 'Sistema de gestión y control para granjas avícolas',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${GeistSans.className} ${GeistMono.variable}`}>
      <body>
        <AuthInit />
        <AuthGuard>
          {children}
        </AuthGuard>
        <Analytics />
      </body>
    </html>
  )
}

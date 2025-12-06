import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas públicas que no requieren autenticación
const publicRoutes = ['/login', '/auth-debug']

// Rutas que requieren autenticación
const protectedRoutes = [
  '/',
  '/crecimiento',
  '/disena',
  '/formularios',
  '/inventario',
  '/pedidos',
  '/prediccion',
  '/reportes'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Si es una ruta protegida
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // Verificar si hay token en sessionStorage (lo hacemos en el cliente)
    // Por ahora, si intentan acceder sin estar logueados, los redirigimos
    const hasSession = request.cookies.has('avicolatrack_session')
    
    if (!hasSession && pathname !== '/login') {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  // Si están en login y ya tienen sesión, redirigir al dashboard
  if (pathname === '/login') {
    const hasSession = request.cookies.has('avicolatrack_session')
    if (hasSession) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
}

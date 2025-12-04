/** @type {import('next').NextConfig} */
const nextConfig = {
  // En producción, NO ignorar errores de TypeScript y ESLint
  // Solo ignorar en desarrollo si es necesario para iteración rápida
  eslint: {
    // Cambiar a false para producción y corregir todos los errores
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  typescript: {
    // Cambiar a false para producción y corregir todos los errores
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  images: {
    unoptimized: true,
  },
  // Configuración de proxy para desarrollo
  // En producción, configurar el proxy en el servidor (nginx, etc.)
  async rewrites() {
    // Solo aplicar rewrites en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
      return [
        {
          source: '/api/:path*',
          destination: `${backendUrl}/api/:path*`,
        },
      ]
    }
    return []
  },
  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig

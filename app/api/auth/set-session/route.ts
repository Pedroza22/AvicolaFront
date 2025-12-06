import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * API Route para establecer la cookie de sesión de forma segura
 * desde el servidor después de un login exitoso
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { expiresIn } = body // segundos hasta expiración del token
    
    // Establecer cookie de sesión con opciones seguras
    const cookieStore = await cookies()
    cookieStore.set({
      name: 'avicolatrack_session',
      value: 'true',
      httpOnly: false, // Necesita ser false para que el cliente pueda verificarlo
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn || 3600, // 1 hora por defecto
      path: '/',
    })
    
    return NextResponse.json({ success: true }, {
      headers: {
        'Access-Control-Allow-Credentials': 'true',
      }
    })
  } catch (error) {
    console.error('Error setting session cookie:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to set session cookie' },
      { status: 500 }
    )
  }
}

/**
 * DELETE para eliminar la cookie de sesión (logout)
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('avicolatrack_session')
    
    return NextResponse.json({ success: true }, {
      headers: {
        'Access-Control-Allow-Credentials': 'true',
      }
    })
  } catch (error) {
    console.error('Error deleting session cookie:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete session cookie' },
      { status: 500 }
    )
  }
}

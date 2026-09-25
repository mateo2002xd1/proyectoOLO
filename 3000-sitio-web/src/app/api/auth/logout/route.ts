import { NextResponse } from 'next/server';
import { AUTH_COOKIES } from '@/shared/lib/auth-cookies';

export async function POST() {
  const response = NextResponse.json({ message: 'Sesión cerrada' });

  // La lista va en `auth-cookies.ts` y no repetida aquí: esta copia se había quedado
  // corta —le faltaban `sitio_userEmail` y `sitio_refreshToken`—, así que cerrar sesión
  // dejaba el correo del último usuario en el navegador.
  for (const name of AUTH_COOKIES) {
    response.cookies.set(name, '', { maxAge: 0, path: '/' });
  }

  return response;
}

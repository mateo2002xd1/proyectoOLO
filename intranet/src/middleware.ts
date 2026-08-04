import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// import { jwtVerify } from "jose";

/**
 * Middleware global de la intranet.
 * Intercepta TODAS las rutas — la intranet no tiene zona pública.
 *
 * @see 1-guia-del-proyecto.md §4.3 (middleware.ts — matcher: ['/:path*'] — TODO protegido)
 * @see 3-seguridad-del-proyecto.md §0.4 (La autorización SIEMPRE se verifica server-side)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  let isTokenValid = false;
  if (token) {
    try {
      const { decodeJwt } = await import('jose');
      const decoded = decodeJwt(token);
      if (!decoded.exp || decoded.exp * 1000 > Date.now()) {
        isTokenValid = true;
      }
    } catch (error) {
      console.error("[Middleware] Token verification failed:", error);
    }
  }

  // Rutas públicas / de login
  if (pathname.startsWith('/auth') || pathname.startsWith('/api-backend')) {
    // Si el usuario ya está logueado y trata de acceder a /auth, redirigir a /inicio
    if (isTokenValid && pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/inicio', request.url));
    }
    
    // Si hay un token inválido, lo limpiamos
    if (token && !isTokenValid && pathname.startsWith('/auth')) {
      const response = NextResponse.next();
      response.cookies.delete('token');
      return response;
    }

    return NextResponse.next();
  }

  // Rutas protegidas (intranet)
  if (!isTokenValid) {
    const response = NextResponse.redirect(new URL('/auth', request.url));
    if (token) {
      response.cookies.delete('token');
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|assets|favicon.ico).*)"],
};

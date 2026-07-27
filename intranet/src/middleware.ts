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
  
  if (pathname.startsWith('/login') || pathname.startsWith('/api-backend')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { decodeJwt } = await import('jose');
    const decoded = decodeJwt(token);
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      throw new Error("Token expired");
    }
    return NextResponse.next();
  } catch (error) {
    console.error("[Middleware] Token verification failed:", error);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|assets|favicon.ico).*)"],
};

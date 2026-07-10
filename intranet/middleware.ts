import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Middleware global de la intranet.
 * Intercepta TODAS las rutas — la intranet no tiene zona pública.
 *
 * @see ARQUITECTURA_MAESTRA_OLO.md §9.3 (middleware.ts — matcher: ['/:path*'] — TODO protegido)
 * @see ARQUITECTURA_MAESTRA_OLO.md §0.11 (La autorización SIEMPRE se verifica server-side)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith('/login')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.warn("WARNING: JWT_SECRET is not set in intranet environment.");
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me');
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (error) {
    console.error("[Middleware] Token verification failed:", error);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

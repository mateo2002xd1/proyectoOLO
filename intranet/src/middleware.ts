import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verificarSesion } from "@/shared/lib/verificar-sesion";

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

  // Verificación CON FIRMA y exigiendo `exp` — ver `verificar-sesion.ts` para los dos
  // agujeros que había aquí (firma sin comprobar, y tokens sin caducidad admitidos).
  const sesion = await verificarSesion(token);
  const isTokenValid = sesion !== null;
  const mustChangePassword = sesion?.debeCambiarPassword ?? false;
  const mustSetupSecurityQuestions = sesion?.debeConfigurarPreguntas ?? false;
  const isRestricted = mustChangePassword || mustSetupSecurityQuestions;

  const getRestrictedRedirect = () => {
    if (mustSetupSecurityQuestions && mustChangePassword) {
      return NextResponse.redirect(new URL('/login/first-login', request.url));
    } else if (mustSetupSecurityQuestions) {
      return NextResponse.redirect(new URL('/login/security-questions', request.url));
    } else if (mustChangePassword) {
      return NextResponse.redirect(new URL('/login/reset-password', request.url));
    }
    return NextResponse.redirect(new URL('/inicio', request.url)); // Fallback
  };

  // Rutas públicas / de login
  if (pathname.startsWith('/login') || pathname.startsWith('/api-backend')) {
    // Si el usuario pide salir explícitamente a /login?logout=1
    if (pathname === '/login' && request.nextUrl.searchParams.has('logout')) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }

    // Si el usuario ya está logueado y trata de acceder a /login, redirigir
    if (isTokenValid && pathname.startsWith('/login')) {
      if (isRestricted) {
        const isAllowedRestrictedRoute =
          pathname === '/login/first-login' ||
          pathname === '/login/reset-password' ||
          pathname === '/login/reset-success' ||
          pathname === '/login/security-questions';

        if (isAllowedRestrictedRoute) {
          return NextResponse.next();
        } else {
          return getRestrictedRedirect();
        }
      } else {
        return NextResponse.redirect(new URL('/inicio', request.url));
      }
    }

    // Si hay un token inválido, lo limpiamos
    if (token && !isTokenValid && pathname.startsWith('/login')) {
      const response = NextResponse.next();
      response.cookies.delete('token');
      return response;
    }

    return NextResponse.next();
  }

  // Rutas protegidas (intranet)
  if (!isTokenValid) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    if (token) {
      response.cookies.delete('token');
    }
    return response;
  }

  if (isRestricted) {
    return getRestrictedRedirect();
  }

  console.log('Intranet middleware checking permissions:', sesion?.permisos);

  if (!sesion?.permisos.includes('acceso.intranet')) {
    console.log('Acceso denegado a intranet, redirigiendo...');
    const response = NextResponse.redirect(new URL('/login?error=acceso_denegado', request.url));
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

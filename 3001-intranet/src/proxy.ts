import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verificarSesion } from "@/shared/lib/verificar-sesion";

/**
 * Pantallas de acceso: `app/(auth)/login/`. Desde el 2026-10-15 cuelgan de `/login`
 * (`/login/recovery`, `/login/first-login`...). La lista es explícita, no un prefijo,
 * para que solo estas rutas se salten la exigencia de sesión: sin ella, quien va a
 * recuperar su contraseña —que no tiene sesión— rebotaría al login.
 */
const RUTAS_DE_ACCESO = [
  '/login',
  '/login/first-login',
  '/login/recovery',
  '/login/first-login/security-questions',
  '/login/recovery/reset-password',
  '/login/recovery/reset-success',
];

/**
 * Las que se pueden visitar con una sesión que aún debe cambiar la contraseña o
 * configurar las preguntas. `/login` y `/login/recovery` no: con sesión no tienen nada
 * que hacer y se manda a la pantalla pendiente.
 */
const RUTAS_DE_CONFIGURACION_PENDIENTE = [
  '/login/first-login',
  '/login/recovery/reset-password',
  '/login/recovery/reset-success',
  '/login/first-login/security-questions',
];

/**
 * Middleware global de la intranet.
 * Intercepta TODAS las rutas — la intranet no tiene zona pública.
 *
 * @see 1-guia-del-proyecto.md §4.3 (middleware.ts — matcher: ['/:path*'] — TODO protegido)
 * @see 3-seguridad-del-proyecto.md §0.4 (La autorización SIEMPRE se verifica server-side)
 */
export async function proxy(request: NextRequest) {
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
      return NextResponse.redirect(new URL('/login/first-login/security-questions', request.url));
    } else if (mustChangePassword) {
      return NextResponse.redirect(new URL('/login/recovery/reset-password', request.url));
    }
    return NextResponse.redirect(new URL('/inicio', request.url)); // Fallback
  };

  const esRutaDeAcceso = RUTAS_DE_ACCESO.includes(pathname);

  // Rutas públicas / de login
  if (esRutaDeAcceso || pathname.startsWith('/api-backend')) {
    // Si el usuario pide salir explícitamente a /login?logout=1
    if (pathname === '/login' && request.nextUrl.searchParams.has('logout')) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }

    // Si el usuario ya está logueado y trata de acceder a una pantalla de acceso, redirigir
    if (isTokenValid && esRutaDeAcceso) {
      // Bloquear si tiene sesión pero no permisos para intranet (p. ej. si llega directo
      // a /login/first-login saltándose la vista de login, o redirigido desde el inicio)
      if (!sesion?.permisos.includes('acceso.intranet')) {
        const response = NextResponse.redirect(new URL('/login?error=acceso_denegado', request.url));
        if (token) {
          response.cookies.delete('token');
        }
        return response;
      }

      // La pantalla de éxito de restablecimiento se debe poder ver tras completar el cambio
      // o para verificar su visualización, sin rebotar a /inicio.
      if (pathname === '/login/recovery/reset-success') {
        return NextResponse.next();
      }

      if (isRestricted) {
        if (RUTAS_DE_CONFIGURACION_PENDIENTE.includes(pathname)) {
          return NextResponse.next();
        } else {
          return getRestrictedRedirect();
        }
      } else {
        return NextResponse.redirect(new URL('/inicio', request.url));
      }
    }

    // Si hay un token inválido, lo limpiamos
    if (token && !isTokenValid && esRutaDeAcceso) {
      const response = NextResponse.next();
      response.cookies.delete('token');
      return response;
    }

    return NextResponse.next();
  }

  // Rutas protegidas (intranet)
  if (!isTokenValid) {
    // Con `redirect` para volver aquí después de loguear — mismo parámetro que usa
    // el cierre por inactividad (`vigilante-sesion.tsx`), así que `LoginView` no
    // necesita distinguir de dónde vino el redirect.
    const destino = new URL('/login', request.url);
    destino.searchParams.set('redirect', pathname + request.nextUrl.search);
    const response = NextResponse.redirect(destino);
    if (token) {
      response.cookies.delete('token');
    }
    return response;
  }

  if (isRestricted) {
    return getRestrictedRedirect();
  }

  if (!sesion?.permisos.includes('acceso.intranet')) {
    const response = NextResponse.redirect(new URL('/login?error=acceso_denegado', request.url));
    if (token) {
      response.cookies.delete('token');
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  // `sw.js` y `manifest.webmanifest` quedan fuera porque el navegador los pide sin
  // sesión (el manifiesto, incluso, sin cookies): con el middleware delante recibirían
  // el login en su lugar y la intranet no se podría instalar. Ninguno lleva nada
  // privado; ver `shared/lib/pwa/`.
  matcher: ["/((?!_next/static|_next/image|assets|favicon.ico|sw.js|manifest.webmanifest).*)"],
};

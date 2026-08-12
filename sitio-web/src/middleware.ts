import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// import { jwtVerify } from 'jose';
import {
  AUTH_COOKIE_NAME,
  AUTH_ROLE_COOKIE_NAME,
  AUTH_MUST_CHANGE_PW_COOKIE_NAME,
  AUTH_MUST_SETUP_SQ_COOKIE_NAME,
} from '@/shared/lib/auth-cookies';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const role = request.cookies.get(AUTH_ROLE_COOKIE_NAME)?.value;
  const mustChangePassword = Boolean(request.cookies.get(AUTH_MUST_CHANGE_PW_COOKIE_NAME)?.value);
  const mustSetupSecurityQuestions = Boolean(request.cookies.get(AUTH_MUST_SETUP_SQ_COOKIE_NAME)?.value);

  // Validate session token if it exists
  let hasValidSession = false;
  if (token) {
    try {
      // Usamos decodeJwt para validar que exista y no haya expirado, sin requerir JWT_SECRET en frontend
      const { decodeJwt } = await import('jose');
      const decoded = decodeJwt(token);
      if (decoded.exp && decoded.exp * 1000 > Date.now()) {
        hasValidSession = true;
      }
    } catch (error) {
      console.error("[Middleware] Token verification failed:", error);
      hasValidSession = false;
    }
  }

  const isAdminRole = role === 'Superadmin' || role === 'Administrador';

  // Los alias de login (/login, /auth/login, /admin/auth...) los resuelve
  // `next.config.mjs`, que además se evalúa antes que este middleware. Aquí había
  // una copia de esa lista que nunca llegó a ejecutarse —el `matcher` de abajo no
  // incluye ninguna de esas rutas— y que hoy sería peligrosa: `/admin/login` pasó
  // a ser la ruta real del login, así que redirigirla desde aquí sería un bucle.

  // Login page: solo auto-redirigimos a admins con sesión válida (van directo al dashboard).
  // Editores u otros roles ven el formulario/selector post-login (el propio LoginView enruta).
  if (pathname === '/admin/login') {
    if (hasValidSession && isAdminRole) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes (/admin/dashboard, /admin/usuarios, /admin/editor/*): require session
  if (!hasValidSession) {
    const redirectUrl = new URL('/admin/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(redirectUrl);
    // Limpiar cookie inválida si existe
    if (token) response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  const loginRedirect = () => {
    const url = new URL('/admin/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  };

  // /admin/dashboard/* — solo Superadmin y Administrador pueden acceder
  if (pathname.startsWith('/admin/dashboard')) {
    if (!isAdminRole) {
      if (role === 'Editor') {
        return NextResponse.redirect(new URL('/admin/editor', request.url));
      }
      return loginRedirect();
    }
    // Must change password or setup security questions
    if (mustChangePassword || mustSetupSecurityQuestions) {
      return NextResponse.redirect(new URL('/admin/cambiar-contrasena', request.url));
    }
    return NextResponse.next();
  }

  // /admin/users y /admin/usuarios — solo Superadmin y Administrador pueden acceder (RF-04/RF-05)
  if (pathname.startsWith('/admin/users') || pathname.startsWith('/admin/usuarios')) {
    if (!isAdminRole) {
      return loginRedirect();
    }
  }

  // /admin/auditoria — solo Superadmin y Administrador (RF-07)
  // Espejo de `auditoria.policies.ts` en la API, que es quien manda: la bitácora
  // guarda IP y user-agent de cada editor, así que no la abre ni el propio editor.
  // Aquí se corta antes para no llevar a nadie a una pantalla que solo puede dar 403.
  if (pathname.startsWith('/admin/auditoria')) {
    if (!isAdminRole) {
      return loginRedirect();
    }
  }

  // /admin/editor/* — Superadmin, Administrador y Editor pueden acceder
  if (pathname.startsWith('/admin/editor')) {
    if (!isAdminRole && role !== 'Editor') {
      return loginRedirect();
    }
  }

  // Must change password or setup security questions
  if (mustChangePassword || mustSetupSecurityQuestions) {
    if (!pathname.startsWith('/admin/cambiar-contrasena')) {
      return NextResponse.redirect(new URL('/admin/cambiar-contrasena', request.url));
    }
  }

  // [INFRAESTRUCTURA] Permiso acceso.sitio
  // Cuando el sitio web tenga rutas protegidas para usuarios de sitio
  // (e.g. /portal/*, /mi-cuenta/*), agregar aquí la validación contra
  // el JWT de sitio-user: el payload incluirá el campo 'permissions'
  // o se comprobará contra el permiso 'acceso.sitio'.
  // Por ahora el sitio web es enteramente público, no se aplica ningún bloqueo.

  return NextResponse.next();
}

export const config = {
  // Protege dashboard, usuarios/users, auditoría, editor y maneja /admin/login
  // y /admin/cambiar-contrasena.
  //
  // Es una lista explícita, no un prefijo: `/admin/recuperar` queda fuera a
  // propósito, porque quien va a recuperar su contraseña no tiene sesión.
  matcher: [
    '/admin/dashboard/:path*',
    '/admin/users/:path*',
    '/admin/users',
    '/admin/usuarios/:path*',
    '/admin/usuarios',
    '/admin/auditoria/:path*',
    '/admin/auditoria',
    '/admin/editor/:path*',
    '/admin/login',
    '/admin/cambiar-contrasena',
  ],
};

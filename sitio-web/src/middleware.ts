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

  // Redirecciones automáticas para alias comunes de login hacia /admin/auth/login
  if (
    pathname === '/login' ||
    pathname === '/admin/login' ||
    pathname === '/auth/login' ||
    pathname === '/admin/auth'
  ) {
    const redirectUrl = new URL('/admin/auth/login', request.url);
    const search = request.nextUrl.search;
    if (search) redirectUrl.search = search;
    return NextResponse.redirect(redirectUrl);
  }

  // Login page: solo auto-redirigimos a admins con sesión válida (van directo al dashboard).
  // Editores u otros roles ven el formulario/selector post-login (el propio page.tsx enruta).
  if (pathname === '/login') {
    if (hasValidSession && isAdminRole) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes (/dashboard, /usuarios, /editor/*): require session
  if (!hasValidSession) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(redirectUrl);
    // Limpiar cookie inválida si existe
    if (token) response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  const loginRedirect = () => {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  };

  // /admin/dashboard/* — solo Superadmin y Administrador pueden acceder.
  // El Editor tiene sesión válida pero no debe entrar al dashboard: se redirige
  // directamente a su área de trabajo (/admin/editor), no al login.
  if (pathname.startsWith('/admin/dashboard')) {
    if (!isAdminRole) {
      if (role === 'Editor') {
        return NextResponse.redirect(new URL('/admin/editor', request.url));
      }
      return loginRedirect();
    }
    // Must change password or setup security questions
    if (mustChangePassword || mustSetupSecurityQuestions) {
      return NextResponse.redirect(new URL('/cambiar-contrasena', request.url));
    }
    return NextResponse.next();
  }

  // /users y /usuarios — solo Superadmin y Administrador pueden acceder (RF-04/RF-05)
  if (pathname.startsWith('/users') || pathname.startsWith('/usuarios')) {
    if (!isAdminRole) {
      return loginRedirect();
    }
  }

  // /editor/* — Superadmin, Administrador y Editor pueden acceder
  if (pathname.startsWith('/editor')) {
    if (!isAdminRole && role !== 'Editor') {
      return loginRedirect();
    }
  }

  // Must change password or setup security questions
  if (mustChangePassword || mustSetupSecurityQuestions) {
    if (!pathname.startsWith('/cambiar-contrasena')) {
      return NextResponse.redirect(new URL('/cambiar-contrasena', request.url));
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
  // Protege dashboard, usuarios/users, editor y maneja /admin/auth/login, alias de login y /admin/auth/cambiar-contrasena.
  matcher: [
    '/admin/dashboard/:path*',
    '/admin/users/:path*',
    '/admin/users',
    '/admin/usuarios/:path*',
    '/admin/usuarios',
    '/admin/editor/:path*',
    '/admin/auth/login',
    '/admin/auth/cambiar-contrasena',
    '/login',
    '/admin/login',
    '/auth/login',
    '/admin/auth',
  ],
};

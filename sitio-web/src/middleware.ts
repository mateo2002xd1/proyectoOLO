import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// import { jwtVerify } from 'jose';
import {
  AUTH_COOKIE_NAME,
  AUTH_ROLE_COOKIE_NAME,
  AUTH_MUST_CHANGE_PW_COOKIE_NAME,
  AUTH_MUST_SETUP_SQ_COOKIE_NAME,
} from '@/config/auth-cookies';

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

  // Login page: redirect to panel (or redirect param) if already logged in
  if (pathname === '/login') {
    if (hasValidSession) {
      const redirectTo = request.nextUrl.searchParams.get('redirect');
      const destination = redirectTo && redirectTo.startsWith('/') ? redirectTo : '/panel-general';
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return NextResponse.next();
  }

  // Protected routes (/admin/* and /panel-general/*): require session
  if (!hasValidSession) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(redirectUrl);
    // Limpiar cookie inválida si existe
    if (token) response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  // /panel-general/* — solo Superadmin y Administrador pueden acceder
  if (pathname.startsWith('/panel-general')) {
    if (role !== 'Superadmin' && role !== 'Administrador') {
      return NextResponse.redirect(new URL('/admin/sin-acceso', request.url));
    }
    // Must change password or setup security questions
    if (mustChangePassword || mustSetupSecurityQuestions) {
      return NextResponse.redirect(new URL('/admin/cambiar-contrasena', request.url));
    }
    return NextResponse.next();
  }

  // Role-based access for /admin/* routes
  // Editor can access /admin/editor/* but not other admin routes
  if (pathname.startsWith('/admin/editor')) {
    if (role !== 'Superadmin' && role !== 'Administrador' && role !== 'Editor') {
      return NextResponse.redirect(new URL('/admin/sin-acceso', request.url));
    }
  } else if (pathname.startsWith('/admin')) {
    // Excluir rutas de cambio de contraseña del check estricto de admin
    if (!pathname.startsWith('/admin/cambiar-contrasena') && !pathname.startsWith('/admin/sin-acceso')) {
      if (role !== 'Superadmin' && role !== 'Administrador') {
        return NextResponse.redirect(new URL('/admin/sin-acceso', request.url));
      }
    }
  }

  // Must change password or setup security questions
  if (mustChangePassword || mustSetupSecurityQuestions) {
    if (!pathname.startsWith('/admin/cambiar-contrasena')) {
      return NextResponse.redirect(new URL('/admin/cambiar-contrasena', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Protege rutas admin, panel-general y maneja /login; excluye API routes y assets
  matcher: ['/admin/:path*', '/panel-general/:path*', '/login'],
};

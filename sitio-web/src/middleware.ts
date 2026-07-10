import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  AUTH_ROLE_COOKIE_NAME,
  AUTH_MUST_CHANGE_PW_COOKIE_NAME,
  AUTH_MUST_SETUP_SQ_COOKIE_NAME,
} from '@/config/auth-cookies';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  const role = request.cookies.get(AUTH_ROLE_COOKIE_NAME)?.value;
  const mustChangePassword = Boolean(request.cookies.get(AUTH_MUST_CHANGE_PW_COOKIE_NAME)?.value);
  const mustSetupSecurityQuestions = Boolean(request.cookies.get(AUTH_MUST_SETUP_SQ_COOKIE_NAME)?.value);

  // Login page: redirect to panel (or redirect param) if already logged in
  if (pathname === '/admin/login') {
    if (hasSession) {
      const redirectTo = request.nextUrl.searchParams.get('redirect');
      const destination = redirectTo && redirectTo.startsWith('/') ? redirectTo : '/panel-general';
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return NextResponse.next();
  }

  // Protected routes (/admin/* and /panel-general/*): require session
  if (!hasSession) {
    const redirectUrl = new URL('/admin/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // /panel-general/* — cualquier rol autenticado puede acceder
  if (pathname.startsWith('/panel-general')) {
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
  } else {
    if (role !== 'Superadmin' && role !== 'Administrador') {
      return NextResponse.redirect(new URL('/admin/sin-acceso', request.url));
    }
  }

  // Must change password or setup security questions
  if (mustChangePassword || mustSetupSecurityQuestions) {
    return NextResponse.redirect(new URL('/admin/cambiar-contrasena', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Protege rutas admin y panel-general; excluye API routes y assets
  matcher: ['/admin/:path*', '/panel-general/:path*'],
};

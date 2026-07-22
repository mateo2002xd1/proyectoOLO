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

  // Login page: redirect to panel (or redirect param) if already logged in
  if (pathname === '/login') {
    if (hasValidSession) {
      const redirectTo = request.nextUrl.searchParams.get('redirect');
      const destination = redirectTo && redirectTo.startsWith('/') ? redirectTo : '/dashboard';
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return NextResponse.next();
  }

  // Protected routes (/dashboard, /usuarios, /contenido/*): require session
  if (!hasValidSession) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(redirectUrl);
    // Limpiar cookie inválida si existe
    if (token) response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  // /dashboard/* — solo Superadmin y Administrador pueden acceder
  if (pathname.startsWith('/dashboard')) {
    if (role !== 'Superadmin' && role !== 'Administrador') {
      return NextResponse.redirect(new URL('/sin-acceso', request.url));
    }
    // Must change password or setup security questions
    if (mustChangePassword || mustSetupSecurityQuestions) {
      return NextResponse.redirect(new URL('/cambiar-contrasena', request.url));
    }
    return NextResponse.next();
  }

  // /users y /usuarios — solo Superadmin y Administrador pueden acceder (RF-04/RF-05)
  if (pathname.startsWith('/users') || pathname.startsWith('/usuarios')) {
    if (role !== 'Superadmin' && role !== 'Administrador') {
      return NextResponse.redirect(new URL('/sin-acceso', request.url));
    }
  }

  // /contenido/*/editor — Superadmin, Administrador y Editor pueden acceder
  if (pathname.startsWith('/contenido')) {
    if (role !== 'Superadmin' && role !== 'Administrador' && role !== 'Editor') {
      return NextResponse.redirect(new URL('/sin-acceso', request.url));
    }
  }

  // Must change password or setup security questions
  if (mustChangePassword || mustSetupSecurityQuestions) {
    if (!pathname.startsWith('/cambiar-contrasena') && !pathname.startsWith('/sin-acceso')) {
      return NextResponse.redirect(new URL('/cambiar-contrasena', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Protege dashboard, usuarios/users, contenido y maneja /login; excluye API routes y assets.
  // TODO(RF-16): /sin-acceso y /cambiar-contrasena aún no tienen page.tsx — el middleware
  // ya redirige a ellas, pero faltan por construir.
  matcher: [
    '/dashboard/:path*',
    '/users/:path*',
    '/users',
    '/usuarios/:path*',
    '/usuarios',
    '/contenido/:path*',
    '/login',
    '/sin-acceso',
    '/cambiar-contrasena',
  ],
};

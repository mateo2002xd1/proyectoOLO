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

  // Login page: solo auto-redirigimos a admins con sesión válida (van directo al dashboard).
  // Editores u otros roles ven el formulario/selector post-login (el propio page.tsx enruta).
  if (pathname === '/admin/auth/login') {
    if (hasValidSession && isAdminRole) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes (/admin/dashboard, /admin/usuarios, /admin/editor/*): require session
  if (!hasValidSession) {
    const redirectUrl = new URL('/admin/auth/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(redirectUrl);
    // Limpiar cookie inválida si existe
    if (token) response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  const loginRedirect = () => {
    const url = new URL('/admin/auth/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  };

  // /admin/dashboard/* — solo Superadmin y Administrador pueden acceder
  if (pathname.startsWith('/admin/dashboard')) {
    if (!isAdminRole) {
      return loginRedirect();
    }
    // Must change password or setup security questions
    if (mustChangePassword || mustSetupSecurityQuestions) {
      return NextResponse.redirect(new URL('/admin/auth/cambiar-contrasena', request.url));
    }
    return NextResponse.next();
  }

  // /admin/users y /admin/usuarios — solo Superadmin y Administrador pueden acceder (RF-04/RF-05)
  if (pathname.startsWith('/admin/users') || pathname.startsWith('/admin/usuarios')) {
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
    if (!pathname.startsWith('/admin/auth/cambiar-contrasena')) {
      return NextResponse.redirect(new URL('/admin/auth/cambiar-contrasena', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Protege dashboard, usuarios/users, editor y maneja /admin/auth/login y /admin/auth/cambiar-contrasena.
  matcher: [
    '/admin/dashboard/:path*',
    '/admin/users/:path*',
    '/admin/users',
    '/admin/usuarios/:path*',
    '/admin/usuarios',
    '/admin/editor/:path*',
    '/admin/auth/login',
    '/admin/auth/cambiar-contrasena',
  ],
};

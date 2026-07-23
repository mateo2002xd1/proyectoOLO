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

  // /dashboard/* — solo Superadmin y Administrador pueden acceder
  if (pathname.startsWith('/dashboard')) {
    if (!isAdminRole) {
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

  return NextResponse.next();
}

export const config = {
  // Protege dashboard, usuarios/users, editor y maneja /login y /cambiar-contrasena.
  matcher: [
    '/dashboard/:path*',
    '/users/:path*',
    '/users',
    '/usuarios/:path*',
    '/usuarios',
    '/editor/:path*',
    '/login',
    '/cambiar-contrasena',
  ],
};

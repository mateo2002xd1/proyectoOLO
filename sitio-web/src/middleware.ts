import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIES,
  PARAM_MOTIVO,
  MOTIVO_SESION_EXPIRADA,
  MOTIVO_SIN_PERMISOS,
} from '@/shared/lib/auth-cookies';
import { verificarSesion } from '@/shared/lib/verificar-sesion';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // La sesión se comprueba CONTRA LA FIRMA (ver `verificar-sesion.ts`). Antes se
  // descodificaba sin verificar y, peor, el rol se leía de la cookie `sitio_role`,
  // que no es HttpOnly: cualquiera podía escribir `sitio_role=Superadmin` en el
  // navegador y abrir /admin/users o /admin/auditoria. La API nunca entregó datos
  // así, pero las pantallas se abrían.
  const sesion = await verificarSesion(token);
  const hasValidSession = sesion !== null;

  // Todo lo que decide acceso sale del token verificado, no de las cookies legibles.
  const permisos = sesion?.permisos || [];
  const hasAccesoPanel = permisos.includes('acceso.panel');
  const hasPermisosEdicion = permisos.some((p: string) => 
    p.startsWith('editar.') || p.startsWith('secciones.') || p.startsWith('editor.')
  );
  
  const mustChangePassword = sesion?.debeCambiarPassword ?? false;
  const mustSetupSecurityQuestions = sesion?.debeConfigurarPreguntas ?? false;

  // Los alias de login (/admin/login, /auth/login, /admin/auth...) los resuelve
  // `next.config.mjs`, que además se evalúa antes que este middleware. Aquí había
  // una copia de esa lista que nunca llegó a ejecutarse —el `matcher` de abajo no
  // incluye ninguna de esas rutas— y que además sería peligrosa: incluía `/login`,
  // que hoy es la ruta real del login, así que redirigirla desde aquí sería un bucle.

  // Login page: solo auto-redirigimos a admins con sesión válida (van directo al dashboard).
  // Editores u otros roles ven el formulario/selector post-login (el propio LoginView enruta).
  if (pathname === '/login') {
    if (hasValidSession && hasAccesoPanel) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes (/admin/dashboard, /admin/usuarios, /editor/*): require session
  if (!hasValidSession) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    // Se distingue «nunca entraste» de «tu sesión dejó de valer»: sin esto el login
    // aparecía igual en los dos casos y quien llevaba rato trabajando no entendía por
    // qué volvía al formulario.
    if (token) redirectUrl.searchParams.set(PARAM_MOTIVO, MOTIVO_SESION_EXPIRADA);

    const response = NextResponse.redirect(redirectUrl);
    // Se borran TODAS, no solo el token: `sitio_role` y compañía sobrevivían a la
    // sesión y dejaban la interfaz afirmando un rol que ya no vale (ver `AUTH_COOKIES`).
    if (token) for (const cookie of AUTH_COOKIES) response.cookies.delete(cookie);
    return response;
  }

  const loginRedirect = () => {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    url.searchParams.set(PARAM_MOTIVO, MOTIVO_SIN_PERMISOS);
    return NextResponse.redirect(url);
  };

  // /admin/dashboard/* — requiere acceso al panel
  if (pathname.startsWith('/admin/dashboard')) {
    if (!hasAccesoPanel) {
      if (hasPermisosEdicion) {
        return NextResponse.redirect(new URL('/editor', request.url));
      }
      return loginRedirect();
    }
    // Must change password or setup security questions
    if (mustChangePassword || mustSetupSecurityQuestions) {
      return NextResponse.redirect(new URL('/first-login', request.url));
    }
    return NextResponse.next();
  }

  // /admin/users y /admin/usuarios — requiere acceso al panel
  if (pathname.startsWith('/admin/users') || pathname.startsWith('/admin/usuarios')) {
    if (!hasAccesoPanel) {
      return loginRedirect();
    }
  }

  // /admin/roles — requiere acceso al panel
  if (pathname.startsWith('/admin/roles')) {
    if (!hasAccesoPanel) {
      return loginRedirect();
    }
  }

  // /admin/auditoria — requiere acceso al panel
  if (pathname.startsWith('/admin/auditoria')) {
    if (!hasAccesoPanel) {
      return loginRedirect();
    }
  }

  // /admin/revision — requiere acceso al panel
  if (pathname.startsWith('/admin/revision')) {
    if (!hasAccesoPanel) {
      return loginRedirect();
    }
  }

  // /admin/actualizaciones — requiere acceso al panel (antes "Soporte", sin uso real)
  if (pathname.startsWith('/admin/actualizaciones')) {
    if (!hasAccesoPanel) {
      return loginRedirect();
    }
  }

  // /editor/* — cualquiera con permisos de edición. Vive fuera de /admin desde el
  // 2026-09-18; /admin/editor/* redirige aquí desde next.config.mjs.
  if (pathname.startsWith('/editor')) {
    if (!hasAccesoPanel && !hasPermisosEdicion) {
      return loginRedirect();
    }
  }

  // Must change password or setup security questions
  if (mustChangePassword || mustSetupSecurityQuestions) {
    if (!pathname.startsWith('/first-login')) {
      return NextResponse.redirect(new URL('/first-login', request.url));
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
  // Protege dashboard, usuarios/users, auditoría, revisión, mi-perfil, editor y
  // maneja /login y /first-login.
  //
  // Es una lista explícita, no un prefijo: los pasos de la recuperación
  // (`/recovery`, `/security-questions`, `/reset-password`, `/reset-success`) quedan
  // fuera a propósito, porque quien va a recuperar su contraseña no tiene sesión.
  matcher: [
    '/admin/dashboard/:path*',
    '/admin/users/:path*',
    '/admin/users',
    '/admin/usuarios/:path*',
    '/admin/usuarios',
    '/admin/auditoria/:path*',
    '/admin/auditoria',
    '/admin/roles/:path*',
    '/admin/roles',
    '/admin/revision/:path*',
    '/admin/revision',
    '/admin/actualizaciones/:path*',
    '/admin/actualizaciones',
    '/admin/mi-perfil/:path*',
    '/admin/mi-perfil',
    '/editor/:path*',
    '/login',
    '/first-login',
  ],
};

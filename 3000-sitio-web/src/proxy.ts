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
import { rutaDelPrimerIngreso } from '@/shared/lib/ruta-del-primer-ingreso';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // La sesión se comprueba CONTRA LA FIRMA (ver `verificar-sesion.ts`). Antes se
  // descodificaba sin verificar y, peor, el rol se leía de la cookie `sitio_role`,
  // que no es HttpOnly: cualquiera podía escribir `sitio_role=Superadmin` en el
  // navegador y abrir /admin-panel/users o /admin-panel/changelog-view. La API nunca entregó datos
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
  /** La pantalla del primer ingreso que le toca a esta sesión, según lo que le falte. */
  const primerIngreso = () =>
    NextResponse.redirect(
      new URL(
        rutaDelPrimerIngreso({
          debeCambiarPassword: mustChangePassword,
          debeConfigurarPreguntas: mustSetupSecurityQuestions,
        }),
        request.url,
      ),
    );

  // Los alias de login (/admin/login, /auth/login, /admin/auth...) los resuelve
  // `next.config.mjs`, que además se evalúa antes que este middleware. Aquí había
  // una copia de esa lista que nunca llegó a ejecutarse —el `matcher` de abajo no
  // incluye ninguna de esas rutas— y que además sería peligrosa: incluía `/login`,
  // que hoy es la ruta real del login, así que redirigirla desde aquí sería un bucle.

  // Login page: solo auto-redirigimos a admins con sesión válida (van directo al dashboard).
  // Editores u otros roles ven el formulario/selector post-login (el propio LoginView enruta).
  if (pathname === '/login') {
    if (hasValidSession && hasAccesoPanel) {
      return NextResponse.redirect(new URL('/admin-panel/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes (/admin-panel/dashboard, /admin/usuarios, /editor/*): require session
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

  // /admin-panel/dashboard/* — requiere acceso al panel
  if (pathname.startsWith('/admin-panel/dashboard')) {
    if (!hasAccesoPanel) {
      if (hasPermisosEdicion) {
        return NextResponse.redirect(new URL('/editor', request.url));
      }
      return loginRedirect();
    }
    // Must change password or setup security questions
    if (mustChangePassword || mustSetupSecurityQuestions) {
      return primerIngreso();
    }
    return NextResponse.next();
  }

  // /admin-panel/users y /admin/usuarios — requiere acceso al panel
  if (pathname.startsWith('/admin-panel/users') || pathname.startsWith('/admin/usuarios')) {
    if (!hasAccesoPanel) {
      return loginRedirect();
    }
  }

  // /admin-panel/roles-and-permissions — requiere acceso al panel
  if (pathname.startsWith('/admin-panel/roles-and-permissions')) {
    if (!hasAccesoPanel) {
      return loginRedirect();
    }
  }

  // /admin-panel/changelog-view — requiere acceso al panel
  if (pathname.startsWith('/admin-panel/changelog-view')) {
    if (!hasAccesoPanel) {
      return loginRedirect();
    }
  }

  // /admin-panel/review-section — requiere acceso al panel
  if (pathname.startsWith('/admin-panel/review-section')) {
    if (!hasAccesoPanel) {
      return loginRedirect();
    }
  }

  // /admin-panel/update-section — requiere acceso al panel (antes "Soporte", sin uso real)
  if (pathname.startsWith('/admin-panel/update-section')) {
    if (!hasAccesoPanel) {
      return loginRedirect();
    }
  }

  // /admin-panel/configuration — requiere acceso al panel
  if (pathname.startsWith('/admin-panel/configuration')) {
    if (!hasAccesoPanel) {
      return loginRedirect();
    }
  }

  // /admin-panel/backup-section — requiere acceso al panel
  if (pathname.startsWith('/admin-panel/backup-section')) {
    if (!hasAccesoPanel) {
      return loginRedirect();
    }
  }

  // /admin-panel/search-section — requiere acceso al panel
  if (pathname.startsWith('/admin-panel/search-section')) {
    if (!hasAccesoPanel) {
      return loginRedirect();
    }
  }

  // /admin-panel/profile — requiere acceso al panel. `/admin/mi-perfil` no llega aquí: lo
  // redirige `next.config.mjs`, que se evalúa antes.
  if (pathname.startsWith('/admin-panel/profile')) {
    if (!hasAccesoPanel) {
      return loginRedirect();
    }
  }

  // /editor/* — cualquiera con permisos de edición. Vive fuera del panel desde el
  // 2026-09-18; /admin/editor/* redirige aquí desde next.config.mjs.
  if (pathname.startsWith('/editor')) {
    if (!hasAccesoPanel && !hasPermisosEdicion) {
      return loginRedirect();
    }
  }

  // Must change password or setup security questions
  if (mustChangePassword || mustSetupSecurityQuestions) {
    if (!pathname.startsWith('/login/first-login')) {
      return primerIngreso();
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
  // Protege dashboard, usuarios/users, auditoría, revisión, perfil, editor y
  // maneja /login y las tres direcciones del primer ingreso.
  //
  // Es una lista explícita, no un prefijo: los pasos de la recuperación
  // (`/login/recovery/*`) quedan fuera a propósito, porque quien va a recuperar su
  // contraseña no tiene sesión.
  matcher: [
    '/admin-panel/dashboard/:path*',
    '/admin-panel/users/:path*',
    '/admin-panel/users',
    '/admin/usuarios/:path*',
    '/admin/usuarios',
    '/admin-panel/changelog-view/:path*',
    '/admin-panel/changelog-view',
    '/admin-panel/roles-and-permissions/:path*',
    '/admin-panel/roles-and-permissions',
    '/admin-panel/review-section/:path*',
    '/admin-panel/review-section',
    '/admin-panel/update-section/:path*',
    '/admin-panel/update-section',
    '/admin-panel/configuration/:path*',
    '/admin-panel/configuration',
    '/admin-panel/backup-section/:path*',
    '/admin-panel/backup-section',
    '/admin-panel/search-section/:path*',
    '/admin-panel/search-section',
    '/admin-panel/profile/:path*',
    '/admin-panel/profile',
    '/editor/:path*',
    '/login',
    '/login/first-login',
    '/login/first-login/security-questions',
    '/login/first-login/change-password',
  ],
};

import { cookies } from 'next/headers';
import {
  AUTH_COOKIE_NAME,
  AUTH_ROLE_COOKIE_NAME,
  AUTH_USER_NAME_COOKIE_NAME,
  AUTH_USER_EMAIL_COOKIE_NAME,
} from '@/shared/lib/session/auth-cookies';

export type AuthSession = {
  hasSession: boolean;
  token: string | null;
  role: string | null;
  name: string | null;
};

export async function getAuthSessionSnapshot(): Promise<AuthSession> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value || null;
  const role = cookieStore.get(AUTH_ROLE_COOKIE_NAME)?.value || null;
  const name = cookieStore.get(AUTH_USER_NAME_COOKIE_NAME)?.value || null;

  return {
    hasSession: Boolean(token),
    token,
    role,
    name,
  };
}

export async function getSessionPermissionsSnapshot(): Promise<{ role: string | null; permissions: string[] }> {
  const session = await getAuthSessionSnapshot();
  if (!session.token) return { role: null, permissions: [] };

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return { role: session.role, permissions: [] };

    const res = await fetch(`${process.env.BACKEND_URL || 'http://localhost:4000'}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!res.ok) return { role: session.role, permissions: [] };

    const { user, permisos } = await res.json();

    // /api/me devuelve el array de permisos en la raíz de la respuesta, no dentro de user
    const permissions = permisos || [];

    // El rol de la cookie es el de cuando se inició sesión; `user.role` lo resuelve
    // `auth.middleware.ts` desde la fila en cada petición. Sin este `user?.role`, a
    // alguien degradado de rol el gate del editor lo seguía tratando con el rol viejo
    // hasta que volvía a iniciar sesión — la misma brecha que ya se cerró en la API
    // (ver "Rol tomado del JWT" en 3-seguridad-del-proyecto.md), pero aquí seguía abierta.
    return { role: user?.role ?? session.role, permissions };
  } catch {
    return { role: session.role, permissions: [] };
  }
}

/**
 * Si a la sesión le queda algo del primer ingreso (la contraseña temporal o las preguntas
 * de seguridad), según la base y no según el token.
 *
 * El proxy lo decide con las marcas del JWT, que se escriben al iniciar sesión: si después
 * un administrador restablece la contraseña o las preguntas de esta cuenta, o el login
 * descubre que le faltan preguntas, el token sigue diciendo «nada pendiente» y el panel se
 * abre. La API, que lee la fila, le responde 403 a todo, y cada pantalla lo enseñaba como
 * un fallo de carga con «Reintentar», que nunca lo arreglaba. `/api/me` sí lee la fila.
 *
 * Sin API, o con cualquier otro fallo, responde `false`: no se puede saber, y las
 * pantallas ya cuentan esa caída con su propio aviso.
 */
export async function tieneConfiguracionPendiente(): Promise<boolean> {
  const { token } = await getAuthSessionSnapshot();
  if (!token) return false;

  try {
    const res = await fetch(`${process.env.BACKEND_URL || 'http://localhost:4000'}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return false;
    const { configuracionPendiente } = await res.json();
    return configuracionPendiente === true;
  } catch {
    return false;
  }
}

export async function getAuthUserProfile(): Promise<{ name: string; email: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return { name: '', email: '' };

    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return { name: '', email: '' };

    const payloadString = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    const payload = JSON.parse(payloadString);

    const overrideName = cookieStore.get(AUTH_USER_NAME_COOKIE_NAME)?.value;
    const overrideEmail = cookieStore.get(AUTH_USER_EMAIL_COOKIE_NAME)?.value;

    // El token trae nombre y apellidos por separado: el panel los muestra juntos.
    const nombreCompleto = `${payload.name || ''} ${payload.apellidos || ''}`.trim();

    return {
      name: overrideName || nombreCompleto,
      email: overrideEmail || payload.email || ''
    };
  } catch (err) {
    console.error('Error decoding token for user profile:', err);
    return { name: '', email: '' };
  }
}

export async function assertPagePermission(requiredPermission: string): Promise<boolean> {
  const { permissions } = await getSessionPermissionsSnapshot();
  return permissions.includes(requiredPermission);
}

/** Quien puede abrir el editor de páginas. Mismo criterio que `app/preview/`. */
const ROLES_QUE_EDITAN = ['superadmin', 'administrador', 'editor'];

/**
 * Si esta sesión puede editar páginas.
 *
 * Va por el rol de la cookie y no por `assertPagePermission('edit_post')` a
 * propósito: el permiso real exige dos peticiones al backend sin caché y devuelve
 * la lista vacía ante cualquier fallo, así que un backend lento dejaría a los
 * editores sin botón. Esto se llama desde el layout público, o sea en cada
 * request de cada página del sitio. La comprobación de verdad la hace el backend
 * al guardar; esto solo decide si se pinta el botón.
 */
export async function puedeEditarPaginas(): Promise<boolean> {
  const { role } = await getAuthSessionSnapshot();
  const lowerRole = (role ?? '').trim().toLowerCase();
  
  // Roles estándar: se asume que pueden editar para ahorrar la llamada a la API
  if (ROLES_QUE_EDITAN.includes(lowerRole)) {
    return true;
  }

  // Si no hay rol (no autenticado), no puede editar
  if (!role) {
    return false;
  }

  // Para roles personalizados, verificamos si tienen algún permiso de edición en el backend
  const { permissions } = await getSessionPermissionsSnapshot();
  return permissions.some(p => p.startsWith('editar.sitio.') || p === 'secciones.crear');
}

/**
 * Si esta sesión puede editar **esta** sección del sitio, y la sección existe.
 *
 * `puedeEditarPaginas()` solo mira el rol, así que no distingue una sección creada y
 * todavía vacía de una URL inventada: a un editor le ofrecía «Editar sección» en
 * `/lo-que-sea`, y editar ahí crea la página al guardar. Esto pregunta a la API con
 * la misma guardia que usa el editor (`requierePermisoDeSeccion` en `GET
 * /api/paginas/:slug/editable`): 404 si la sección no existe, 403 si no es suya, 200
 * si puede abrirla. Cuesta una petición, así que quien llama lo usa solo cuando ya
 * sabe que la página no tiene nada publicado.
 *
 * La cabecera de ámbito va escrita aquí y no importada de `features/editor/model/
 * ambito.ts`: `shared/` no depende de las features.
 */
export async function puedeEditarSeccion(slug: string): Promise<boolean> {
  const { token } = await getAuthSessionSnapshot();
  if (!token) return false;

  try {
    const res = await fetch(
      `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/paginas/${encodeURIComponent(slug)}/editable`,
      {
        headers: { Authorization: `Bearer ${token}`, 'X-Ambito': 'sitio' },
        cache: 'no-store',
      }
    );
    return res.ok;
  } catch {
    // Sin API no se puede saber: se trata como «no», que acaba en el 404 de siempre.
    return false;
  }
}

export async function resolveFirstAccessibleRoute(role: string): Promise<string> {
  const roleRoutes: Record<string, string[]> = {
    Superadmin: ['/admin-panel/dashboard'],
    Administrador: ['/admin-panel/dashboard'],
    Editor: ['/admin-panel/dashboard'],
    Director: ['/admin-panel/dashboard'],
    Subdirector: ['/admin-panel/dashboard'],
  };

  const routes = roleRoutes[role] || ['/sin-acceso'];
  return routes[0] || '/sin-acceso';
}

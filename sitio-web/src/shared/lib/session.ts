import { cookies } from 'next/headers';
import {
  AUTH_COOKIE_NAME,
  AUTH_ROLE_COOKIE_NAME,
  AUTH_USER_NAME_COOKIE_NAME,
  AUTH_USER_EMAIL_COOKIE_NAME,
} from '@/shared/lib/auth-cookies';

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

    return { role: session.role, permissions };
  } catch {
    return { role: session.role, permissions: [] };
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

export async function resolveFirstAccessibleRoute(role: string): Promise<string> {
  const roleRoutes: Record<string, string[]> = {
    Superadmin: ['/admin/dashboard'],
    Administrador: ['/admin/dashboard'],
    Editor: ['/admin/dashboard'],
    Director: ['/admin/dashboard'],
    Subdirector: ['/admin/dashboard'],
  };

  const routes = roleRoutes[role] || ['/sin-acceso'];
  return routes[0] || '/sin-acceso';
}

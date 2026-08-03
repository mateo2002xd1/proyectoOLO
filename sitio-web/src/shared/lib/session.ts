import { cookies } from 'next/headers';
import {
  AUTH_COOKIE_NAME,
  AUTH_ROLE_COOKIE_NAME,
  AUTH_USER_NAME_COOKIE_NAME,
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

    const res = await fetch(`${process.env.BACKEND_URL || 'http://localhost:4000'}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return { role: session.role, permissions: [] };

    const { user } = await res.json();
    if (!user?.role_id) return { role: session.role, permissions: [] };

    const roleRes = await fetch(`${process.env.BACKEND_URL || 'http://localhost:4000'}/api/roles/${user.role_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!roleRes.ok) return { role: session.role, permissions: [] };

    const roleData = await roleRes.json();
    const permissions = (roleData.permissions || []).map((p: { name?: string }) => p.name).filter(Boolean);

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

    return { name: payload.name || '', email: payload.email || '' };
  } catch (err) {
    console.error('Error decoding token for user profile:', err);
    return { name: '', email: '' };
  }
}

export async function assertPagePermission(requiredPermission: string): Promise<boolean> {
  const { permissions } = await getSessionPermissionsSnapshot();
  return permissions.includes(requiredPermission);
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

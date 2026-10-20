'use server';

import { getAuthSessionSnapshot } from '@/shared/lib/session';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { AUTH_USER_NAME_COOKIE_NAME, AUTH_USER_EMAIL_COOKIE_NAME } from '@/shared/lib/auth-cookies';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function getProfileData() {
  const session = await getAuthSessionSnapshot();
  if (!session.token) {
    return { success: false, error: 'No autorizado' };
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/me`, {
      headers: { Authorization: `Bearer ${session.token}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      return { success: false, error: 'Error al obtener el perfil' };
    }

    const { user } = await res.json();
    return { success: true, data: user };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

export async function updateProfileInfo(id: string, data: { nombre: string; apellidos: string; correo: string }) {
  const session = await getAuthSessionSnapshot();
  if (!session.token) {
    return { success: false, error: 'No autorizado' };
  }

  const fullName = `${data.nombre || ''} ${data.apellidos || ''}`.trim();

  try {
    const res = await fetch(`${BACKEND_URL}/api/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({
        name: data.nombre,
        apellidos: data.apellidos,
        email: data.correo,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || err.error || 'Error al actualizar el perfil' };
    }

    const cookieStore = await cookies();
    cookieStore.set(AUTH_USER_NAME_COOKIE_NAME, fullName, { path: '/' });
    cookieStore.set(AUTH_USER_EMAIL_COOKIE_NAME, data.correo, { path: '/' });

    revalidatePath('/admin-panel', 'layout');

    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

/**
 * Campos del formulario de cambio de contraseña, tal como llegan de un
 * `Object.fromEntries(formData)`: valores sin tipar, porque eso es lo que da un
 * formulario. Se convierten a texto aquí y la política real la aplica el backend
 * (`packages/password-policy`) — esta capa solo transporta.
 */
type DatosCambioPassword = Record<string, FormDataEntryValue>;

export async function changePassword(data: DatosCambioPassword) {
  const session = await getAuthSessionSnapshot();
  if (!session.token) {
    return { success: false, error: 'No autorizado' };
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({
        currentPassword: String(data.password_actual ?? ''),
        newPassword: String(data.password_nueva ?? ''),
        confirmPassword: String(data.password_confirmacion ?? ''),
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        success: false,
        error: err.error || err.message || 'Error al cambiar la contraseña',
        // Con `PASSWORD_REPETIDA` el formulario pone el aviso bajo «Nueva contraseña».
        code: typeof err.code === 'string' ? err.code : undefined,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error changing password:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

'use server';

import { getAuthSessionSnapshot } from '@/shared/lib/session';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

/**
 * Lo que la sesión puede hacer sobre su propia cuenta desde el panel.
 *
 * Vivía en `features/admin-panel/profile/` con la pantalla «Mi perfil», que se
 * eliminó el 2026-10-20: el cambio de la propia contraseña pasó al modal «Editar
 * usuario» de `/admin-panel/users`, y solo aparece cuando la fila es la de la
 * sesión. Las cuentas que no administran usuarios cambian su clave con las
 * preguntas de seguridad (`/login/recovery`).
 */

/**
 * Id de la cuenta de la sesión, según `/api/me` (la fila, no el token).
 * @returns `null` sin sesión o si la API no responde: el modal no ofrece entonces el cambio.
 */
export async function obtenerIdDeMiCuenta(): Promise<string | null> {
  const session = await getAuthSessionSnapshot();
  if (!session.token) return null;

  try {
    const res = await fetch(`${BACKEND_URL}/api/me`, {
      headers: { Authorization: `Bearer ${session.token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;

    const { user } = await res.json();
    return typeof user?.id === 'string' ? user.id : null;
  } catch {
    return null;
  }
}

/**
 * Cambia la contraseña de la sesión. Sin la actual: el cambio voluntario no la
 * pide (ver `AuthController.changePassword`). La política la aplica el backend
 * (`packages/password-policy`); esta capa solo transporta.
 */
export async function cambiarMiPassword(datos: { nueva: string; confirmacion: string }) {
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
        newPassword: String(datos.nueva ?? ''),
        confirmPassword: String(datos.confirmacion ?? ''),
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        success: false,
        error: err.error || err.message || 'Error al cambiar la contraseña',
        // Con `PASSWORD_REPETIDA` el modal pone el aviso bajo «Nueva contraseña».
        code: typeof err.code === 'string' ? err.code : undefined,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error changing password:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  AUTH_COOKIE_NAME,
  AUTH_MUST_CHANGE_PW_COOKIE_NAME,
  AUTH_MUST_SETUP_SQ_COOKIE_NAME,
} from '@/shared/lib/auth-cookies';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

/**
 * BFF: primer inicio de sesión.
 * Reenvía { tempPassword, newPassword, securityQuestions } al backend,
 * adjuntando el token httpOnly como Bearer (el backend requiere sesión).
 */
export async function POST(request: NextRequest) {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Sesión no encontrada. Inicia sesión de nuevo.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 });
  }

  let apiRes: Response;
  try {
    apiRes = await fetch(`${BACKEND_URL}/api/first-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json({ error: 'No se pudo conectar con el servidor' }, { status: 502 });
  }

  const data = await apiRes.json().catch(() => null);
  if (!apiRes.ok) {
    return NextResponse.json(
      { error: data?.error || 'No se pudo completar la configuración' },
      { status: apiRes.status || 400 }
    );
  }

  /**
   * Las banderas se borran aquí, no solo en la base.
   *
   * `middleware.ts` decide a quién manda a `/admin/cambiar-contrasena` leyendo
   * estas dos cookies, que se escriben al iniciar sesión y no se enteran de nada
   * después. Sin borrarlas, un usuario que acaba de completar su configuración
   * seguiría siendo devuelto a la misma pantalla en cada navegación — un bucle del
   * que solo se sale cerrando sesión.
   */
  const response = NextResponse.json(data ?? { message: 'ok' });
  response.cookies.delete(AUTH_MUST_CHANGE_PW_COOKIE_NAME);
  response.cookies.delete(AUTH_MUST_SETUP_SQ_COOKIE_NAME);
  return response;
}

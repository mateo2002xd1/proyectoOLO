import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/shared/lib/auth-cookies';

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

  return NextResponse.json(data ?? { message: 'ok' });
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/shared/lib/auth-cookies';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

/**
 * BFF: qué le falta a la cuenta para estar operativa.
 *
 * Se consulta al backend y no a las cookies `mustChangePassword` /
 * `mustSetupSecurityQuestions`: esas se escriben al iniciar sesión y se quedan
 * congeladas, así que después de completar un paso siguen diciendo lo de antes. La
 * base es la única fuente que está al día.
 */
export async function GET() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Sesión no encontrada. Inicia sesión de nuevo.' }, { status: 401 });
  }

  let apiRes: Response;
  try {
    apiRes = await fetch(`${BACKEND_URL}/api/first-login/status`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json({ error: 'No se pudo conectar con el servidor' }, { status: 502 });
  }

  const data = await apiRes.json().catch(() => null);
  if (!apiRes.ok) {
    return NextResponse.json(
      { error: data?.error || 'No se pudo consultar el estado de la cuenta' },
      { status: apiRes.status || 500 }
    );
  }

  return NextResponse.json(data);
}

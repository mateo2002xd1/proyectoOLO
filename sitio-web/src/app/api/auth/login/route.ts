import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  AUTH_ROLE_COOKIE_NAME,
  AUTH_USER_NAME_COOKIE_NAME,
  AUTH_MUST_CHANGE_PW_COOKIE_NAME,
  AUTH_MUST_SETUP_SQ_COOKIE_NAME,
} from '@/shared/lib/auth-cookies';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 días en segundos
const IS_PROD = process.env.NODE_ENV === 'production';

export async function POST(request: NextRequest) {
  let body: { email: string; password: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 });
  }

  let apiRes: Response;
  try {
    apiRes = await fetch(`${BACKEND_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: body.email, password: body.password }),
    });
  } catch {
    return NextResponse.json({ error: 'No se pudo conectar con el servidor' }, { status: 502 });
  }

  const data = await apiRes.json().catch(() => null);

  const token = data?.token;

  if (!apiRes.ok || !token) {
    return NextResponse.json(
      { error: data?.error || 'Credenciales incorrectas' },
      { status: apiRes.status || 401 }
    );
  }

  const { user, mustChangePassword, mustSetupSecurityQuestions } = data;

  const response = NextResponse.json({
    user,
    mustChangePassword: !!mustChangePassword,
    mustSetupSecurityQuestions: !!mustSetupSecurityQuestions,
  });

  const base = { secure: IS_PROD, sameSite: 'lax' as const, path: '/', maxAge: COOKIE_MAX_AGE };

  // httpOnly — el token nunca es accesible por JS del cliente (regla §0.11)
  response.cookies.set(AUTH_COOKIE_NAME, token, { ...base, httpOnly: true });

  // No httpOnly — el middleware y edit-button los leen sin red
  response.cookies.set(AUTH_ROLE_COOKIE_NAME, user.role || '', { ...base, httpOnly: false });
  response.cookies.set(AUTH_USER_NAME_COOKIE_NAME, user.name || '', { ...base, httpOnly: false });

  if (mustChangePassword) {
    response.cookies.set(AUTH_MUST_CHANGE_PW_COOKIE_NAME, 'true', { ...base, httpOnly: false });
  }
  if (mustSetupSecurityQuestions) {
    response.cookies.set(AUTH_MUST_SETUP_SQ_COOKIE_NAME, 'true', { ...base, httpOnly: false });
  }

  return response;
}

import { NextRequest, NextResponse } from 'next/server';
import { conCabecerasDeCliente } from '@/shared/lib/reenviar-cliente';
import {
  AUTH_COOKIE_NAME,
  AUTH_ROLE_COOKIE_NAME,
  AUTH_USER_NAME_COOKIE_NAME,
  AUTH_USER_EMAIL_COOKIE_NAME,
  AUTH_MUST_CHANGE_PW_COOKIE_NAME,
  AUTH_MUST_SETUP_SQ_COOKIE_NAME,
} from '@/shared/lib/auth-cookies';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
/**
 * Techo absoluto de la sesión: una jornada.
 *
 * Debe ir a la par de `JWT_EXPIRES_IN` en la API (`8h`), que es quien decide de verdad
 * — la cookie solo transporta el token. Si la cookie durase más, el navegador seguiría
 * mandando un token ya caducado y el panel se abriría para no cargar nada.
 *
 * Eran 7 días. No es el tiempo que alguien está trabajando, sino el tiempo que un token
 * robado sigue sirviendo, y para un panel que administra usuarios y lee la bitácora de
 * auditoría eso era demasiado. Bajarlo casi no se nota en el uso diario porque el cierre
 * por inactividad de `@olo/inactividad` ya corta a los 15 minutos: esto es el tope de la
 * jornada, no el de la sesión activa.
 */
const COOKIE_MAX_AGE = 8 * 60 * 60; // 8 horas en segundos

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
      headers: conCabecerasDeCliente(request, { 'Content-Type': 'application/json' }),
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

  // `secure` NO puede salir de `NODE_ENV === 'production'`: `next start` (el server ya
  // compilado, el que corre en Docker tanto en dev como en producción) deja
  // `process.env.NODE_ENV` en `'production'` SIEMPRE — es un valor que fija el propio
  // Next.js al arrancar el server compilado, no algo que dependa de cómo se desplegó.
  // Con eso, en el docker-compose de desarrollo (sin nginx, todo por HTTP simple) estas
  // cookies salían con `Secure`, y esa marca hace que el navegador las rechace en
  // cualquier conexión que no sea HTTPS — se guardaba `sitio_token` (a veces; depende
  // del navegador) pero `sitio_role`/`sitio_userName`/`sitio_userEmail` nunca llegaban a
  // `document.cookie`, y de ahí que «Menú y pie» y «Nueva página» — que se resuelven en
  // el cliente leyendo esa cookie — no aparecieran para nadie, en ningún rol.
  //
  // La señal correcta es si ESTA petición llegó por HTTPS de verdad: `nginx.conf.template`
  // reenvía `X-Forwarded-Proto` con el esquema real en producción; sin nginx por delante
  // (dev) esa cabecera no existe y `nextUrl.protocol` es el que ve Next.js.
  const esHttps =
    request.headers.get('x-forwarded-proto') === 'https' || request.nextUrl.protocol === 'https:';
  const base = { secure: esHttps, sameSite: 'lax' as const, path: '/', maxAge: COOKIE_MAX_AGE };

  // El panel muestra nombre y apellido; el backend los devuelve por separado.
  const nombreCompleto = `${user.name || ''} ${user.apellidos || ''}`.trim();

  // httpOnly — el token nunca es accesible por JS del cliente (regla §0.11)
  response.cookies.set(AUTH_COOKIE_NAME, token, { ...base, httpOnly: true });

  // No httpOnly — el middleware y edit-button los leen sin red
  response.cookies.set(AUTH_ROLE_COOKIE_NAME, user.role || '', { ...base, httpOnly: false });
  response.cookies.set(AUTH_USER_NAME_COOKIE_NAME, nombreCompleto, { ...base, httpOnly: false });
  response.cookies.set(AUTH_USER_EMAIL_COOKIE_NAME, user.email || '', { ...base, httpOnly: false });

  // Setear o LIMPIAR según el estado actual — si no se limpian cuando son false,
  // quedan pegadas y el middleware rebota todo a /auth/cambiar-contrasena.
  if (mustChangePassword) {
    response.cookies.set(AUTH_MUST_CHANGE_PW_COOKIE_NAME, 'true', { ...base, httpOnly: false });
  } else {
    response.cookies.delete(AUTH_MUST_CHANGE_PW_COOKIE_NAME);
  }
  if (mustSetupSecurityQuestions) {
    response.cookies.set(AUTH_MUST_SETUP_SQ_COOKIE_NAME, 'true', { ...base, httpOnly: false });
  } else {
    response.cookies.delete(AUTH_MUST_SETUP_SQ_COOKIE_NAME);
  }

  return response;
}

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/shared/lib/session/auth-cookies';
import { conCabecerasDeCliente } from '@/shared/lib/api/reenviar-cliente';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

/**
 * Si la petición viene de otro origen y no es de solo lectura.
 *
 * El proxy convierte la cookie `sitio_token` en `Authorization: Bearer`, así que la API
 * ya no ve el `Origin` del navegador y su propia comprobación no aplica. Sin esto, la
 * única defensa contra CSRF sería `SameSite=lax`, que deja pasar a cualquier subdominio
 * u otro puerto del mismo host. `Sec-Fetch-Site` lo ponen todos los navegadores
 * actuales; si falta, se compara `Origin` con el host. Sin ninguna de las dos no es un
 * navegador, y sin navegador no hay cookie ajena que aprovechar.
 */
function esPeticionAjena(request: Request): boolean {
  if (request.method === 'GET' || request.method === 'HEAD') return false;

  const sitio = request.headers.get('sec-fetch-site');
  if (sitio) return sitio !== 'same-origin';

  const origen = request.headers.get('origin');
  if (!origen) return false;
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  try {
    return new URL(origen).host !== host;
  } catch {
    return true;
  }
}

export async function proxyToBackend(path: string, request: Request) {
  if (esPeticionAjena(request)) {
    return NextResponse.json({ error: 'Origen no permitido.' }, { status: 403 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  // Sin esto, las doce rutas que pasan por aquí (alertas, auditoría, permisos,
  // roles, usuarios…) llegaban a la API con la IP del contenedor de Next, no la
  // del visitante: el límite de tasa por IP se convertía en un cubo compartido por
  // todo el mundo. `conCabecerasDeCliente` estaba importada pero nunca se llamaba.
  const headers: Record<string, string> = conCabecerasDeCliente(request, {
    'Content-Type': request.headers.get('Content-Type') || 'application/json',
  });
  const ambito = request.headers.get('X-Ambito');
  if (ambito) headers['X-Ambito'] = ambito;

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn(`[backend-proxy] Sin token al llamar ${path} — el backend podría responder 401`);
  }

  const method = request.method;

  try {
    const url = new URL(path, BACKEND_URL);
    const body =
      method !== 'GET' && method !== 'HEAD' ? await request.arrayBuffer() : undefined;
    const res = await fetch(url.toString(), {
      method,
      headers,
      body,
    });

    const responseHeaders = new Headers();
    for (const name of ['cache-control', 'content-disposition', 'content-type']) {
      const value = res.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    // La respuesta se sirve desde el origen del sitio con el `content-type` de la API.
    // `helmet` pone estas protecciones en la API, pero no se copian: sin ellas, un HTML
    // o SVG subido por un usuario se ejecutaría aquí como script del sitio.
    responseHeaders.set('X-Content-Type-Options', 'nosniff');
    responseHeaders.set('Content-Security-Policy', "default-src 'none'; sandbox");

    if ([204, 205, 304].includes(res.status)) {
      return new NextResponse(null, { status: res.status, headers: responseHeaders });
    }

    return new NextResponse(await res.arrayBuffer(), {
      status: res.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      { error: 'Error de conexión con el servidor.' },
      { status: 502 }
    );
  }
}

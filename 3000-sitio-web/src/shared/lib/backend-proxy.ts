import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/shared/lib/auth-cookies';
import { conCabecerasDeCliente } from '@/shared/lib/reenviar-cliente';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function proxyToBackend(path: string, request: Request) {
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

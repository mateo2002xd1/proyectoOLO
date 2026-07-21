import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/shared/lib/auth-cookies';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function proxyToBackend(path: string, request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  const headers: Record<string, string> = {
    'Content-Type': request.headers.get('Content-Type') || 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn(`[backend-proxy] Sin token al llamar ${path} — el backend podría responder 401`);
  }

  const method = request.method;
  let body: string | undefined;

  if (method !== 'GET' && method !== 'HEAD') {
    try {
      body = await request.text();
    } catch {
      body = undefined;
    }
  }

  try {
    const url = new URL(path, BACKEND_URL);
    const res = await fetch(url.toString(), {
      method,
      headers,
      body,
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: 'Error de conexión con el servidor.' },
      { status: 502 }
    );
  }
}

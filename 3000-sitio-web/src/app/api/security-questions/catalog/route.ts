import { NextResponse } from 'next/server';
import { conCabecerasDeCliente } from '@/shared/lib/api/reenviar-cliente';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

/**
 * BFF: catálogo de preguntas de seguridad (endpoint público del backend).
 * Devuelve un array [{ key, label }].
 */
export async function GET(request: Request) {
  let apiRes: Response;
  try {
    apiRes = await fetch(`${BACKEND_URL}/api/security-questions/catalog`, {
      headers: conCabecerasDeCliente(request, { 'Content-Type': 'application/json' }),
    });
  } catch {
    return NextResponse.json({ error: 'No se pudo conectar con el servidor' }, { status: 502 });
  }

  const data = await apiRes.json().catch(() => null);
  if (!apiRes.ok) {
    return NextResponse.json(
      { error: 'No se pudieron cargar las preguntas de seguridad' },
      { status: apiRes.status || 500 }
    );
  }

  return NextResponse.json(data ?? []);
}

import { NextResponse } from 'next/server';
import { conCabecerasDeCliente } from '@/shared/lib/api/reenviar-cliente';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

/**
 * BFF: qué preguntas tiene configuradas un usuario, por correo. Primer paso de la
 * recuperación de contraseña.
 *
 * El backend responde `{ questions: [] }` —no un 404— cuando el correo no existe, y
 * aquí se conserva ese comportamiento: distinguir «no existe» de «existe pero sin
 * preguntas» convertiría esta ruta en un detector de cuentas para cualquiera.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.email) {
    return NextResponse.json({ error: 'El correo es obligatorio' }, { status: 400 });
  }

  let apiRes: Response;
  try {
    apiRes = await fetch(`${BACKEND_URL}/api/security-questions/user-questions`, {
      method: 'POST',
      headers: conCabecerasDeCliente(request, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ email: body.email }),
    });
  } catch {
    return NextResponse.json({ error: 'No se pudo conectar con el servidor' }, { status: 502 });
  }

  const data = await apiRes.json().catch(() => null);

  // El 429 del limitador del backend se deja pasar tal cual: es información que el
  // usuario necesita («intente más tarde»), no una fuga.
  if (!apiRes.ok) {
    return NextResponse.json(
      { error: data?.error ?? 'No se pudo continuar con la recuperación' },
      { status: apiRes.status || 500 }
    );
  }

  return NextResponse.json(data ?? { questions: [] });
}

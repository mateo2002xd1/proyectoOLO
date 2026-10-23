import { NextResponse } from 'next/server';
import { conCabecerasDeCliente } from '@/shared/lib/api/reenviar-cliente';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

/**
 * BFF: comprueba las respuestas de seguridad. Segundo paso de la recuperación.
 *
 * No devuelve token ni sesión: solo confirma que las respuestas son correctas para
 * dejar avanzar a la pantalla de nueva contraseña. La comprobación **se repite** en
 * el backend al guardar (`/recover-password` vuelve a verificarlas), así que saltarse
 * este paso desde el cliente no sirve de nada.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !Array.isArray(body?.answers)) {
    return NextResponse.json({ error: 'Faltan datos para verificar' }, { status: 400 });
  }

  let apiRes: Response;
  try {
    apiRes = await fetch(`${BACKEND_URL}/api/security-questions/verify`, {
      method: 'POST',
      headers: conCabecerasDeCliente(request, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ email: body.email, answers: body.answers }),
    });
  } catch {
    return NextResponse.json({ error: 'No se pudo conectar con el servidor' }, { status: 502 });
  }

  const data = await apiRes.json().catch(() => null);
  if (!apiRes.ok) {
    // El 401 único de la API ya trae el aviso de la espera tras varios fallos, y el 429 es
    // el limitador: ambos mensajes hay que mostrarlos tal cual o el usuario no entiende qué
    // pasa. (El 423 «cuenta bloqueada» de antes delataba qué cuentas existen y se retiró.)
    return NextResponse.json(
      { error: data?.error ?? 'Una o más respuestas son incorrectas' },
      { status: apiRes.status || 500 }
    );
  }

  return NextResponse.json(data ?? { message: 'Respuestas correctas' });
}

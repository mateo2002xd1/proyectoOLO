import { NextResponse } from 'next/server';
import { conCabecerasDeCliente } from '@/shared/lib/api/reenviar-cliente';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

/**
 * BFF: qué preguntas tiene configuradas un usuario, por correo. Primer paso de la
 * recuperación de contraseña.
 *
 * El backend responde **siempre con tres preguntas**: las reales si la cuenta las tiene
 * y, si el correo no existe o la cuenta no las configuró, unas inventadas que son siempre
 * las mismas para ese correo. Antes devolvía `[]` para «no existe», pero las reales para
 * «existe» y un 423 si estaba bloqueada: eso bastaba para saber qué correos tienen cuenta
 * (y de paso entregaba su pregunta de seguridad). Contestar las inventadas falla en
 * `/verify` con el mismo mensaje que cualquier respuesta errónea.
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

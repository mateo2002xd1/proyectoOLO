import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

/**
 * BFF: fija la nueva contraseña tras responder las preguntas. Último paso.
 *
 * El backend vuelve a verificar las respuestas aquí —no se fía del paso anterior— y
 * aplica la política de contraseñas completa. Los errores de política llegan con
 * status 400 y mensaje explícito; el resto viene deliberadamente genérico para no
 * delatar si el correo existe.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !Array.isArray(body?.answers) || !body?.newPassword) {
    return NextResponse.json({ error: 'Faltan datos para recuperar la contraseña' }, { status: 400 });
  }

  let apiRes: Response;
  try {
    apiRes = await fetch(`${BACKEND_URL}/api/security-questions/recover-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: body.email,
        answers: body.answers,
        newPassword: body.newPassword,
      }),
    });
  } catch {
    return NextResponse.json({ error: 'No se pudo conectar con el servidor' }, { status: 502 });
  }

  const data = await apiRes.json().catch(() => null);
  if (!apiRes.ok) {
    return NextResponse.json(
      { error: data?.error ?? 'No fue posible recuperar la contraseña' },
      { status: apiRes.status || 500 }
    );
  }

  return NextResponse.json(data ?? { message: 'Contraseña actualizada exitosamente' });
}

import { NextResponse } from 'next/server';
import {
  obtenerDetalleOcupacion,
  respuestaDeErrorCno,
} from '@/features/sitio-web/buscador-ocupaciones/lib/consulta-cno';

/**
 * `GET /api/ocupaciones/<código>` — ficha de una ocupación CNO (4 dígitos) o
 * CUOC (5 dígitos): denominaciones, funciones, habilidades, conocimientos,
 * relacionadas, ubicación en la estructura y correlativa.
 *
 * Mismo puente con la llave del servidor que `app/api/ocupaciones/route.ts`.
 */
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;

  try {
    const detalle = await obtenerDetalleOcupacion(codigo);

    if (!detalle) {
      return NextResponse.json({ error: 'Ocupación no encontrada.' }, { status: 404 });
    }

    return NextResponse.json(detalle);
  } catch (error) {
    return respuestaDeErrorCno(error);
  }
}

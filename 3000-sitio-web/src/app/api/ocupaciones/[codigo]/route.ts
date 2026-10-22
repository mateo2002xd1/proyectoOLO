import { NextResponse } from 'next/server';
import { buscadorDeOcupacionesActivo } from '@/features/editor';
import {
  obtenerDetalleOcupacion,
  respuestaDeErrorCno,
} from '@/shared/lib/buscador-ocupaciones/lib/consulta-cno';

/**
 * `GET /api/ocupaciones/<código>` — ficha de una ocupación CNO (4 dígitos) o
 * CUOC (5 dígitos): denominaciones, funciones, habilidades, conocimientos,
 * relacionadas, ubicación en la estructura y correlativa.
 *
 * Mismo puente con la llave del servidor que `app/api/ocupaciones/route.ts`.
 */
export const dynamic = 'force-dynamic';

/** Con el buscador apagado (bloque «Buscador de Ocupaciones») el catálogo deja de consultarse. */
const APAGADO = () =>
  NextResponse.json({ error: 'El buscador de ocupaciones no está disponible.' }, { status: 404 });

export async function GET(_request: Request, { params }: { params: Promise<{ codigo: string }> }) {
  if (!(await buscadorDeOcupacionesActivo())) return APAGADO();

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

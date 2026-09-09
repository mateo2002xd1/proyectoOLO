import { NextResponse } from 'next/server';
import { obtenerDetalleOcupacion } from '@/features/sitio-web/buscador-ocupaciones/lib/catalogo-cno-temporal';

/**
 * `GET /api/ocupaciones/<cod_ocupacion_cno>` — detalle de una ocupación con
 * todas sus uniones resueltas (denominaciones, funciones, habilidades,
 * conocimientos, relacionadas, área de desempeño y nivel de cualificación).
 *
 * Origen temporal en `data_temporal/`; ver la nota en `app/api/ocupaciones/route.ts`.
 */
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;

  try {
    const detalle = await obtenerDetalleOcupacion(codigo);

    if (!detalle) {
      return NextResponse.json({ error: 'Ocupación no encontrada' }, { status: 404 });
    }

    return NextResponse.json(detalle);
  } catch (error) {
    console.error('[api/ocupaciones/:codigo] No se pudo leer el catálogo CNO temporal:', error);
    return NextResponse.json({ error: 'No se pudo consultar el catálogo de ocupaciones' }, { status: 500 });
  }
}

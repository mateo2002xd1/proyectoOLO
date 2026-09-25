import { NextResponse } from 'next/server';
import { buscarOcupaciones } from '@/features/sitio-web/buscador-ocupaciones/lib/catalogo-cno-temporal';

/**
 * `GET /api/ocupaciones?q=<término>` — buscador de la Clasificación Nacional de Ocupaciones.
 *
 * A diferencia del resto de `app/api/`, este handler **no** pasa por
 * `proxyToBackend`: el catálogo CNO todavía no existe en :4000 y se resuelve
 * contra los JSON de `data_temporal/`. La ruta y la forma de la respuesta ya
 * son las definitivas, así que el día que el backend exponga el catálogo basta
 * con cambiar el import por una llamada al proxy.
 *
 * Es contenido público y anónimo: no lee la cookie de sesión.
 */
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const termino = new URL(request.url).searchParams.get('q') ?? '';

  try {
    return NextResponse.json(await buscarOcupaciones(termino));
  } catch (error) {
    console.error('[api/ocupaciones] No se pudo leer el catálogo CNO temporal:', error);
    return NextResponse.json({ error: 'No se pudo consultar el catálogo de ocupaciones' }, { status: 500 });
  }
}

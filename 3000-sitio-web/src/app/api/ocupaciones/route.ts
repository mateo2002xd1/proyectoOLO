import { NextResponse } from 'next/server';
import { buscadorDeOcupacionesActivo } from '@/features/editor';
import {
  buscarOcupaciones,
  respuestaDeErrorCno,
} from '@/shared/lib/buscador-ocupaciones/lib/consulta-cno';

/**
 * `GET /api/ocupaciones?q=<término>` — buscador de las clasificaciones CNO y CUOC.
 *
 * A diferencia del resto de `app/api/`, este handler **no** pasa por
 * `proxyToBackend`: el catálogo no está en :4000 sino en la API pública de
 * consulta (`API_PUBLICA_CONSULTA.md`), que pide una llave propia. El handler
 * existe para que esa llave se quede en el servidor y nunca llegue al navegador.
 *
 * Es contenido público y anónimo: no lee la cookie de sesión.
 */
export const dynamic = 'force-dynamic';

/** Con el buscador apagado (bloque «Buscador de Ocupaciones») el catálogo deja de consultarse. */
const APAGADO = () =>
  NextResponse.json({ error: 'El buscador de ocupaciones no está disponible.' }, { status: 404 });

export async function GET(request: Request) {
  if (!(await buscadorDeOcupacionesActivo())) return APAGADO();

  const termino = new URL(request.url).searchParams.get('q') ?? '';

  try {
    return NextResponse.json(await buscarOcupaciones(termino));
  } catch (error) {
    return respuestaDeErrorCno(error);
  }
}

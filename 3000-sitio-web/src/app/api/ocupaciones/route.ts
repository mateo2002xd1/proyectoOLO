import { NextResponse } from 'next/server';
import {
  buscarOcupaciones,
  respuestaDeErrorCno,
} from '@/features/sitio-web/buscador-ocupaciones/lib/consulta-cno';

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

export async function GET(request: Request) {
  const termino = new URL(request.url).searchParams.get('q') ?? '';

  try {
    return NextResponse.json(await buscarOcupaciones(termino));
  } catch (error) {
    return respuestaDeErrorCno(error);
  }
}

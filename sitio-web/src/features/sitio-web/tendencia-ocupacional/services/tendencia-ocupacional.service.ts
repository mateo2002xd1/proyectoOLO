import { URL_DE_LA_API } from '@/shared/lib/url-de-la-api';

import type {
  CodigoCriterio,
  FiltrosTendencia,
  OpcionesTendenciaOcupacional,
  ResultadoTendenciaOcupacional,
} from '../types';

const RUTA = `${URL_DE_LA_API}/api/observatorio/tendencia-ocupacional`;

/**
 * Fallo al consultar la tendencia ocupacional. Antes el servicio devolvía una lista vacía
 * ante cualquier error, y un backend caído se veía igual que "no hay datos": ahora la
 * vista puede distinguirlo y decírselo al ciudadano.
 */
export class ErrorTendenciaOcupacional extends Error {
  constructor(public status: number | null) {
    super('No se pudieron consultar los datos de tendencia ocupacional.');
  }
}

async function pedir<T>(url: string, signal?: AbortSignal): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(url, { cache: 'no-store', signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ErrorTendenciaOcupacional(null);
  }
  if (!respuesta.ok) throw new ErrorTendenciaOcupacional(respuesta.status);
  return respuesta.json() as Promise<T>;
}

/**
 * Opciones de los desplegables. Todo sale de la base: años con datos publicados,
 * periodos (marcando los que tienen datos en `anio`), niveles, departamentos y criterios.
 *
 * @param anio año para marcar la disponibilidad de los periodos; sin él, el más reciente.
 */
export function obtenerOpcionesTendencia(anio?: number, signal?: AbortSignal) {
  const query = anio ? `?anio=${anio}` : '';
  return pedir<OpcionesTendenciaOcupacional>(`${RUTA}/opciones${query}`, signal);
}

/**
 * Consulta un criterio con sus filtros. El filtrado, el orden, la paginación y los
 * totales los resuelve la API en SQL; aquí solo se arma la petición.
 */
export function buscarTendenciaOcupacional(
  criterio: CodigoCriterio,
  filtros: FiltrosTendencia,
  pagina: number,
  porPagina: number,
  signal?: AbortSignal
) {
  const query = new URLSearchParams({
    anio: filtros.anio,
    periodo: filtros.periodo,
    departamento: filtros.departamento,
    criterio,
    pagina: String(pagina),
    porPagina: String(porPagina),
  });
  if (filtros.nivelOcupacional) query.set('nivel', filtros.nivelOcupacional);
  if (filtros.incluirSinRegistros) query.set('incluirSinRegistros', 'true');

  return pedir<ResultadoTendenciaOcupacional>(`${RUTA}?${query}`, signal);
}

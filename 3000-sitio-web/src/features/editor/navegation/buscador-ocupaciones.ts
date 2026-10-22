/**
 * El interruptor del buscador de ocupaciones.
 *
 * Se prende y se apaga en el bloque «Buscador de Ocupaciones» o en «Resultados de ocupaciones»
 * (campo `activo`), pero vale para todo el sitio: apagado, desaparecen los buscadores de las
 * páginas, los resultados y los endpoints `/api/ocupaciones`. Para que un solo bloque mande
 * sobre todo hay que elegir dónde: la página de resultados que se escoge en «Menú y pie»
 * (`paginaDelBuscador`), a la que llevan todos los buscadores. Un bloque apagado en otra
 * página no apaga nada.
 *
 * Solo `activo: false` apaga: un bloque guardado antes de que existiera el campo, o una página
 * sin el bloque, dejan el buscador encendido. Si la API no responde, también (la lectura
 * es la misma que hace el sitio para pintar la página, con su caché).
 */
import { mapaDelMenu, slugDeEnlaceEnMenu } from '@/shared/lib/rutas-del-menu';
import { obtenerPaginaPublicadaCacheada } from '../publishing/services/publicacion.service';
import { obtenerPlantilla, type Plantilla } from './menu-y-pie';

const BLOQUES_DEL_BUSCADOR = ['BuscadorOcupaciones', 'ResultadosOcupaciones'];

/** ¿Hay, en cualquier parte del contenido Puck (raíz o dentro de otro bloque), uno apagado? */
const hayUnoApagado = (nodo: unknown): boolean => {
  if (Array.isArray(nodo)) return nodo.some(hayUnoApagado);
  if (!nodo || typeof nodo !== 'object') return false;
  const obj = nodo as Record<string, unknown>;
  const props = obj.props as { activo?: unknown } | undefined;
  if (BLOQUES_DEL_BUSCADOR.includes(obj.type as string) && props?.activo === false) return true;
  return Object.values(obj).some(hayUnoApagado);
};

/**
 * ¿Está encendido el buscador de ocupaciones? `plantilla` evita leerla otra vez a quien ya la
 * tiene (el layout).
 */
export async function buscadorDeOcupacionesActivo(plantilla?: Plantilla): Promise<boolean> {
  const { cabecera } = plantilla ?? (await obtenerPlantilla());
  const enlace = cabecera?.paginaDelBuscador?.trim();
  if (!enlace) return true;

  const slug = slugDeEnlaceEnMenu(enlace, mapaDelMenu(cabecera?.navLinks ?? []));
  if (!slug) return true;

  const pagina = await obtenerPaginaPublicadaCacheada(slug);
  return !hayUnoApagado(pagina?.contenido);
}

/**
 * Qué secciones existen, ahora que dejaron de estar solo en código.
 *
 * Hasta aquí «las secciones» eran `SECCIONES_POR_AMBITO`, una lista escrita a mano, y
 * `requierePermisoDeSeccion` la usaba de portón: un slug que no estuviera ahí recibía
 * 404 en todos los endpoints del editor. Eso era correcto mientras añadir una sección
 * significara tocar código y desplegar.
 *
 * Desde que se pueden crear desde el editor ya no lo es: la sección recién creada
 * existe en `paginas` pero no en la lista, así que su propio creador se comía un 404
 * al intentar llenarla. La lista pasa a ser «las de fábrica» y la respuesta completa
 * es esta: **de fábrica, o con fila en `paginas`**.
 *
 * Se consulta en cada petición de edición y no se cachea. El middleware que la llama
 * ya hace después una consulta de permisos, y esta es una búsqueda por el índice
 * único `(ambito, slug)`: el coste es una lectura indexada, y a cambio una sección
 * recién creada es editable en el acto en vez de al vencer un TTL.
 */
import { PaginaRepository } from '../../repositories/pagina.repository';
import { esSeccionDeFabrica } from '../../shared/catalogo-permisos';
import type { Ambito } from '../../shared/ambito';

/** Si el slug corresponde a una sección real de ese ámbito. */
export const esSeccionConocida = async (ambito: Ambito, slug: string): Promise<boolean> => {
  if (esSeccionDeFabrica(ambito, slug)) return true;
  return Boolean(await PaginaRepository.findBySlug(slug, ambito));
};

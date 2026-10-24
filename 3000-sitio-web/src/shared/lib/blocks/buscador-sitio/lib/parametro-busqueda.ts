/**
 * Parámetro de búsqueda exclusivo del sitio web (`?busqueda=`).
 *
 * Se separa a propósito del `buscar` del catálogo de ocupaciones CNO/CUOC: así una
 * búsqueda del sitio no dispara la del catálogo ni al revés. Es el único que lee la
 * página de resultados; aceptar más nombres solo daba más sitios donde chocar con el CNO.
 */
export const PARAM_BUSQUEDA_SITIO = 'busqueda';

/** Cuántas letras se leen de la URL: una consulta no necesita más y el enlace puede traer cualquiera. */
export const LARGO_MAXIMO_DE_LA_BUSQUEDA = 200;

/** Lo que se está buscando según la URL, recortado y sin espacios sobrantes. */
export function leerBusquedaDeLaUrl(parametros: { get(nombre: string): string | null }): string {
  return (parametros.get(PARAM_BUSQUEDA_SITIO) ?? '').trim().slice(0, LARGO_MAXIMO_DE_LA_BUSQUEDA);
}

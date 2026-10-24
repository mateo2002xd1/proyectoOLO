import { rutaInternaSegura } from '@olo/url-policy';

export const RUTA_DE_RESULTADOS_POR_DEFECTO = '/buscador-general';

/**
 * La ruta de la página de resultados, tal como la escribió quien edita.
 *
 * No se usa tal cual: `rutaInternaSegura` solo deja pasar una ruta de este mismo sitio.
 * `//otro-sitio` y `/\otro-sitio` empiezan por `/` pero el navegador los lee como otro
 * origen, y desde ahí un visitante que busca saldría del sitio con lo que escribió
 * (XSS-06, `2-convenciones-del-proyecto.md` §11). Si no sirve, se vuelve a la ruta por
 * defecto. La consulta (`?…`) que traiga la ruta se descarta: la única es la que arma
 * quien navega.
 */
export function rutaDeLosResultados(escrita: string | undefined): string {
  const limpia = (escrita || RUTA_DE_RESULTADOS_POR_DEFECTO).trim();
  // Con esquema (`https://…`) no es una ruta de este sitio: no se arregla poniéndole una barra.
  if (/^[a-z][a-z0-9+.-]*:/i.test(limpia)) return RUTA_DE_RESULTADOS_POR_DEFECTO;
  const conBarra = limpia.startsWith('/') ? limpia : `/${limpia}`;
  return rutaInternaSegura(conBarra.split('?')[0], RUTA_DE_RESULTADOS_POR_DEFECTO);
}

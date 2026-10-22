/**
 * Las etiquetas con las que se marca en caché el contenido publicado de una página.
 *
 * Existen porque el sitio lee sus páginas con `fetch(..., { next: { revalidate } })`, y
 * eso por sí solo solo sabe caducar por tiempo: aprobar una página la cambiaba en la
 * base de datos pero no en pantalla, y encima —con `stale-while-revalidate`— la primera
 * visita después de caducar todavía recibía la copia vieja. Con una etiqueta, la API
 * puede pedir que se tire esa copia en el momento exacto en que deja de ser cierta
 * (`app/api/revalidar/route.ts`).
 *
 * El ámbito va dentro del nombre aunque esta aplicación solo sirva el suyo: el mismo
 * slug existe en el sitio y en la intranet, y una etiqueta que no lo distinga es una
 * colisión esperando a que la intranet estrene ISR.
 */
export const etiquetaDePagina = (slug: string) => `pagina:sitio:${slug}`;

/**
 * La etiqueta de la lista de títulos de las páginas publicadas (las migas de pan la leen en
 * cada visita). Es una sola para todo el sitio: aprobar cualquier página puede cambiar un
 * título o añadir una página nueva a la lista, así que `app/api/revalidar` la tira siempre.
 */
export const ETIQUETA_TITULOS = 'titulos:sitio';

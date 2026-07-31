/**
 * Ámbito de una página: a qué aplicación pertenece.
 *
 * El sitio y la intranet comparten la tabla `paginas` y ambos tienen su `/inicio`.
 * Lo que los separa es este campo, no el slug: la unicidad en base de datos es
 * (ambito, slug) — ver la migración 007-paginas-ambito.
 *
 * Cada frontend declara el suyo en la cabecera `X-Ambito` desde su cliente HTTP.
 * Si no llega, se asume 'sitio', que es el comportamiento que la API tuvo siempre.
 */
export const AMBITOS = ['sitio', 'intranet'] as const;

export type Ambito = (typeof AMBITOS)[number];

export const AMBITO_HEADER = 'x-ambito';

export const AMBITO_POR_DEFECTO: Ambito = 'sitio';

/** Normaliza un valor externo a un ámbito válido. Nunca lanza: fuera del catálogo, 'sitio'. */
export const resolverAmbito = (valor: unknown): Ambito =>
  AMBITOS.includes(valor as Ambito) ? (valor as Ambito) : AMBITO_POR_DEFECTO;

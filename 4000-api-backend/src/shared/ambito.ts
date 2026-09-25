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

/**
 * Igual que `resolverAmbito`, pero exigiendo que venga declarado y sea válido.
 *
 * Para **leer** una página pública, caer en 'sitio' cuando falta la cabecera es el
 * comportamiento correcto y el que la API tuvo siempre. Para **escribir** no: un
 * `X-Ambito` mal escrito desde la intranet —o eliminado por un proxy por el camino—
 * no debe crear la página dentro del sitio público sin que nadie se entere. Es
 * exactamente el fallo que documenta `PaginaRepository.findBySlug` («buscar por slug a
 * secas devolvía la página de la otra aplicación»), solo que del lado de la escritura.
 *
 * Nota sobre lo que esto **no** es: el ámbito no es una frontera de permisos. Hoy
 * todos los roles que editan editan en las dos aplicaciones a propósito
 * (`paginas.policies.ts`) y la cola de revisión es deliberadamente cruzada, así que
 * comprobar el ámbito contra `acceso.sitio` / `acceso.intranet` no negaría nada que el
 * rol no tuviera ya —y dejaría fuera al Administrador, que no tiene esos permisos
 * sembrados—. El día que un rol edite solo una de las dos, la comprobación va aquí.
 */
export const exigirAmbito = (valor: unknown): Ambito => {
  if (AMBITOS.includes(valor as Ambito)) return valor as Ambito;

  throw Object.assign(
    new Error(`La cabecera ${AMBITO_HEADER} es obligatoria y debe ser ${AMBITOS.join(' o ')}`),
    { status: 400 }
  );
};

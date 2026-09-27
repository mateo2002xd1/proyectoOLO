/**
 * Identificadores UUID antes de escribirlos en una columna de autoría.
 *
 * Las columnas `creado_por`, `publicado_por`, `revisor_id`… son `uuid` con FK a `users`.
 * La cuenta local de desarrollo (`LOCAL_AUTH_*`) firma sus tokens con el id `local-auth`,
 * que no es un UUID ni tiene fila: escribirlo tal cual haría fallar el INSERT entero.
 * Antes cada caso de uso de `paginas/` llevaba su propia copia de esta comprobación.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** ¿Tiene el texto forma de UUID? Sirve para distinguir un id de un slug en la misma ruta. */
export const esUuid = (valor: string): boolean => UUID_RE.test(valor);

/** El id si es un UUID válido; `null` si no lo es o no viene, para dejar la autoría en blanco. */
export const uuidONulo = (id?: string | null): string | null => (id && esUuid(id) ? id : null);

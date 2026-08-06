import type { CampoModificado } from '../repositories/auditoria.repository';

/**
 * Campos cuyo **valor** nunca debe llegar a la bitácora.
 *
 * Existe porque auditar la gestión de usuarios obliga a registrar el cuerpo de la
 * petición, y ese cuerpo puede traer `password` en claro (`updateUser` lo acepta).
 * Sin esta lista, la primera vez que un administrador cambiara una contraseña la
 * bitácora la habría guardado tal cual — y la bitácora es justo la tabla que más
 * gente puede leer con motivo.
 *
 * Se comparan en minúsculas: el mismo campo llega como `password` desde el panel y
 * podría llegar como `Password` desde otro cliente.
 */
const CAMPOS_SENSIBLES = new Set([
  'password',
  'password_hash',
  'new_password',
  'current_password',
  'temporarypassword',
  'token',
  'refresh_token',
  'security_answers',
  'answers',
]);

/** Lo que se guarda en lugar del valor de un campo sensible. */
export const VALOR_OMITIDO = '«valor omitido»';

export const esCampoSensible = (campo: string) =>
  CAMPOS_SENSIBLES.has(campo.trim().toLowerCase());

/**
 * Convierte el cuerpo de una petición en la lista de campos modificados.
 *
 * `antes` va en `null` porque quien llama no tiene el estado anterior: para que
 * diga de verdad "de X a Y" hace falta que el use-case devuelva la versión previa
 * (T-07.6, pendiente). Se deja explícito en vez de omitirlo para que el hueco se
 * vea en los datos y no se confunda con "no cambió nada".
 *
 * Un campo sensible **no se omite**: se registra con el valor sustituido. Que
 * alguien cambió la contraseña de una cuenta es exactamente lo que una auditoría
 * necesita saber; cuál es esa contraseña, no.
 */
export const camposDe = (body: Record<string, unknown> | undefined | null): CampoModificado[] =>
  Object.keys(body ?? {}).map((campo) => ({
    campo,
    antes: null,
    despues: esCampoSensible(campo) ? VALOR_OMITIDO : (body as Record<string, unknown>)[campo],
  }));

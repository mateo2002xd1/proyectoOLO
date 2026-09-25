import axios from 'axios';

/**
 * Lectura tipada de los errores que devuelve la API.
 *
 * Existe porque el mismo `catch (err: any)` estaba copiado en `respaldos`,
 * `actualizaciones` y `auth`, cada uno leyendo `err.response.data.error` a mano —
 * el `any` que §4 prohíbe, multiplicado por tres. Al vivir en `shared/` cumple
 * además la dirección de dependencia de §5: lo usan las features, no al revés.
 *
 * Todas las funciones aceptan `unknown` a propósito: es lo que entrega un `catch`,
 * y estrechar aquí es justo lo que evita que cada caller invente su propio casteo.
 */

/** Cuerpo con el que la API responde un fallo controlado. */
interface CuerpoDeError {
  error?: string;
  code?: string;
}

function cuerpoDeError(error: unknown): CuerpoDeError | undefined {
  if (!axios.isAxiosError(error)) return undefined;
  const datos = error.response?.data;
  return datos && typeof datos === 'object' ? (datos as CuerpoDeError) : undefined;
}

/** Código HTTP de la respuesta, o `undefined` si el fallo no llegó a tener respuesta. */
export function estadoHttp(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

/** Código de negocio que acompaña al error (`PAGE_LOCKED`, etc.), si lo hay. */
export function codigoDeError(error: unknown): string | undefined {
  const codigo = cuerpoDeError(error)?.code;
  return typeof codigo === 'string' ? codigo : undefined;
}

/**
 * Mensaje en español para mostrar al usuario: el que mandó la API, el de la
 * excepción, o el de respaldo. Nunca devuelve el objeto de error crudo — §6 pide
 * no filtrar internals (ni stack traces, ni nombres de tabla).
 */
export function mensajeDeErrorApi(error: unknown, porDefecto: string): string {
  const mensajeApi = cuerpoDeError(error)?.error;
  if (typeof mensajeApi === 'string' && mensajeApi.trim()) return mensajeApi;

  if (error instanceof Error && error.message.trim()) return error.message;

  return porDefecto;
}

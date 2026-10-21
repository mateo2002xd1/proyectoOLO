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

/** Lo que se le dice a quien usa el panel cuando la API no llegó a contestar. */
export const MENSAJE_SIN_RESPUESTA =
  'El servidor está tardando en responder, posibles causas: tu conexión a internet o que se esté reiniciando.';

/**
 * El 403 de `requireAuth` a una cuenta con el primer ingreso pendiente, con el texto
 * exacto de la API. Todas las pantallas guardan el error como texto (`mensajeDeErrorApi`,
 * `pedirJson` o el `fetch` de la bitácora), así que `AvisoErrorDeCarga` lo reconoce
 * comparando: si la API cambia la frase, hay que cambiarla aquí también.
 */
export const MENSAJE_CONFIGURACION_PENDIENTE =
  'Termina de configurar tu cuenta (contraseña y preguntas de seguridad) para continuar.';

/**
 * Si la petición se quedó sin respuesta: se agotó el tiempo (`ECONNABORTED`,
 * `ETIMEDOUT`) o no hubo conexión (`ERR_NETWORK`, p. ej. la API reiniciándose). Son
 * los fallos que vale la pena reintentar solos: un 4xx o un 5xx ya es una respuesta.
 * Una petición cancelada a propósito no cuenta.
 */
export function esFalloDeConexion(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response && error.code !== 'ERR_CANCELED';
}

/**
 * Mensaje en español para mostrar al usuario: el que mandó la API, el de la
 * excepción, o el de respaldo. Nunca devuelve el objeto de error crudo — §6 pide
 * no filtrar internals (ni stack traces, ni nombres de tabla).
 *
 * Un fallo sin respuesta da `MENSAJE_SIN_RESPUESTA` y no el `message` de axios, que
 * llegaba tal cual a la pantalla: «timeout of 15000ms exceeded», en inglés.
 */
export function mensajeDeErrorApi(error: unknown, porDefecto: string): string {
  const mensajeApi = cuerpoDeError(error)?.error;
  if (typeof mensajeApi === 'string' && mensajeApi.trim()) return mensajeApi;

  if (esFalloDeConexion(error)) return MENSAJE_SIN_RESPUESTA;

  if (error instanceof Error && error.message.trim()) return error.message;

  return porDefecto;
}

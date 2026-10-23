/**
 * Qué se le enseña a quien llama cuando algo falla, y qué se deja solo en el log.
 *
 * La regla (auditoría 2026-10-22, `auditorias/2026-10-22-fuga-de-informacion-en-errores.md`):
 * al cliente solo llega el mensaje de un **error de dominio** —uno que el código lanzó a
 * propósito, con `status` 4xx y un texto escrito para el usuario—. Todo lo demás (un
 * `DatabaseError` de Sequelize, un `ENOSPC` del disco, un `ECONNREFUSED` de Redis, un
 * `TypeError`) lleva nombres de tablas, rutas o direcciones internas y se queda en el log.
 */
import { BaseError, ValidationError } from 'sequelize';

/** Lo que ve quien llama cuando el fallo no es suyo. */
export const MENSAJE_ERROR_INTERNO = 'Error interno del servidor';

/** Lo que queda escrito en `cargas_datos.mensaje` cuando la base de datos rechaza una carga. */
export const MENSAJE_CARGA_RECHAZADA_POR_LA_BASE =
  'Hay datos del archivo que no cumplen las reglas de la base de datos (por ejemplo, filas duplicadas). Revisa el archivo e inténtalo de nuevo.';
export const MENSAJE_CARGA_ERROR_INTERNO =
  'No se pudo guardar la carga por un error interno. Inténtalo de nuevo; si persiste, contacta al administrador.';

/**
 * ¿Lo lanzó el código a propósito para que lo lea el usuario?
 *
 * Se reconoce por el `status` explícito 4xx (`Object.assign(new Error('…'), { status: 404 })`
 * o una clase propia con `status`). Un error de librería no lo trae, y cuando lo trae
 * (`body-parser`) se trata aparte en el manejador. No se aceptan 5xx: «el servidor falló»
 * nunca es un mensaje para el usuario.
 */
export function esErrorDeDominio(err: unknown): err is Error & { status: number; code?: unknown } {
  if (!(err instanceof Error)) return false;
  const { status } = err as { status?: unknown };
  return typeof status === 'number' && Number.isInteger(status) && status >= 400 && status <= 499;
}

/** Los mensajes por columna de un error de validación de Sequelize (solo para el log). */
export function detallesDeValidacion(err: unknown): string[] {
  if (!(err instanceof ValidationError)) return [];
  return err.errors.map((item) => item.message ?? item.path ?? '').filter(Boolean);
}

/**
 * Una línea para el log: `Nombre: mensaje [código] — detalles`.
 *
 * Sin `stack` y sin el objeto entero: `console.error('…', error)` imprime también `sql`,
 * `parameters` y `parent` de Sequelize, que llevan los valores del formulario (correos,
 * hashes). Es la regla 95.3 BE, que antes solo cumplía el manejador de errores.
 */
export function describirErrorParaLog(err: unknown): string {
  if (!(err instanceof Error)) return `valor no-Error lanzado (${typeof err})`;
  const { code } = err as { code?: unknown };
  const codigo = typeof code === 'string' ? ` [${code}]` : '';
  const detalles = detallesDeValidacion(err);
  return `${err.name}: ${err.message}${codigo}${detalles.length ? ` — ${detalles.join('; ')}` : ''}`;
}

/**
 * El texto que se guarda en `cargas_datos.mensaje` y se enseña en el panel cuando una
 * carga de Excel falla.
 *
 * Los errores que escribió el código (`Falta la columna "X"`, `Fila 12: …`) se conservan:
 * son justo lo que necesita quien subió el archivo. Los de la base de datos o del sistema
 * se sustituyen, porque su mensaje trae el nombre de la tabla, de la restricción o de la
 * ruta. El detalle completo queda en el log del servidor.
 */
export function mensajeSeguroDeCarga(error: unknown): string {
  if (!(error instanceof Error)) return 'Error desconocido al procesar el archivo.';
  if (error instanceof ValidationError) return MENSAJE_CARGA_RECHAZADA_POR_LA_BASE;
  if (error instanceof BaseError || typeof (error as { code?: unknown }).code === 'string') {
    return MENSAJE_CARGA_ERROR_INTERNO;
  }
  return error.message;
}

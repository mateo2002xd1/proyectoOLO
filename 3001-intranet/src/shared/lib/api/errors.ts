/**
 * Utilidades para tratar errores capturados en un `catch`.
 *
 * En TypeScript el valor de un `catch` es `unknown`: puede ser un Error, pero
 * también un string o cualquier otra cosa lanzada. Tiparlo como `any` para
 * poder leer `.message` desactiva la verificación de tipos justo en la ruta de
 * fallo, que es donde más falta hace.
 */

/** Mensaje legible de un error desconocido, con texto de respaldo. */
export function mensajeDeError(err: unknown, porDefecto = 'Ocurrió un error inesperado'): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'string' && err) return err;
  return porDefecto;
}

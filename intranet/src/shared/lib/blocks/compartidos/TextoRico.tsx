/**
 * Re-exportación desde `@olo/blocks-renderer`.
 *
 * El componente se comparte ahora entre `intranet` y `sitio-web` desde el
 * paquete común `@olo/blocks-renderer`. Este archivo se conserva para no romper
 * ningún import existente dentro de la intranet.
 */
export { TextoRico } from '@olo/blocks-renderer';
export type { TextoRicoProps } from '@olo/blocks-renderer';

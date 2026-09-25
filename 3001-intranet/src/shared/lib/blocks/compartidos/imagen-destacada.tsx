/**
 * Re-exportación desde `@olo/blocks-renderer`.
 *
 * El componente se comparte ahora entre `intranet` y `sitio-web` desde el
 * paquete común `@olo/blocks-renderer`. Este archivo se conserva para no romper
 * ningún import existente dentro de la intranet.
 */
export { ImagenDestacada } from '@olo/blocks-renderer';
export type { ImagenDestacadaProps } from '@olo/blocks-renderer';

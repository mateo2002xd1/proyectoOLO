/**
 * Punto de entrada de `paginas` para código de cliente que no debe cargar axios.
 *
 * `index.ts` reexporta los servicios de páginas, que importan axios.
 * `config/puck.config.tsx` es `'use client'` y solo necesita los valores por defecto de
 * la cabecera para los `defaultProps` del bloque `Header`: importarlos desde `index.ts`
 * metería el cliente HTTP entero en el bundle del navegador sin que nadie lo llame.
 * Aquí solo hay datos y tipos.
 *
 * Es el papel que tenía `identidad-visual/client.ts` antes de unirse a este módulo.
 * Regla §0.3: sigue siendo una puerta pública del módulo, no un atajo a sus archivos
 * internos.
 */
export { CABECERA_POR_DEFECTO } from './navegation/cabecera-por-defecto';
export type { CabeceraPorDefecto, NavLink } from './navegation/cabecera-por-defecto';

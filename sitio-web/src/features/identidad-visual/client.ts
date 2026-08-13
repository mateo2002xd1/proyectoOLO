/**
 * Punto de entrada de identidad-visual para código de cliente.
 *
 * El barrel principal (`index.ts`) reexporta `obtenerIdentidadVisual`, que
 * arrastra axios. `config/puck.config.tsx` es `'use client'` y necesita los
 * valores por defecto para los `defaultProps` del bloque `Header`: importarlos
 * desde el barrel metería el cliente HTTP entero en el bundle del navegador sin
 * que nadie lo llame. Aquí solo hay datos y tipos.
 *
 * Regla §0.3 — sigue siendo la puerta pública del módulo, no un atajo a sus
 * archivos internos.
 */
export { defaultIdentidadVisual } from './lib/default-identidad-visual';
export type { IdentidadVisual, NavLink } from './types';

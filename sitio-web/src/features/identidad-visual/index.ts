/**
 * Punto de entrada público del módulo identidad-visual (RF-03).
 *
 * Regla de oro §0.3: Un módulo de dominio no importa archivos internos de otro módulo.
 * Todo lo que otros módulos necesiten de `features/identidad-visual/` se exporta desde aquí.
 */

// Services
export { obtenerIdentidadVisual } from './services/identidad-visual.service';

// Lib
export { defaultIdentidadVisual } from './lib/default-identidad-visual';

// Types
export type { IdentidadVisual, NavLink } from './types';

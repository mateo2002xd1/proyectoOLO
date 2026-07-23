/**
 * Punto de entrada público del módulo buscador-ocupaciones (RF-09).
 *
 * Regla de oro §0.3: Un módulo de dominio no importa archivos internos de otro módulo.
 * Todo lo que otros módulos necesiten de `features/buscador-ocupaciones/` se exporta desde aquí.
 */

// Components
export { BuscadorOcupacionesView } from './components/buscador-ocupaciones-view';

// Hooks
export { useBuscadorOcupaciones } from './hooks/use-buscador-ocupaciones';

// Services
export { buscarOcupaciones } from './services/buscador-ocupaciones.service';

// Types
export type { Ocupacion } from './types';

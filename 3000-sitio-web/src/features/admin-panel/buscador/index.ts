/**
 * Punto de entrada público del módulo buscador del panel.
 *
 * Regla de oro §0.3: nada de `features/admin-panel/buscador/` se importa desde
 * fuera si no sale por aquí.
 */

// Components
export { BuscadorModal } from './components/buscador-modal';

// Lib
export { buscarEnPanel, normalizar, DESTINOS_PANEL } from './lib/indice-panel';

// Types
export type { DestinoPanel } from './lib/indice-panel';

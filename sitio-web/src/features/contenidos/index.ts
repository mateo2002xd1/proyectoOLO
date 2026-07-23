/**
 * Punto de entrada público del módulo contenidos (RF-01, RF-10).
 *
 * Regla de oro §0.3: Un módulo de dominio no importa archivos internos de otro módulo.
 * Todo lo que otros módulos necesiten de `features/contenidos/` se exporta desde aquí.
 */

// Components
export { ContenidosView } from './components/contenidos-view';

// Hooks
export { useContenidos } from './hooks/use-contenidos';

// Services
export { listarContenidosPublicados } from './services/contenidos.service';

// Types
export type { Contenido } from './types';

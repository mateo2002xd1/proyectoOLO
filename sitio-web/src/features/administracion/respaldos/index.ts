/** Punto de entrada público del módulo respaldos. Ver regla 12 de `1-guia-del-proyecto.md`. */

// Components
export { RespaldosView } from './components/respaldos-view';

// Hooks
export { useRespaldos } from './hooks/use-respaldos';

// Services
export { listarRespaldos } from './services/respaldos.service';

// Types
export type { RegistroRespaldo, AutorRespaldo } from './types';

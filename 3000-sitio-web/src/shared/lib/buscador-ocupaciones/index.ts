/**
 * Punto de entrada público del módulo buscador-ocupaciones (RF-09).
 *
 * Regla de oro §0.3: Un módulo de dominio no importa archivos internos de otro módulo.
 * Todo lo que otros módulos necesiten de `features/buscador-ocupaciones/` se exporta desde aquí.
 *
 * `lib/consulta-cno.ts` queda deliberadamente fuera: lee la llave de la API
 * pública (`CNO_API_KEY`) y solo pueden importarlo los route handlers de
 * `app/api/ocupaciones/`. Si se reexportara aquí, cualquier componente de
 * cliente podría arrastrarlo a su bundle sin darse cuenta.
 */

// Components
export { BuscadorOcupacionesBanner } from './components/buscador-ocupaciones-banner';
export { BuscadorOcupacionesView } from './components/buscador-ocupaciones-view';
export { PaginaDeResultadosOcupaciones } from './components/pagina-de-resultados';
export { DetalleOcupacion } from './components/detalle-ocupacion';
export { ModalOcupaciones } from './components/modal-ocupaciones';
export { ResultadosOcupaciones } from './components/resultados-ocupaciones';
export { HeroBuscadorOcupaciones } from './components/hero-buscador-ocupaciones';

// Textos de la portada (el campo único de Editor.js y el paso desde los tres de Puck)
export {
  CONTENIDO_DEL_BUSCADOR_POR_DEFECTO,
  contenidoDesdeHtml,
  type TextosEnHtml,
} from './lib/textos-del-buscador';

// Hooks
export { useBuscadorOcupaciones } from './hooks/use-buscador-ocupaciones';
export { useDetalleOcupacion } from './hooks/use-detalle-ocupacion';

// Services
export { buscarOcupaciones, obtenerDetalleOcupacion } from './services/buscador-ocupaciones.service';

// Types
export type {
  DetalleOcupacion as DetalleOcupacionData,
  OcupacionRelacionada,
  ResultadoOcupacion,
  TipoClasificacion,
} from './types';

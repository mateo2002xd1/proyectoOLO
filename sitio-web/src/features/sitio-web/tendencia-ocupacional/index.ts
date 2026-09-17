/**
 * Punto de entrada público del módulo tendencia-ocupacional.
 *
 * Sigue la convención de encapsulamiento del proyecto:
 * este módulo no expone componentes internos salvo la vista pública
 * y sus tipos para consumo en la configuración de Puck y páginas.
 */

export { TendenciaOcupacionalView } from './components/tendencia-ocupacional-view';
export { TITULOS_TENDENCIA } from './data/base-tendencia-datos';
export type {
  RegistroTendenciaOcupacional,
  FiltrosTendencia,
  TipoTendenciaOcupacional,
  TendenciaOcupacionalViewProps,
} from './types';


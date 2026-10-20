/**
 * Punto de entrada público del módulo auditoría (RF-07).
 *
 * Regla 12 de `1-guia-del-proyecto.md`: nada de `features/auditoria/` se importa
 * desde fuera si no sale por aquí.
 */

// Components
export { AuditoriaView } from './components/auditoria-view';
export { FraseDeActividad, FraseDeRegistro, PildoraDeAccion } from './components/frase-de-registro';

// Hooks
export { useAuditoria } from './hooks/use-auditoria';

// Services
export { listarAuditoria, listarUsuariosDeFiltro, ErrorAuditoria } from './services/auditoria.service';

// Lib
export { aCsv, descargarCsv } from './lib/csv';
export { resumenDeCambios } from './lib/cambios';

// Presentación compartida: el panel general resume la bitácora con las mismas
// etiquetas, colores y resumen de cambios que la tabla de auditoría, para que no
// haya dos lenguajes ni dos lecturas de qué cambió cada registro.
export { colorDeAccion, etiquetaDeAccion, etiquetaDeEntidad } from './types';

// Types
export type {
  RegistroAuditoria,
  CampoModificado,
  FiltrosAuditoria,
  RespuestaAuditoria,
  AccionAuditable,
  EntidadAuditable,
} from './types';

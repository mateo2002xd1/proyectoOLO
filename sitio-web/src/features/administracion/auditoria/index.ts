/**
 * Punto de entrada público del módulo auditoría (RF-07).
 *
 * Regla 12 de `1-guia-del-proyecto.md`: nada de `features/auditoria/` se importa
 * desde fuera si no sale por aquí.
 */

// Components
export { AuditoriaView } from './components/auditoria-view';

// Hooks
export { useAuditoria } from './hooks/use-auditoria';

// Services
export { listarAuditoria, listarUsuariosDeFiltro, ErrorAuditoria } from './services/auditoria.service';

// Lib
export { aCsv, descargarCsv } from './lib/csv';

// Presentación compartida: el panel general resume la bitácora con las mismas
// etiquetas y colores que la tabla de auditoría, para que no haya dos lenguajes.
export { COLOR_ACCION, etiquetaDeAccion, etiquetaDeEntidad } from './types';

// Types
export type {
  RegistroAuditoria,
  CampoModificado,
  FiltrosAuditoria,
  RespuestaAuditoria,
  AccionAuditable,
  EntidadAuditable,
} from './types';

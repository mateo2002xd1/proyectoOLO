/**
 * Punto de entrada público del módulo paginas.
 *
 * Regla de oro §0.3: Un módulo de dominio no importa archivos internos de otro módulo.
 * Todo lo que otros módulos necesiten de `features/paginas/` se exporta desde aquí.
 */

// Components
export { PageRenderer } from "./components/page-renderer";
export { default as EditButton } from "./components/edit-button";
export { PuckEditorWrapper } from "./components/puck-editor-wrapper";
export { EditorjsWrapper } from "./components/editorjs-wrapper";
export { ClientPuckRender } from "./components/client-puck-render";
export { RevisionQueueView } from "./components/revision-queue-view";

// Hooks
export { usePagina } from "./hooks/use-pagina";
export { useRevisionQueue } from "./hooks/use-revision-queue";

// Services
export {
  obtenerPagina,
  obtenerPaginaInicio,
  guardarBorrador,
  enviarARevision,
  aprobarPagina,
  rechazarPagina,
  listarEnRevision,
} from "./services/paginas.service";

// Lib
export { homeFallbackData } from "./lib/home-fallback-data";

// Types
export type {
  Pagina,
  Bloque,
  PaginaVersion,
  PaginaEnRevision,
  EstadoPagina,
} from "./types";

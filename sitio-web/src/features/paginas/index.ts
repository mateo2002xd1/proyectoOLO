/**
 * Punto de entrada público del módulo de páginas.
 *
 * Regla de oro §0.3: Un módulo de dominio no importa archivos internos de otro módulo.
 * Todo lo que otros módulos necesiten de `features/paginas/` se exporta desde aquí.
 */

// Components
export { PageRenderer } from "./components/page-renderer";
export { default as EditButton } from "./components/edit-button";
export { PuckEditorWrapper } from "./components/puck-editor-wrapper";
export { EditorjsWrapper } from "./components/editorjs-wrapper";

// Hooks
export { usePagina } from "./hooks/use-pagina";

// API
export {
  obtenerPagina,
  guardarBorrador,
  enviarARevision,
  aprobarPagina,
  rechazarPagina,
} from "./api/paginas.api";

// Types
export type {
  Pagina,
  Bloque,
  PaginaVersion,
  PaginaEnRevision,
  EstadoPagina,
} from "./types";

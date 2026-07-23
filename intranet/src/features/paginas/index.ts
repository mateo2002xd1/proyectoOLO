/**
 * Punto de entrada público del módulo de páginas.
 *
 * Regla de oro §0.3: Un módulo de dominio no importa archivos internos de otro módulo.
 * Todo lo que otros módulos necesiten de `features/paginas/` se exporta desde aquí.
 *
 * @see ARQUITECTURA_MAESTRA_OLO.md §0.3
 */

// Components
export { PageRenderer } from "./components/page-renderer";
export { EditButton } from "./components/edit-button";
export { PuckEditorWrapper } from "./components/puck-editor-wrapper";
export { EditorJsWrapper } from "./components/editorjs-wrapper";

// Hooks
export { usePagina } from "./hooks/use-pagina";
export { useEditorActions } from "./hooks/use-editor-actions";

// API
export {
  obtenerVersionEditable,
  guardarBorrador,
  enviarARevision,
} from "./api/paginas.api";
export type { VersionEditable } from "./api/paginas.api";

// Types
export type {
  ContenidoPagina,
  PaginaVersion,
  EstadoPagina,
  BloquePuck,
  BloqueEditorJs,
  PuckEditorWrapperProps,
  EditorJsWrapperProps,
  EditButtonProps,
} from "./types/editor.types";

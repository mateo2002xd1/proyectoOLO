/**
 * Punto de entrada público del módulo de páginas.
 *
 * Un módulo de dominio no importa archivos internos de otro módulo. Todo lo que
 * otros módulos necesiten de `features/paginas/` se exporta desde aquí.
 *
 * NOTA: este es un dominio CON ciclo de vida. Su estructura interna
 * (`model/`, `publicacion/`, `edicion/`, `revision/`) está definida en
 * `8-ciclo-editorial.md` §3.2 y se aplica en la fase 4 del §5. Las rutas
 * internas de abajo cambian entonces; este archivo absorbe el movimiento.
 *
 * @see 4-reglas.md regla 6
 * @see 8-ciclo-editorial.md §3.2
 */

// Components
export { PageRenderer } from "./components/page-renderer";
export { EditButton } from "./components/edit-button";
export { PuckEditorWrapper } from "./components/puck-editor-wrapper";
export { EditorJsWrapper } from "./components/editorjs-wrapper";
export { ClientPuckRender } from "./components/client-puck-render";
export { PlantillaEditButton } from "./components/plantilla-edit-button";

// Semillas de contenido inicial (mesa de trabajo)
export { getPageSeed, isEmptyContent } from "./lib/page-seeds";

// Plantilla: la barra y el pie que comparten todas las secciones
export { obtenerPlantilla, SLUG_PLANTILLA } from "./lib/plantilla";
export type { Plantilla } from "./lib/plantilla";

// Ruta de regreso al salir del editor
export { enlaceAlEditor, esRutaInternaSegura, resolverRutaDeVuelta } from "./lib/ruta-de-vuelta";

// Hooks
export { usePagina } from "./hooks/use-pagina";
export { useEditorActions } from "./hooks/use-editor-actions";

// API
export {
  obtenerVersionEditable,
  obtenerPaginaPublicada,
  guardarBorrador,
  enviarARevision,
} from "./api/paginas.api";
export type { VersionEditable, PaginaPublicada } from "./api/paginas.api";

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

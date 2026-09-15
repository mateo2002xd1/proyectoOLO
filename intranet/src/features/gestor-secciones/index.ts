/**
 * Punto de entrada público del módulo de páginas.
 *
 * Un módulo de dominio no importa archivos internos de otro módulo. Todo lo que
 * otros módulos necesiten de `features/gestor-secciones/` se exporta desde aquí.
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
export { PaginasFabSpeedDial } from "./components/paginas-fab-speed-dial";
export { ModalNuevaSeccion } from "./components/modal-nueva-seccion";
export { ModalEliminarSeccion } from "./components/modal-eliminar-seccion";
export { EditButton } from "./components/edit-button";
export { PuckEditorWrapper } from "./components/puck-editor-wrapper";
export { EditorJsWrapper } from "./components/editorjs-wrapper";
export { ClientPuckRender } from "./components/client-puck-render";
export { AvisoEditorOcupado } from "./components/aviso-editor-ocupado";
export { PlantillaEditButton } from "./components/plantilla-edit-button";
export { NuevaSeccionButton } from "./components/nueva-seccion-button";
export { EliminarSeccionButton } from "./components/eliminar-seccion-button";
export { AvisoSeccionNueva } from "./components/aviso-seccion-nueva";
export { MarcoSecciones } from "./components/marco-secciones";
export { RastreadorVisitas } from "./components/rastreador-visitas";

// Semillas de contenido inicial (mesa de trabajo)
export { getPageSeed, isEmptyContent } from "./lib/page-seeds";

// Plantilla: la barra y el pie que comparten todas las secciones
export { obtenerPlantilla, SLUG_PLANTILLA } from "./lib/plantilla";
export type { Plantilla } from "./lib/plantilla";

// Ruta de regreso al salir del editor
export {
  enlaceAlEditor,
  esRutaInternaSegura,
  resolverRutaDeVuelta,
  slugDeOrigen,
} from "./lib/ruta-de-vuelta";

// Hooks
export { usePagina } from "./hooks/use-pagina";
export { useEditorActions } from "./hooks/use-editor-actions";
export { useBloqueoDeEdicion } from "./hooks/use-bloqueo-de-edicion";
export type { Bloqueo, EstadoDeBloqueo } from "./hooks/use-bloqueo-de-edicion";

// API
export {
  obtenerVersionEditable,
  obtenerPaginaPublicada,
  guardarBorrador,
  enviarARevision,
  crearSeccion,
  analizarEliminacion,
  eliminarSeccion,
} from "./api/paginas.api";
export type {
  VersionEditable,
  PaginaPublicada,
  SeccionCreada,
  SeccionEliminada,
  AnalisisDeEliminacion,
} from "./api/paginas.api";

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

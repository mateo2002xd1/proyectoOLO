/**
 * Punto de entrada público del módulo paginas.
 *
 * Regla de oro §0.3: Un módulo de dominio no importa archivos internos de otro módulo.
 * Todo lo que otros módulos necesiten de `features/paginas/` se exporta desde aquí.
 */

// Components
export { PaginasFabSpeedDial } from "./components/paginas-fab-speed-dial";
export { ModalNuevaSeccion } from "./components/modal-nueva-seccion";
export { ModalEliminarSeccion } from "./components/modal-eliminar-seccion";
export { EditButton } from "./components/edit-button";
export { PlantillaEditButton } from "./components/plantilla-edit-button";
export { NuevaSeccionButton } from "./components/nueva-seccion-button";
export { EliminarSeccionButton } from "./components/eliminar-seccion-button";
export { AvisoSeccionNueva } from "./components/aviso-seccion-nueva";
export { PuckEditorWrapper } from "./components/puck-editor-wrapper";
export { EditorjsWrapper } from "./components/editorjs-wrapper";
export { ClientPuckRender } from "./components/client-puck-render";
export { AvisoEditorOcupado } from "./components/aviso-editor-ocupado";
export { RevisionQueueView } from "./components/revision-queue-view";

// Hooks
export { usePagina } from "./hooks/use-pagina";
export { useRevisionQueue } from "./hooks/use-revision-queue";
export { useBloqueoDeEdicion } from "./hooks/use-bloqueo-de-edicion";
export type { Bloqueo, EstadoDeBloqueo } from "./hooks/use-bloqueo-de-edicion";

// Services
export {
  obtenerPagina,
  obtenerPaginaEditable,
  obtenerPaginaPublicadaCacheada,
  obtenerPaginaInicio,
  guardarBorrador,
  enviarARevision,
  aprobarPagina,
  rechazarPagina,
  eliminarVersion,
  listarEnRevision,
  resumenDePaginasPublicadas,
  type PaginaPublicada,
  type ResumenPaginasPublicadas,
  crearSeccion,
  permisosDeLaSesion,
  analizarEliminacion,
  eliminarSeccion,
  obtenerIndiceBusqueda,
} from "./services/paginas.service";
export type {
  SeccionCreada,
  SeccionEliminada,
  AnalisisDeEliminacion,
} from "./services/paginas.service";

// Lib
export { homeFallbackData } from "./lib/home-fallback-data";
export { etiquetaDePagina } from "./lib/etiquetas-cache";
export { obtenerPlantilla, SLUG_PLANTILLA } from "./lib/plantilla";
export type { Plantilla } from "./lib/plantilla";
export {
  enlaceAlEditor,
  esRutaInternaSegura,
  resolverRutaDeVuelta,
  rutaPublicaDeSlug,
  slugDeOrigen,
} from "./lib/ruta-de-vuelta";

// Types
export type {
  Pagina,
  Bloque,
  PaginaVersion,
  PaginaEditable,
  PaginaEnRevision,
  EstadoPagina,
  PaginaIndiceBusqueda,
  ItemTextoBusqueda,
  ResultadoBusqueda,
} from "./types";

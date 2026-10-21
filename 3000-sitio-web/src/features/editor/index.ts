/**
 * Punto de entrada público del módulo paginas.
 *
 * Regla de oro §0.3: Un módulo de dominio no importa archivos internos de otro módulo.
 * Todo lo que otros módulos necesiten de `features/editor/` se exporta desde aquí.
 *
 * Agrupado por carpeta, igual que el módulo (`8-ciclo-editorial.md` §3.2): `model/`,
 * las etapas `publicacion/`, `edicion/` y `revision/`, y dos partes del dominio que no
 * son etapas, `menu-y-pie/` y `secciones/`.
 */

// model/ — vocabulario compartido
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
} from "./model/pagina.types";
export {
  enlaceAlEditor,
  esRutaInternaSegura,
  resolverRutaDeVuelta,
  rutaPublicaDeSlug,
  slugDeOrigen,
  slugDeRutaPublica,
} from "./model/rutas";
export { homeFallbackData } from "./model/home-fallback-data";

// publicacion/ — lo que ve quien visita el sitio
export {
  obtenerPagina,
  obtenerPaginaPublicadaCacheada,
  obtenerPaginaInicio,
  registrarVisita,
  obtenerIndiceBusqueda,
} from "./publishing/services/publicacion.service";
export { ClientPuckRender } from "./publishing/components/client-puck-render";
export { RastreadorVisitas } from "./publishing/components/rastreador-visitas";
export { etiquetaDePagina } from "./publishing/lib/etiquetas-cache";

// edicion/ — el editor Puck, el borrador y el candado de edición
export {
  obtenerPaginaEditable,
  guardarBorrador,
  enviarARevision,
} from "./edition/services/edicion.service";
export { PuckEditorWrapper } from "./edition/components/puck-editor-wrapper";
export { EditorjsWrapper } from "./edition/components/editorjs-wrapper";
export { AvisoEditorOcupado } from "./edition/components/aviso-editor-ocupado";
export { usePagina } from "./edition/hooks/use-pagina";
export { useBloqueoDeEdicion } from "./edition/hooks/use-bloqueo-de-edicion";
export type { Bloqueo, EstadoDeBloqueo } from "./edition/hooks/use-bloqueo-de-edicion";

// menu-y-pie/ — la cabecera y el pie de todo el sitio
export { obtenerPlantilla, SLUG_PLANTILLA } from "./navegation/menu-y-pie";
export type { Plantilla, PropsCabecera, PropsPie } from "./navegation/menu-y-pie";

// revision/ — la cola de aprobación
export {
  aprobarPagina,
  rechazarPagina,
  eliminarVersion,
  listarEnRevision,
} from "./review/services/revision.service";
export { RevisionQueueView } from "./review/components/revision-queue-view";
export { useRevisionQueue } from "./review/hooks/use-revision-queue";

// secciones/ — crear y eliminar páginas, botón flotante, resumen del panel
export {
  resumenDePaginasPublicadas,
  type PaginaPublicada,
  type ResumenPaginasPublicadas,
  crearSeccion,
  permisosDeLaSesion,
  analizarEliminacion,
  eliminarSeccion,
} from "./sections/services/secciones.service";
export type {
  SeccionCreada,
  SeccionEliminada,
  AnalisisDeEliminacion,
} from "./sections/services/secciones.service";
export { PaginasFabSpeedDial } from "./sections/components/paginas-fab-speed-dial";
export { ModalNuevaSeccion } from "./sections/components/modal-nueva-seccion";
export { ModalEliminarSeccion } from "./sections/components/modal-eliminar-seccion";
export { AvisoSeccionNueva } from "./sections/components/aviso-seccion-nueva";

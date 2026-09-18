/**
 * Punto de entrada público del módulo paginas.
 *
 * Regla de oro §0.3: Un módulo de dominio no importa archivos internos de otro módulo.
 * Todo lo que otros módulos necesiten de `features/paginas/` se exporta desde aquí.
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
} from "./publicacion/services/publicacion.service";
export { ClientPuckRender } from "./publicacion/components/client-puck-render";
export { PaginaPuckFija } from "./publicacion/components/pagina-puck-fija";
export { RastreadorVisitas } from "./publicacion/components/rastreador-visitas";
export { etiquetaDePagina } from "./publicacion/lib/etiquetas-cache";

// edicion/ — el editor Puck, el borrador y el candado de edición
export {
  obtenerPaginaEditable,
  guardarBorrador,
  enviarARevision,
} from "./edicion/services/edicion.service";
export { PuckEditorWrapper } from "./edicion/components/puck-editor-wrapper";
export { EditorjsWrapper } from "./edicion/components/editorjs-wrapper";
export { AvisoEditorOcupado } from "./edicion/components/aviso-editor-ocupado";
export { usePagina } from "./edicion/hooks/use-pagina";
export { useBloqueoDeEdicion } from "./edicion/hooks/use-bloqueo-de-edicion";
export type { Bloqueo, EstadoDeBloqueo } from "./edicion/hooks/use-bloqueo-de-edicion";

// menu-y-pie/ — la cabecera y el pie de todo el sitio
export { obtenerPlantilla, SLUG_PLANTILLA } from "./menu-y-pie/menu-y-pie";
export type { Plantilla, PropsCabecera, PropsPie } from "./menu-y-pie/menu-y-pie";

// revision/ — la cola de aprobación
export {
  aprobarPagina,
  rechazarPagina,
  eliminarVersion,
  listarEnRevision,
} from "./revision/services/revision.service";
export { RevisionQueueView } from "./revision/components/revision-queue-view";
export { useRevisionQueue } from "./revision/hooks/use-revision-queue";

// secciones/ — crear y eliminar páginas, botón flotante, resumen del panel
export {
  resumenDePaginasPublicadas,
  type PaginaPublicada,
  type ResumenPaginasPublicadas,
  crearSeccion,
  permisosDeLaSesion,
  analizarEliminacion,
  eliminarSeccion,
} from "./secciones/services/secciones.service";
export type {
  SeccionCreada,
  SeccionEliminada,
  AnalisisDeEliminacion,
} from "./secciones/services/secciones.service";
export { PaginasFabSpeedDial } from "./secciones/components/paginas-fab-speed-dial";
export { ModalNuevaSeccion } from "./secciones/components/modal-nueva-seccion";
export { ModalEliminarSeccion } from "./secciones/components/modal-eliminar-seccion";
export { AvisoSeccionNueva } from "./secciones/components/aviso-seccion-nueva";

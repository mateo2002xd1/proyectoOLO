/**
 * Punto de entrada público del módulo paginas.
 *
 * Un módulo de dominio no importa archivos internos de otro módulo. Todo lo que
 * otros módulos necesiten de `features/paginas/` se exporta desde aquí.
 *
 * Agrupado por carpeta, igual que el módulo y que su gemelo de sitio-web
 * (`8-ciclo-editorial.md` §3.2): `model/`, las etapas `publicacion/` y `edicion/`, y
 * dos partes del dominio que no son etapas, `menu-y-pie/` y `secciones/`. La intranet
 * no tiene etapa `revision/`: sus cambios se aprueban desde el panel del sitio, que
 * abre `app/preview/` de esta app para verlos.
 *
 * La barra de navegación no entra por aquí sino por `client.ts` (ver ese archivo).
 *
 * @see 4-reglas.md regla 6
 * @see 8-ciclo-editorial.md §3.2
 */

// model/ — vocabulario compartido
export type {
  ContenidoPagina,
  PaginaVersion,
  EstadoPagina,
  BloquePuck,
  PaginaPublicada,
  VersionEditable,
  ItemTextoBusqueda,
  PaginaIndiceBusqueda,
} from "./model/pagina.types";
export {
  enlaceAlEditor,
  esRutaInternaSegura,
  resolverRutaDeVuelta,
  rutaPublicaDeSlug,
  slugDeOrigen,
  slugDeRutaPublica,
} from "./model/rutas";

// publicacion/ — lo que ve quien entra a una sección
export {
  obtenerPaginaPublicada,
  obtenerIndiceBusqueda,
  registrarVisita,
} from "./publicacion/services/publicacion.service";
export { ClientPuckRender } from "./publicacion/components/client-puck-render";
export { RastreadorVisitas } from "./publicacion/components/rastreador-visitas";

// edicion/ — el editor Puck, el borrador y el candado de edición
export {
  obtenerVersionEditable,
  guardarBorrador,
  enviarARevision,
} from "./edicion/services/edicion.service";
export { PuckEditorWrapper } from "./edicion/components/puck-editor-wrapper";
export { AvisoEditorOcupado } from "./edicion/components/aviso-editor-ocupado";
export { useEditorActions } from "./edicion/hooks/use-editor-actions";
export { useBloqueoDeEdicion } from "./edicion/hooks/use-bloqueo-de-edicion";
export type { Bloqueo, EstadoDeBloqueo } from "./edicion/hooks/use-bloqueo-de-edicion";
export { getPageSeed, isEmptyContent } from "./edicion/lib/page-seeds";

// menu-y-pie/ — la barra y el pie que comparten todas las secciones
export { obtenerPlantilla, SLUG_PLANTILLA } from "./menu-y-pie/menu-y-pie";
export type { Plantilla } from "./menu-y-pie/menu-y-pie";
export { MarcoSecciones } from "./menu-y-pie/marco-secciones";

// secciones/ — crear y eliminar secciones, botón flotante
export {
  crearSeccion,
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

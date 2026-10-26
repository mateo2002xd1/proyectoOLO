// ─── Primitivos de maquetación para Puck (compartidos entre apps) ───
export {
  crearGridConfig,
  flexConfig,
  spaceConfig,
  primitiveComponents,
  PRIMITIVE_COMPONENT_NAMES,
} from './primitives/layout-primitives';

export {
  tabsConfig,
  TabsRender,
  MAX_TABS,
} from './primitives/tabs-primitives';
export type { TabsProps, TabItem } from './primitives/tabs-primitives';

export { DestinoTabField } from './primitives/destino-tab-field';
export type { DestinoTabConfig } from './primitives/destino-tab-field';

// ─── Campo de color (selector visual + hex) para cualquier bloque ───
export { ColorPickerField, campoColor } from './primitives/color-picker-field';
export type { ColorPickerFieldProps } from './primitives/color-picker-field';
// El panel de color que abre ese campo, también para la herramienta «Color del texto» de Editor.js
// y para los selectores de color del panel de administración (`PopoverDelPanelDeColor`).
export { PopoverDelPanelDeColor } from './primitives/popover-del-panel-de-color';
export type { PopoverDelPanelDeColorProps } from './primitives/popover-del-panel-de-color';
export {
  crearPanelDeColor,
  hexAHsv,
  hsvAHex,
  inyectarEstilosDelPanelDeColor,
  normalizarHex,
  rgbAHex,
  TEMA_DEL_PANEL_DE_COLOR,
} from './primitives/panel-de-color';
export type { Hsv, OpcionesDelPanelDeColor, PanelDeColor, TemaDelPanelDeColor } from './primitives/panel-de-color';
export {
  AcordeonDeCampo,
  campoEnAcordeon,
  campoGrupoEnAcordeones,
  campoGrupoEnUnAcordeon,
  campoListaEnAcordeones,
  campoObjetoEnAcordeon,
  ObjetoEnAcordeon,
} from './primitives/campos-en-acordeon';
export type { CampoDeAcordeon, OpcionesDeAcordeon, OpcionesDeLista } from './primitives/campos-en-acordeon';
export { campoPaginaEnEdicion } from './primitives/campo-pagina-en-edicion';
export { CamposAgrupados, GRUPOS_DE_CAMPOS, crearEtiquetaDeCampo } from './primitives/campos-agrupados';
export type { GrupoDeCampos } from './primitives/campos-agrupados';

// ─── Campo de texto enriquecido con la barra de formato del OLO ───
export { crearCampoTextoRico, OPCIONES_TEXTO_RICO } from './primitives/campo-texto-rico';

// ─── Campos para Icono y Color de Icono ───
export { IconSelectorField, campoIcono, IconoRenderer, ICONOS_DISPONIBLES } from './primitives/icon-selector-field';
export type { IconSelectorFieldProps, IconoDelCatalogo } from './primitives/icon-selector-field';

// ─── Selector de Destino para Botón (Enlace o Archivo) ───
export { SelectorDestinoBotonField, campoDestinoBoton, campoDestinoBotonEnAcordeon } from './primitives/selector-destino-boton-field';
export type { DestinoBotonConfig } from './primitives/selector-destino-boton-field';

// ─── Controles de espaciado y ancho para cualquier bloque ───
export {
  conCaja,
  conCajaEnTodos,
  campoCaja,
  cajaPorDefecto,
  estiloDeCaja,
  pixelesDeEspacio,
  ESCALA_ESPACIO,
  BLOQUES_SIN_CAJA,
} from './primitives/controles-de-caja';

export type {
  ConfigDeBloque,
  ValoresCaja,
  ClaveEspacio,
  EstiloDeCaja,
  FabricaCampoImagen,
} from './primitives/controles-de-caja';

// ─── Búsqueda, desplazamiento suave y resaltado (compartidos entre apps) ───
export {
  buscarElementoPorTexto,
  aplicarDestello,
  activarPestanaDeElemento,
  desplazarAElemento,
  resaltarCoincidenciaTexto,
} from './busqueda/busqueda-scroll';
export { ResaltadorDeBusqueda } from './busqueda/resaltador-de-busqueda';
export type { ResaltadorDeBusquedaProps } from './busqueda/resaltador-de-busqueda';

// ─── Bloques de contenido compartidos ───
export { TextoRico } from './blocks/texto-rico';
export type { TextoRicoProps } from './blocks/texto-rico';

export { ImagenDestacada, muestraDeImagen } from './blocks/imagen-destacada';
export type { ImagenDestacadaProps } from './blocks/imagen-destacada';

export {
  BotonPersonalizado,
  alineacionDelBoton,
  tamanoDelBotonEnPx,
  migrarBoton,
} from './blocks/boton-personalizado';
export type {
  BotonPersonalizadoProps,
  TamanoBoton,
  PosicionIcono,
  AlineacionBoton,
  AnchoBoton,
} from './blocks/boton-personalizado';

export { SeccionBotonesIcono } from './blocks/seccion-botones-icono';
export type {
  SeccionBotonesIconoProps,
  ItemBotonSeccion,
} from './blocks/seccion-botones-icono';

export { TarjetaArticulo } from './blocks/tarjeta-articulo';
export type {
  TarjetaArticuloProps,
  AlineacionTarjeta,
} from './blocks/tarjeta-articulo';

// ─── Contexto de página en edición y registro de subidas para Puck ───
export {
  PaginaEnEdicionContext,
  usePaginaEnEdicion,
  useRegistrarSubida,
} from './primitives/pagina-en-edicion-context';
export type {
  ContextoPaginaEnEdicion,
  SubidaRegistrador,
} from './primitives/pagina-en-edicion-context';

// ─── Utilidades de peso y formato de archivo ───
export { formatearBytes } from './primitives/formato-archivos';



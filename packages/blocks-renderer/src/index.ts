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

// ─── Campos para Icono y Color de Icono ───
export { IconSelectorField, campoIcono, IconoRenderer, ICONOS_DISPONIBLES } from './primitives/icon-selector-field';
export type { IconSelectorFieldProps } from './primitives/icon-selector-field';

// ─── Selector de Destino para Botón (Enlace o Archivo) ───
export { SelectorDestinoBotonField, campoDestinoBoton } from './primitives/selector-destino-boton-field';
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
export { ResaltadorDeBusqueda } from './busqueda/ResaltadorDeBusqueda';
export type { ResaltadorDeBusquedaProps } from './busqueda/ResaltadorDeBusqueda';

// ─── Bloques de contenido compartidos ───
export { TextoRico } from './blocks/texto-rico';
export type { TextoRicoProps } from './blocks/texto-rico';

export { ImagenDestacada } from './blocks/imagen-destacada';
export type { ImagenDestacadaProps } from './blocks/imagen-destacada';

export { BotonPersonalizado } from './blocks/boton-personalizado';
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



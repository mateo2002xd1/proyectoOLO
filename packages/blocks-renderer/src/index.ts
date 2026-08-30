// ─── Primitivos de maquetación para Puck (compartidos entre apps) ───
export {
  crearGridConfig,
  flexConfig,
  spaceConfig,
  primitiveComponents,
  PRIMITIVE_COMPONENT_NAMES,
} from './primitives/layout-primitives';

// ─── Campo de color (selector visual + hex) para cualquier bloque ───
export { ColorPickerField, campoColor } from './primitives/color-picker-field';
export type { ColorPickerFieldProps } from './primitives/color-picker-field';

// ─── Campos para Icono y Color de Icono ───
export { IconSelectorField, campoIcono } from './primitives/icon-selector-field';

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

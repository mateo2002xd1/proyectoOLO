// ─── Primitivos de maquetación para Puck (compartidos entre apps) ───
export {
  gridConfig,
  flexConfig,
  spaceConfig,
  primitiveComponents,
  PRIMITIVE_COMPONENT_NAMES,
} from './primitives/layout-primitives';

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
} from './primitives/controles-de-caja';

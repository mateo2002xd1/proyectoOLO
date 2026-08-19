/**
 * Primitivos de maquetación para Puck (Grid / Flex / Space).
 *
 * Son `ComponentConfig` de Puck, NO componentes presentacionales: su `render`
 * pasa el estilo directamente al slot (`<Items style=... />`), de modo que el
 * propio dropzone se convierte en el contenedor grid/flex y los bloques que el
 * usuario suelte adentro quedan como hijos directos del layout.
 *
 * Se comparten entre `sitio-web` e `intranet` desde `@olo/blocks-renderer` para
 * no duplicar la lógica de maquetación. Cada app los registra en su `puckConfig`
 * (ver `primitiveComponents` + categoría "Maquetación").
 *
 * El espaciado exterior (padding, margen, ancho máximo) NO se define aquí: lo
 * pone `conCaja()` desde `controles-de-caja.tsx`, igual que en cualquier otro
 * bloque. Aquí solo vive lo que distingue a un contenedor de un bloque normal:
 * cómo se colocan los hijos.
 *
 * Estilos:
 *   - Todo se resuelve con clases (`.olo-grid`, `.olo-flex`) que leen variables
 *     CSS inline. Es la única forma de que el layout responda al tamaño de
 *     pantalla: un estilo inline no puede llevar media queries, y tanto el
 *     colapso de columnas como el apilado de filas en móvil las necesitan. Las
 *     clases viven en el `globals.css` de cada app.
 */

import {
  conCaja,
  pixelesDeEspacio,
  type ConfigDeBloque,
} from './controles-de-caja';
import { campoColor } from './color-picker-field';

/** Opciones de separación entre elementos — la misma escala que el resto. */
const OPCIONES_SEPARACION = [
  { label: 'Pegados', value: 'ninguno' },
  { label: 'Muy poco', value: 'minimo' },
  { label: 'Poco', value: 'poco' },
  { label: 'Medio', value: 'medio' },
  { label: 'Amplio', value: 'amplio' },
  { label: 'Muy amplio', value: 'maximo' },
];

/** Sí/No con el mismo texto en todos los contenedores. */
const OPCIONES_SI_NO = [
  { label: 'Sí', value: 'si' },
  { label: 'No', value: 'no' },
];

// ─── Grid / Columnas ──────────────────────────────────────────────────────────
export const gridConfig: ConfigDeBloque = {
  label: 'Columnas',
  fields: {
    columns: {
      type: 'number',
      label: 'Número de columnas',
      min: 1,
      max: 6,
    },
    gap: {
      type: 'select',
      label: 'Separación entre columnas',
      options: OPCIONES_SEPARACION,
    },
    alinearItems: {
      type: 'select',
      label: 'Alineación vertical del contenido',
      options: [
        { label: 'Misma altura', value: 'stretch' },
        { label: 'Arriba', value: 'start' },
        { label: 'Centrado', value: 'center' },
        { label: 'Abajo', value: 'end' },
      ],
    },
    fondo: campoColor('Color de fondo (opcional)'),
    // El slot es lo que convierte al bloque en contenedor: sin declararlo aquí,
    // Puck no pinta zona donde soltar y el bloque queda inservible.
    items: { type: 'slot' },
  },
  defaultProps: {
    columns: 3,
    gap: 'medio',
    alinearItems: 'stretch',
    fondo: '',
    items: [],
  },
  render: ({ columns, gap, alinearItems, fondo, items: Items }: any) => (
    <Items
      className="olo-grid"
      style={{
        // Variables consumidas por `.olo-grid` en globals.css
        ['--olo-grid-cols' as string]: String(columns ?? 3),
        ['--olo-grid-gap' as string]: `${pixelesDeEspacio(gap, 'medio')}px`,
        ['--olo-grid-align' as string]: alinearItems ?? 'stretch',
        // Sin fondo puesto no se añade la propiedad: mismo fondo transparente
        // que tenía el bloque antes de que existiera este campo.
        ...(fondo ? { backgroundColor: fondo } : {}),
      }}
    />
  ),
};

// ─── Flex / Fila ────────────────────────────────────────────────────────────
export const flexConfig: ConfigDeBloque = {
  label: 'Fila o columna flexible',
  fields: {
    direction: {
      type: 'radio',
      label: 'Dirección',
      options: [
        { label: 'En fila', value: 'row' },
        { label: 'En columna', value: 'column' },
      ],
    },
    justify: {
      type: 'select',
      label: 'Distribución en el eje principal',
      options: [
        { label: 'Al inicio', value: 'flex-start' },
        { label: 'Centrado', value: 'center' },
        { label: 'Al final', value: 'flex-end' },
        { label: 'Repartido con espacio entre medias', value: 'space-between' },
        { label: 'Repartido con espacio alrededor', value: 'space-around' },
      ],
    },
    align: {
      type: 'select',
      label: 'Alineación en el otro eje',
      options: [
        { label: 'Misma altura', value: 'stretch' },
        { label: 'Al inicio', value: 'flex-start' },
        { label: 'Centrado', value: 'center' },
        { label: 'Al final', value: 'flex-end' },
      ],
    },
    gap: {
      type: 'select',
      label: 'Separación entre elementos',
      options: OPCIONES_SEPARACION,
    },
    wrap: {
      type: 'radio',
      label: 'Saltar de línea cuando no quepan',
      options: OPCIONES_SI_NO,
    },
    apilarEnMovil: {
      type: 'radio',
      label: 'Apilar en móvil',
      options: OPCIONES_SI_NO,
    },
    fondo: campoColor('Color de fondo (opcional)'),
    items: { type: 'slot' },
  },
  defaultProps: {
    direction: 'row',
    justify: 'flex-start',
    align: 'stretch',
    gap: 'poco',
    wrap: 'si',
    apilarEnMovil: 'si',
    fondo: '',
    items: [],
  },
  render: ({ direction, justify, align, gap, wrap, apilarEnMovil, fondo, items: Items }: any) => (
    <Items
      // Apilar en móvil no puede ser un estilo inline: necesita una media query.
      className={`olo-flex${apilarEnMovil !== 'no' ? ' olo-flex--apilar' : ''}`}
      style={{
        ['--olo-flex-dir' as string]: direction ?? 'row',
        ['--olo-flex-justify' as string]: justify ?? 'flex-start',
        ['--olo-flex-align' as string]: align ?? 'stretch',
        ['--olo-flex-gap' as string]: `${pixelesDeEspacio(gap, 'poco')}px`,
        // `wrap` guardaba 'wrap'/'nowrap' antes de unificar el Sí/No; se acepta
        // el valor antiguo para no cambiar el aspecto de lo ya maquetado.
        ['--olo-flex-wrap' as string]:
          wrap === 'no' || wrap === 'nowrap' ? 'nowrap' : 'wrap',
        // Sin fondo puesto no se añade la propiedad: mismo fondo transparente
        // que tenía el bloque antes de que existiera este campo.
        ...(fondo ? { backgroundColor: fondo } : {}),
      }}
    />
  ),
};

// ─── Space / Separador ──────────────────────────────────────────────────────
export const spaceConfig: ConfigDeBloque = {
  label: 'Espacio en blanco',
  fields: {
    size: {
      type: 'select',
      label: 'Altura del espacio',
      options: OPCIONES_SEPARACION.slice(1),
    },
  },
  defaultProps: {
    size: 'amplio',
  },
  render: ({ size }: any) => (
    <div aria-hidden style={{ width: '100%', height: `${pixelesDeEspacio(size, 'amplio')}px` }} />
  ),
};

// ─── Registro agregado para consumir desde cada app ─────────────────────────
/** Nombres de los primitivos — usar para armar la categoría en cada puckConfig. */
export const PRIMITIVE_COMPONENT_NAMES = ['Grid', 'Flex', 'Space'] as const;

/**
 * Mapa listo para hacer spread dentro de `components` del puckConfig de cada app.
 *
 * Grid y Flex vienen ya envueltos con `conCaja` porque un contenedor sin
 * relleno ni margen propio sirve de poco, y así el paquete es útil aunque la
 * app no haga nada más. Que además cada app pase `conCajaEnTodos` por encima no
 * duplica nada: `conCaja` es idempotente justo por este caso.
 *
 * `Space` se queda sin envolver aquí —es en sí mismo un hueco, y darle margen
 * es otra forma de decir lo mismo—, pero tampoco se excluye en las apps: si el
 * catálogo entero pasa por `conCajaEnTodos`, lo gana como los demás.
 */
export const primitiveComponents: Record<string, ConfigDeBloque> = {
  Grid: conCaja(gridConfig),
  Flex: conCaja(flexConfig),
  Space: spaceConfig,
};

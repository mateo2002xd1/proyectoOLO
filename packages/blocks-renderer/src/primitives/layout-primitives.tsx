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
 * Estilos:
 *   - Flex y Space son 100% inline → funcionan sin CSS externo.
 *   - Grid usa la clase `.olo-grid` (definida en el `globals.css` de cada app)
 *     porque necesita media queries para colapsar en móvil, algo que un estilo
 *     inline no puede hacer. El número de columnas y la separación se inyectan
 *     como variables CSS para que la clase las consuma.
 */

/**
 * Forma mínima de un `ComponentConfig` de Puck.
 *
 * Se define localmente a propósito: así `@olo/blocks-renderer` NO depende de
 * `@puckeditor/core` (el paquete no tiene su propio node_modules con esa
 * dependencia). Cada app tipa su `puckConfig` con el `Config` real de Puck; al
 * hacer spread de `primitiveComponents`, TypeScript valida la compatibilidad.
 */
interface PuckLayoutConfig {
  label: string;
  fields: Record<string, unknown>;
  defaultProps: Record<string, unknown>;
  render: (props: any) => any;
}

// ─── Grid / Columnas ──────────────────────────────────────────────────────────
export const gridConfig: PuckLayoutConfig = {
  label: 'Grid / Columnas',
  fields: {
    columns: {
      type: 'number',
      label: 'Número de columnas',
      min: 1,
      max: 6,
    },
    gap: {
      type: 'number',
      label: 'Separación entre columnas (px)',
      min: 0,
    },
    items: { type: 'slot' },
  },
  defaultProps: {
    columns: 3,
    gap: 24,
    items: [],
  },
  render: ({ columns, gap, items: Items }: any) => (
    <Items
      className="olo-grid"
      style={{
        // Variables consumidas por `.olo-grid` en globals.css
        ['--olo-grid-cols' as string]: String(columns ?? 3),
        ['--olo-grid-gap' as string]: `${gap ?? 24}px`,
      }}
    />
  ),
};

// ─── Flex / Fila ────────────────────────────────────────────────────────────
export const flexConfig: PuckLayoutConfig = {
  label: 'Flex / Fila flexible',
  fields: {
    direction: {
      type: 'select',
      label: 'Dirección',
      options: [
        { label: 'Fila (horizontal)', value: 'row' },
        { label: 'Columna (vertical)', value: 'column' },
      ],
    },
    justify: {
      type: 'select',
      label: 'Distribución horizontal',
      options: [
        { label: 'Inicio', value: 'flex-start' },
        { label: 'Centro', value: 'center' },
        { label: 'Fin', value: 'flex-end' },
        { label: 'Espacio entre', value: 'space-between' },
        { label: 'Espacio alrededor', value: 'space-around' },
      ],
    },
    align: {
      type: 'select',
      label: 'Alineación vertical',
      options: [
        { label: 'Estirar', value: 'stretch' },
        { label: 'Inicio', value: 'flex-start' },
        { label: 'Centro', value: 'center' },
        { label: 'Fin', value: 'flex-end' },
      ],
    },
    gap: {
      type: 'number',
      label: 'Separación (px)',
      min: 0,
    },
    wrap: {
      type: 'radio',
      label: 'Ajuste de línea',
      options: [
        { label: 'Sí', value: 'wrap' },
        { label: 'No', value: 'nowrap' },
      ],
    },
    items: { type: 'slot' },
  },
  defaultProps: {
    direction: 'row',
    justify: 'flex-start',
    align: 'stretch',
    gap: 16,
    wrap: 'wrap',
    items: [],
  },
  render: ({ direction, justify, align, gap, wrap, items: Items }: any) => (
    <Items
      style={{
        display: 'flex',
        flexDirection: direction ?? 'row',
        justifyContent: justify ?? 'flex-start',
        alignItems: align ?? 'stretch',
        gap: `${gap ?? 16}px`,
        flexWrap: wrap ?? 'wrap',
        width: '100%',
      }}
    />
  ),
};

// ─── Space / Separador ──────────────────────────────────────────────────────
export const spaceConfig: PuckLayoutConfig = {
  label: 'Espacio / Separador',
  fields: {
    size: {
      type: 'number',
      label: 'Altura del espacio (px)',
      min: 0,
    },
  },
  defaultProps: {
    size: 32,
  },
  render: ({ size }: any) => (
    <div aria-hidden style={{ width: '100%', height: `${size ?? 32}px` }} />
  ),
};

// ─── Registro agregado para consumir desde cada app ─────────────────────────
/** Nombres de los primitivos — usar para armar la categoría en cada puckConfig. */
export const PRIMITIVE_COMPONENT_NAMES = ['Grid', 'Flex', 'Space'] as const;

/** Mapa listo para hacer spread dentro de `components` del puckConfig de cada app. */
export const primitiveComponents: Record<string, PuckLayoutConfig> = {
  Grid: gridConfig,
  Flex: flexConfig,
  Space: spaceConfig,
};

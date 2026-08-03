/**
 * Controles de caja — espaciado y disposición para CUALQUIER bloque de Puck.
 *
 * Todo bloque del catálogo (en las dos apps) gana con esto un grupo de campos
 * «Espaciado y ancho» sin que haya que tocar el bloque: `conCaja()` envuelve su
 * `ComponentConfig`, le añade el campo y mete el render en un `<div>` con los
 * estilos resueltos. `conCajaEnTodos()` hace lo mismo de golpe para un catálogo
 * entero.
 *
 * Tres decisiones que conviene no deshacer sin querer:
 *
 * 1. **Todo cuelga de UN solo campo `object` llamado `caja`.** Si los campos
 *    fueran sueltos (`ancho`, `fondo`, `gap`…) chocarían con props que los
 *    bloques ya tienen: `TextoRico` tiene su propio `ancho` y media intranet
 *    tiene `fondo`. Agrupado no hay colisión posible, ni hoy ni con bloques
 *    futuros, y en el JSON guardado queda todo junto bajo `props.caja`.
 *
 * 2. **Sin valores puestos NO se pinta el `<div>`.** El envoltorio solo aparece
 *    cuando la caja resuelve algún estilo, así que todas las páginas ya
 *    guardadas siguen produciendo exactamente el mismo DOM que antes. Es lo que
 *    permite aplicar esto a todo el catálogo sin revisar página por página.
 *
 * 3. **Escala con nombres, no píxeles libres.** Quien edita elige «Medio», no
 *    «24px». Mantiene coherentes las secciones entre sí y encaja con el resto
 *    del editor, que evita la jerga (ver `2-convenciones-del-proyecto.md`).
 *
 * El espaciado se aplica con variables CSS sobre la clase `.olo-caja` y no con
 * estilos inline porque en móvil se reduce con una media query, y un estilo
 * inline no puede llevar media queries. La clase vive en el `globals.css` de
 * cada app.
 */

// ─── Tipos mínimos de Puck ───────────────────────────────────────────────────
/**
 * Forma mínima de un `ComponentConfig` de Puck.
 *
 * Se define localmente a propósito: así `@olo/blocks-renderer` NO depende de
 * `@puckeditor/core` (el paquete no tiene su propio node_modules con esa
 * dependencia). Cada app tipa su `puckConfig` con el `Config` real de Puck; al
 * hacer spread de estos objetos, TypeScript valida la compatibilidad.
 */
export interface ConfigDeBloque {
  label?: string;
  fields?: Record<string, any>;
  defaultProps?: Record<string, any>;
  render: (props: any) => any;
  [clave: string]: any;
}

// ─── Escala de espacio ───────────────────────────────────────────────────────
/**
 * Escala compartida por padding, margen y separación entre elementos.
 *
 * Los saltos son los del diseño ya existente (8 / 16 / 24 / 40 / 64), no una
 * progresión inventada: son los valores que ya usan las secciones escritas a
 * mano, así que un bloque maquetado con la escala queda alineado con ellas.
 */
export const ESCALA_ESPACIO = {
  ninguno: 0,
  minimo: 8,
  poco: 16,
  medio: 24,
  amplio: 40,
  maximo: 64,
} as const;

export type ClaveEspacio = keyof typeof ESCALA_ESPACIO;

/** Opciones para un `select` de Puck, en el orden de la escala. */
const OPCIONES_ESPACIO = [
  { label: 'Ninguno', value: 'ninguno' },
  { label: 'Muy poco', value: 'minimo' },
  { label: 'Poco', value: 'poco' },
  { label: 'Medio', value: 'medio' },
  { label: 'Amplio', value: 'amplio' },
  { label: 'Muy amplio', value: 'maximo' },
];

/**
 * Convierte un valor de la escala a píxeles.
 *
 * Acepta también un número porque `Grid` y `Flex` guardaban su separación en px
 * antes de que existiera la escala: un contenido antiguo con `gap: 24` debe
 * seguir midiendo 24, no caer al valor por defecto.
 */
export function pixelesDeEspacio(valor: unknown, porDefecto: ClaveEspacio = 'ninguno'): number {
  if (typeof valor === 'number' && Number.isFinite(valor)) return Math.max(0, valor);
  if (typeof valor === 'string' && valor in ESCALA_ESPACIO) {
    return ESCALA_ESPACIO[valor as ClaveEspacio];
  }
  return ESCALA_ESPACIO[porDefecto];
}

// ─── Anchos ──────────────────────────────────────────────────────────────────
/**
 * Anchos máximos ofrecidos.
 *
 * `contenido` (1200px) es el ancho de `matriz-content-container-wide`, y
 * `lectura` (720px) es el ancho cómodo para párrafos largos. Coinciden a
 * propósito con lo que ya hacen los bloques de texto.
 */
const ANCHOS: Record<string, string | null> = {
  completo: null,
  contenido: '1200px',
  medio: '960px',
  lectura: '720px',
};

// ─── Campos ──────────────────────────────────────────────────────────────────
/**
 * El grupo de campos que `conCaja` inyecta en cada bloque.
 *
 * Va como un único campo `object`, así que en el panel de la derecha se ve como
 * una sección plegable y no como seis campos sueltos mezclados con los del
 * bloque.
 */
export const campoCaja = {
  type: 'object' as const,
  label: 'Espaciado y ancho',
  objectFields: {
    interiorY: {
      type: 'select' as const,
      label: 'Espacio interior · arriba y abajo',
      options: OPCIONES_ESPACIO,
    },
    interiorX: {
      type: 'select' as const,
      label: 'Espacio interior · a los lados',
      options: OPCIONES_ESPACIO,
    },
    superior: {
      type: 'select' as const,
      label: 'Separación con el bloque de arriba',
      options: OPCIONES_ESPACIO,
    },
    inferior: {
      type: 'select' as const,
      label: 'Separación con el bloque de abajo',
      options: OPCIONES_ESPACIO,
    },
    ancho: {
      type: 'select' as const,
      label: 'Ancho máximo',
      options: [
        { label: 'Todo el ancho', value: 'completo' },
        { label: 'Ancho del contenido (1200px)', value: 'contenido' },
        { label: 'Medio (960px)', value: 'medio' },
        { label: 'Estrecho, para leer (720px)', value: 'lectura' },
      ],
    },
    alineacion: {
      type: 'radio' as const,
      label: 'Posición (si tiene ancho máximo)',
      options: [
        { label: 'Centrado', value: 'centro' },
        { label: 'Izquierda', value: 'izquierda' },
        { label: 'Derecha', value: 'derecha' },
      ],
    },
  },
};

/**
 * Valores por defecto de la caja: todo neutro.
 *
 * Un bloque recién soltado tiene que verse exactamente igual que antes de que
 * existieran estos controles; el espaciado propio de cada bloque ya lo trae su
 * CSS. Por eso `ninguno` y `completo`, no un padding «bonito» de regalo.
 */
export const cajaPorDefecto = {
  interiorY: 'ninguno',
  interiorX: 'ninguno',
  superior: 'ninguno',
  inferior: 'ninguno',
  ancho: 'completo',
  alineacion: 'centro',
};

export interface ValoresCaja {
  interiorY?: ClaveEspacio | number;
  interiorX?: ClaveEspacio | number;
  superior?: ClaveEspacio | number;
  inferior?: ClaveEspacio | number;
  ancho?: keyof typeof ANCHOS;
  alineacion?: 'centro' | 'izquierda' | 'derecha';
}

// ─── Resolución a estilos ────────────────────────────────────────────────────
export interface EstiloDeCaja {
  className: string;
  style: Record<string, string>;
  /** `false` cuando no hay nada que aplicar: entonces no se pinta el envoltorio. */
  aplica: boolean;
}

/**
 * Traduce los valores de la caja a clase + variables CSS.
 *
 * Devuelve variables y no propiedades CSS finales porque `.olo-caja` necesita
 * poder reducir el espaciado en móvil, y para eso tiene que ser la hoja de
 * estilos quien haga la cuenta.
 */
export function estiloDeCaja(caja: ValoresCaja | undefined): EstiloDeCaja {
  const valores = caja ?? {};

  const interiorY = pixelesDeEspacio(valores.interiorY);
  const interiorX = pixelesDeEspacio(valores.interiorX);
  const superior = pixelesDeEspacio(valores.superior);
  const inferior = pixelesDeEspacio(valores.inferior);
  const anchoMaximo = ANCHOS[valores.ancho ?? 'completo'] ?? null;
  const alineacion = valores.alineacion ?? 'centro';

  const style: Record<string, string> = {};
  if (interiorY) style['--olo-caja-interior-y'] = `${interiorY}px`;
  if (interiorX) style['--olo-caja-interior-x'] = `${interiorX}px`;
  if (superior) style['--olo-caja-superior'] = `${superior}px`;
  if (inferior) style['--olo-caja-inferior'] = `${inferior}px`;
  if (anchoMaximo) style['--olo-caja-ancho'] = anchoMaximo;

  // La alineación solo significa algo cuando el ancho está limitado: sin ancho
  // máximo la caja ocupa la fila entera y no hay hueco donde moverla.
  const claseAlineacion =
    anchoMaximo && alineacion !== 'centro' ? ` olo-caja--${alineacion}` : '';

  return {
    className: `olo-caja${claseAlineacion}`,
    style,
    aplica: Object.keys(style).length > 0,
  };
}

// ─── Envoltorio ──────────────────────────────────────────────────────────────
/**
 * Marca de «esta config ya pasó por conCaja».
 *
 * Sin ella, envolver dos veces el mismo bloque —cosa que pasa en cuanto una app
 * aplica `conCajaEnTodos` sobre un catálogo que ya incluye los primitivos
 * envueltos— anida dos `<div>` leyendo el MISMO valor de `caja`, y el
 * espaciado sale duplicado sin que nada lo delate en el editor.
 */
const YA_TIENE_CAJA = '__oloConCaja';

/**
 * Añade los controles de caja a un bloque de Puck.
 *
 * Conserva el resto de la config tal cual (incluidos `resolveData`, `permissions`
 * y demás claves que Puck pueda traer), así que es seguro aplicarlo sobre
 * cualquier bloque existente. Es idempotente: aplicarlo dos veces devuelve lo
 * mismo que aplicarlo una.
 */
export function conCaja<T extends ConfigDeBloque>(config: T): T {
  if (config[YA_TIENE_CAJA]) return config;

  return {
    ...config,
    [YA_TIENE_CAJA]: true,
    fields: {
      ...(config.fields ?? {}),
      caja: campoCaja,
    },
    defaultProps: {
      ...(config.defaultProps ?? {}),
      caja: cajaPorDefecto,
    },
    render: (props: any) => {
      const contenido = config.render(props);
      const { className, style, aplica } = estiloDeCaja(props?.caja);

      // Sin nada configurado se devuelve el bloque pelado: mismo DOM que antes
      // de que existieran estos controles.
      if (!aplica) return contenido;

      return (
        <div className={className} style={style}>
          {contenido}
        </div>
      );
    },
  };
}

/**
 * Aplica `conCaja` a un catálogo entero.
 *
 * `excepto` existe para los bloques a los que un envoltorio les hace daño de
 * verdad: la barra de navegación es `position: sticky`, y meterla dentro de un
 * `<div>` que mide lo mismo que ella la deja sin recorrido donde pegarse, así
 * que dejaría de seguir al scroll. Como esos bloques los coloca la plantilla y
 * no se arrastran por sección, tampoco se pierde nada quitándoles los controles.
 */
export function conCajaEnTodos<T extends Record<string, ConfigDeBloque>>(
  componentes: T,
  opciones: { excepto?: string[] } = {}
): T {
  const excepto = new Set(opciones.excepto ?? []);

  return Object.fromEntries(
    Object.entries(componentes).map(([nombre, config]) => [
      nombre,
      excepto.has(nombre) ? config : conCaja(config),
    ])
  ) as T;
}

/** Bloques que no deben llevar envoltorio en ninguna de las dos apps. */
export const BLOQUES_SIN_CAJA = [
  'IntranetTopbar',
  'IntranetFooter',
  'Header',
  'Footer',
];

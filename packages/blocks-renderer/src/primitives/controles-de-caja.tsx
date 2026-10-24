'use client';

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
 * 3. **Medida libre, en rem por defecto, sin tope.** Quien edita escribe el número
 *    que quiera y elige la unidad (a pedido del usuario el 2026-10-24; antes era una
 *    lista de seis medidas en px, y antes de esa, nombres como «Medio»). Se guarda
 *    como texto CSS («2.5rem»). rem y no px porque sigue al tamaño de letra del
 *    visitante, y el espaciado se reduce en móvil con la regla de `.olo-caja` sin
 *    que la medida se descuadre entre tamaños de pantalla.
 *
 *    Lo guardado con el formato de antes (claves como `px20` o `medio`, números,
 *    `contenido`) se sigue entendiendo y produce los mismos estilos de siempre; el
 *    editor lo enseña convertido a rem.
 *
 * El espaciado se aplica con variables CSS sobre la clase `.olo-caja` y no con
 * estilos inline porque en móvil se reduce con una media query, y un estilo
 * inline no puede llevar media queries. La clase vive en el `globals.css` de
 * cada app.
 */

import { campoColor } from './color-picker-field';
import { campoGrupoEnAcordeones, partirMedida, type CampoDeAcordeon } from './campos-en-acordeon';

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

/**
 * Forma de `campoImagen(label)`, el campo de subida de imagen que cada app
 * define localmente (llama a su propia API de subida — ver el comentario en
 * `color-picker-field.tsx` sobre por qué eso NO puede vivir en este paquete).
 *
 * Un primitivo que necesita imagen (como `Grid` con su fondo) no puede traer
 * su propio campo de imagen: recibe esta fábrica como parámetro y la usa para
 * construir su `ConfigDeBloque`, igual que ya se hace con `campoColor` pero
 * inyectado en vez de importado directamente.
 */
export type FabricaCampoImagen = (label: string) => {
  type: 'custom';
  label: string;
  render: (props: { value: string; onChange: (value: string) => void }) => any;
};

// ─── Escala de espacio ───────────────────────────────────────────────────────



/**
 * Escala compartida por padding, margen y separación entre elementos.
 *
 * Dos familias de claves. Las `pxNN` fueron las que ofreció «Espaciado y Ancho» entre
 * el 2026-10-18 y el 2026-10-24. Las de nombre (8 / 16 / 24 / 40 / 64, los saltos del
 * diseño escrito a mano) se quedan: hay páginas guardadas con ellas, y Grid, Flex y
 * Espacio las usan para su separación. Quitarlas cambiaría páginas publicadas.
 * «Espaciado y Ancho» ya no las ofrece (ahora es medida libre) pero las sigue leyendo.
 */
export const ESCALA_ESPACIO = {
  ninguno: 0,
  minimo: 8,
  poco: 16,
  medio: 24,
  amplio: 40,
  maximo: 64,
  px10: 10,
  px12: 12,
  px14: 14,
  px20: 20,
  px26: 26,
  px32: 32,
} as const;

export type ClaveEspacio = keyof typeof ESCALA_ESPACIO;

/**
 * Convierte un valor de la escala a píxeles.
 *
 * Acepta también un número porque `Grid` y `Flex` guardaban su separación en px
 * antes de que existiera la escala: un contenido antiguo con `gap: 24` debe
 * seguir midiendo 24, no caer al valor por defecto.
 */
export function pixelesDeEspacio(valor: unknown, porDefecto: ClaveEspacio = 'ninguno'): number {
  if (typeof valor === 'number' && Number.isFinite(valor)) return Math.max(0, valor);
  if (typeof valor === 'string' && Object.hasOwn(ESCALA_ESPACIO, valor)) {
    return ESCALA_ESPACIO[valor as ClaveEspacio];
  }
  return ESCALA_ESPACIO[porDefecto];
}

// ─── Anchos ──────────────────────────────────────────────────────────────────
/**
 * Anchos máximos que se guardaban antes de la medida libre.
 *
 * `contenido` (1200px) es el ancho de `matriz-content-container-wide`, y
 * `lectura` (720px) es el ancho cómodo para párrafos largos. Ya no se ofrecen,
 * pero las páginas guardadas con ellos se siguen viendo igual.
 */
const ANCHOS: Record<string, string | null> = {
  completo: null,
  contenido: '1200px',
  medio: '960px',
  lectura: '720px',
};

// ─── Medidas ─────────────────────────────────────────────────────────────────
const PX_POR_REM = 16;

/**
 * Un espaciado guardado → medida CSS lista para una variable, o `''` si no pone nada.
 *
 * Entiende la medida libre («2.5rem») y, para lo guardado antes, las claves de la
 * escala y los números (que salen en px, como siempre). Una unidad que no esté en la
 * lista blanca de `partirMedida`, o un texto cualquiera, no llega nunca a un estilo.
 * Los negativos solo valen para las separaciones: un relleno negativo no existe en CSS.
 */
function espacioComoMedida(valor: unknown, negativo = false): string {
  const medida = partirMedida(valor);
  if (medida) {
    if (medida.numero === 0 || (medida.numero < 0 && !negativo)) return '';
    return `${medida.numero}${medida.unidad}`;
  }
  const px = pixelesDeEspacio(valor);
  return px > 0 ? `${px}px` : '';
}

/** El ancho máximo guardado → medida CSS, o `''` si no limita (todo el ancho). */
function anchoComoMedida(valor: unknown): string {
  const medida = partirMedida(valor);
  if (medida) return medida.numero > 0 ? `${medida.numero}${medida.unidad}` : '';
  return (typeof valor === 'string' && Object.hasOwn(ANCHOS, valor) && ANCHOS[valor]) || '';
}

/** Una medida en px, vista en rem para el editor; las demás unidades quedan como están. */
function enRem(medida: string): string {
  const px = /^(-?[\d.]+)px$/.exec(medida);
  return px ? `${Math.round((Number(px[1]) / PX_POR_REM) * 1000) / 1000}rem` : medida;
}

// ─── Campos ──────────────────────────────────────────────────────────────────
/**
 * El grupo de campos que `conCaja` inyecta en cada bloque.
 *
 * Va como un único campo con valor objeto, así que en el panel de la derecha
 * se ve como un grupo y no como seis campos sueltos mezclados con los del
 * bloque. Cada opción es un acordeón con su valor actual a la vista
 * (`campos-en-acordeon.tsx`).
 */
const AYUDA_ESPACIO = 'Escribe el número que quieras. 1 rem ≈ 16 px. En móvil se reduce solo.';

const campoEspacio = (label: string, negativo = false): CampoDeAcordeon => ({
  type: 'medida',
  label,
  unidades: ['rem', 'em', 'vw'],
  negativo,
  vacio: 'Ninguno',
  normalizar: (valor) => enRem(espacioComoMedida(valor, negativo)),
  ayuda: negativo ? `${AYUDA_ESPACIO} Un negativo acerca los bloques.` : AYUDA_ESPACIO,
});

const CAMPOS_CAJA: Record<string, CampoDeAcordeon> = {
  interiorY: campoEspacio('Espacio interior · arriba y abajo'),
  interiorX: campoEspacio('Espacio interior · a los lados'),
  superior: campoEspacio('Separación con el bloque de arriba', true),
  inferior: campoEspacio('Separación con el bloque de abajo', true),
  ancho: {
    type: 'medida',
    label: 'Ancho máximo',
    unidades: ['rem', '%', 'vw', 'ch'],
    vacio: 'Todo el ancho',
    normalizar: (valor) => enRem(anchoComoMedida(valor)),
    ayuda: 'Lo máximo que puede medir. Vacío = todo el ancho. En pantallas angostas se ajusta solo.',
  },
  alineacion: {
    type: 'radio' as const,
    label: 'Posición',
    ayuda: 'Dónde queda el bloque dentro de su fila.',
    options: [
      { label: 'Centrado', value: 'centro' },
      { label: 'Izquierda', value: 'izquierda' },
      { label: 'Derecha', value: 'derecha' },
    ],
  },
  /**
   * El fondo pinta **la caja**, no la franja de pantalla.
   *
   * Con el ancho en «Todo el ancho» —que es lo que trae por defecto— las dos
   * cosas coinciden y el color va de borde a borde, que es el caso normal. Si
   * además se estrecha el bloque, el color se estrecha con él: sale un
   * rectángulo de color con el contenido dentro, no una franja con el
   * contenido centrado.
   *
   * Se deja así a propósito en vez de sacar el fondo a un `<div>` de fuera:
   * eso cambiaría el DOM de todas las páginas ya guardadas —justo lo que la
   * decisión 2 de la cabecera evita— y traería colapso de márgenes entre las
   * dos capas. Y como el editor enseña el resultado mientras se elige, el
   * comportamiento se ve, no hay que adivinarlo.
   */
  fondo: { type: 'color', label: 'Color de fondo', ayuda: 'Color detrás del bloque. Vacío = sin color.' },
};

export const campoCaja = campoGrupoEnAcordeones('Espaciado y Ancho', CAMPOS_CAJA);

/**
 * Valores por defecto de la caja: todo neutro.
 *
 * Un bloque recién soltado tiene que verse exactamente igual que antes de que
 * existieran estos controles; el espaciado propio de cada bloque ya lo trae su
 * CSS. Por eso medidas vacías, no un padding «bonito» de regalo.
 */
export const cajaPorDefecto = {
  interiorY: '',
  interiorX: '',
  superior: '',
  inferior: '',
  ancho: '',
  alineacion: 'centro',
  fondo: '',
};

/**
 * Medidas: texto CSS («2.5rem»), o lo que se guardaba antes (`'ninguno'`, `'px20'`,
 * `'medio'`, un número de px; `'completo'`, `'contenido'`…). Ver `espacioComoMedida`.
 */
export interface ValoresCaja {
  interiorY?: string | number;
  interiorX?: string | number;
  superior?: string | number;
  inferior?: string | number;
  ancho?: string;
  alineacion?: 'centro' | 'izquierda' | 'derecha';
  fondo?: string;
}

// ─── Resolución a estilos ────────────────────────────────────────────────────
export interface EstiloDeCaja {
  className: string;
  style: Record<string, string>;
  aplica: boolean;
}

export function estiloDeCaja(caja: ValoresCaja | undefined): EstiloDeCaja {
  const valores = caja ?? {};

  const interiorY = espacioComoMedida(valores.interiorY);
  const interiorX = espacioComoMedida(valores.interiorX);
  const superior = espacioComoMedida(valores.superior, true);
  const inferior = espacioComoMedida(valores.inferior, true);
  const anchoMaximo = anchoComoMedida(valores.ancho);
  const alineacion = valores.alineacion ?? 'centro';

  const style: Record<string, string> = {};
  if (interiorY) style['--olo-caja-interior-y'] = interiorY;
  if (interiorX) style['--olo-caja-interior-x'] = interiorX;
  if (superior) style['--olo-caja-superior'] = superior;
  if (inferior) style['--olo-caja-inferior'] = inferior;
  if (anchoMaximo) style['--olo-caja-ancho'] = anchoMaximo;

  const fondo = typeof valores.fondo === 'string' ? valores.fondo.trim() : '';
  if (fondo) style.backgroundColor = fondo;

  const claseAlineacion =
    anchoMaximo && alineacion !== 'centro' ? ` olo-caja--${alineacion}` : '';

  return {
    className: `olo-caja${claseAlineacion}`,
    style,
    aplica: Object.keys(style).length > 0,
  };
}

// ─── Envoltorio ──────────────────────────────────────────────────────────────
const YA_TIENE_CAJA = '__oloConCaja';

const { fondo: _fondo, ...camposCajaSinFondo } = CAMPOS_CAJA;
const campoCajaSinFondo = campoGrupoEnAcordeones('Espaciado y Ancho', camposCajaSinFondo);

/**
 * Con `conFondo: false` la caja pierde su «Color de fondo» (para bloques que ya
 * traen el suyo), y tampoco se pinta el que venga guardado.
 *
 * Con `anchoDentro: true` la caja suma la clase `olo-caja--ancho-dentro`: no se
 * estrecha ni se rellena ella, sino que deja el ancho máximo y el espacio interior en
 * sus variables para que el bloque los aplique por dentro. Así el fondo propio del
 * bloque va de borde a borde aunque se elija un ancho menor (ver el `globals.css`
 * de la app). Solo cambia una clase: el DOM es el mismo.
 *
 * El «Hashtag decorativo» que llevaba la caja se eliminó el 18-10-2026: si un bloque
 * guardado trae `hashtag`, queda en el JSON sin efecto.
 */
export function conCaja<T extends ConfigDeBloque>(
  config: T,
  { conFondo = true, anchoDentro = false }: { conFondo?: boolean; anchoDentro?: boolean } = {}
): T {
  if (config[YA_TIENE_CAJA]) return config;

  return {
    ...config,
    [YA_TIENE_CAJA]: true,
    fields: {
      ...(config.fields ?? {}),
      caja: conFondo ? campoCaja : campoCajaSinFondo,
    },
    defaultProps: {
      ...(config.defaultProps ?? {}),
      caja: { ...cajaPorDefecto, ...config.defaultProps?.caja },
    },
    render: (props: any) => {
      const contenido = config.render(props);
      const { className, style, aplica } = estiloDeCaja(
        conFondo ? props?.caja : { ...props?.caja, fondo: '' }
      );

      // Se envuelve solo si algún espaciado o el ancho resuelve un estilo, o si hay
      // «Color de fondo» (y el bloque lo admite): sin nada que pintar, el DOM es el de antes.
      if (!aplica) return contenido;

      return (
        <div
          id={props?.id || undefined}
          className={`${className}${anchoDentro ? ' olo-caja--ancho-dentro' : ''}`}
          style={style}
        >
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
 *
 * `sinFondo` conserva la caja pero le quita el «Color de fondo».
 * `anchoDentro` le pasa al bloque el ancho y el espacio interior (ver `conCaja`).
 */
export function conCajaEnTodos<T extends Record<string, ConfigDeBloque>>(
  componentes: T,
  opciones: { excepto?: string[]; sinFondo?: string[]; anchoDentro?: string[] } = {}
): T {
  const excepto = new Set(opciones.excepto ?? []);
  const sinFondo = new Set(opciones.sinFondo ?? []);
  const anchoDentro = new Set(opciones.anchoDentro ?? []);

  return Object.fromEntries(
    Object.entries(componentes).map(([nombre, config]) => [
      nombre,
      excepto.has(nombre)
        ? config
        : conCaja(config, { conFondo: !sinFondo.has(nombre), anchoDentro: anchoDentro.has(nombre) }),
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

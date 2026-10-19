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
 * 3. **Escala cerrada, no píxeles libres.** Quien edita elige entre seis medidas
 *    fijas (10, 12, 14, 20, 26 y 32 px, a pedido del usuario el 2026-10-18; antes
 *    eran nombres como «Medio»). Sigue siendo una lista corta y no un número
 *    libre, para que las secciones queden coherentes entre sí.
 *
 * El espaciado se aplica con variables CSS sobre la clase `.olo-caja` y no con
 * estilos inline porque en móvil se reduce con una media query, y un estilo
 * inline no puede llevar media queries. La clase vive en el `globals.css` de
 * cada app.
 */

import { campoColor } from './color-picker-field';
import { campoGrupoEnAcordeones, type CampoDeAcordeon } from './campos-en-acordeon';

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
 * Dos familias de claves. Las `pxNN` son las que ofrece «Espaciado y Ancho» desde
 * el 2026-10-18. Las de nombre (8 / 16 / 24 / 40 / 64, los saltos del diseño
 * escrito a mano) se quedan: hay páginas guardadas con ellas, y Grid, Flex y
 * Espacio las usan para su separación. Quitarlas cambiaría páginas publicadas.
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

/** Lo que ofrece «Espaciado y Ancho». «Ninguno» es el valor por defecto de la caja. */
const OPCIONES_ESPACIO = [
  { label: 'Ninguno', value: 'ninguno' },
  { label: '10 px', value: 'px10' },
  { label: '12 px', value: 'px12' },
  { label: '14 px', value: 'px14' },
  { label: '20 px', value: 'px20' },
  { label: '26 px', value: 'px26' },
  { label: '32 px', value: 'px32' },
];

/* Las de antes: no se ofrecen, pero un bloque que ya tiene una la ve con su nombre
   en vez de un desplegable que finge «Ninguno». */
const OPCIONES_ESPACIO_ANTERIORES = [
  { label: 'Muy poco · 8 px (anterior)', value: 'minimo' },
  { label: 'Poco · 16 px (anterior)', value: 'poco' },
  { label: 'Medio · 24 px (anterior)', value: 'medio' },
  { label: 'Amplio · 40 px (anterior)', value: 'amplio' },
  { label: 'Muy amplio · 64 px (anterior)', value: 'maximo' },
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
 * Va como un único campo con valor objeto, así que en el panel de la derecha
 * se ve como un grupo y no como seis campos sueltos mezclados con los del
 * bloque. Cada opción es un acordeón con su valor actual a la vista
 * (`campos-en-acordeon.tsx`).
 */
const CAMPOS_CAJA: Record<string, CampoDeAcordeon> = {
  interiorY: {
    type: 'select' as const,
    label: 'Espacio interior · arriba y abajo',
    options: OPCIONES_ESPACIO,
    anteriores: OPCIONES_ESPACIO_ANTERIORES,
  },
  interiorX: {
    type: 'select' as const,
    label: 'Espacio interior · a los lados',
    options: OPCIONES_ESPACIO,
    anteriores: OPCIONES_ESPACIO_ANTERIORES,
  },
  superior: {
    type: 'select' as const,
    label: 'Separación con el bloque de arriba',
    options: OPCIONES_ESPACIO,
    anteriores: OPCIONES_ESPACIO_ANTERIORES,
  },
  inferior: {
    type: 'select' as const,
    label: 'Separación con el bloque de abajo',
    options: OPCIONES_ESPACIO,
    anteriores: OPCIONES_ESPACIO_ANTERIORES,
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
    label: 'Posición',
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
  fondo: { type: 'color', label: 'Color de fondo' },
};

export const campoCaja = campoGrupoEnAcordeones('Espaciado y Ancho', CAMPOS_CAJA);

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
  fondo: '',
};

export interface ValoresCaja {
  interiorY?: ClaveEspacio | number;
  interiorX?: ClaveEspacio | number;
  superior?: ClaveEspacio | number;
  inferior?: ClaveEspacio | number;
  ancho?: keyof typeof ANCHOS;
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
 * El «Hashtag decorativo» que llevaba la caja se eliminó el 18-10-2026: si un bloque
 * guardado trae `hashtag`, queda en el JSON sin efecto.
 */
export function conCaja<T extends ConfigDeBloque>(
  config: T,
  { conFondo = true }: { conFondo?: boolean } = {}
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
      const { className, style } = estiloDeCaja(
        conFondo ? props?.caja : { ...props?.caja, fondo: '' }
      );

      const aplica =
        props?.caja &&
        Object.keys(props.caja).some(
          (k) =>
            !['fondo', 'alineacion'].includes(k) &&
            (props.caja as any)[k] !== 'ninguno' &&
            (props.caja as any)[k] !== 'completo'
        );

      if (!aplica) return contenido;

      return (
        <div id={props?.id || undefined} className={className || undefined} style={style}>
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
 */
export function conCajaEnTodos<T extends Record<string, ConfigDeBloque>>(
  componentes: T,
  opciones: { excepto?: string[]; sinFondo?: string[] } = {}
): T {
  const excepto = new Set(opciones.excepto ?? []);
  const sinFondo = new Set(opciones.sinFondo ?? []);

  return Object.fromEntries(
    Object.entries(componentes).map(([nombre, config]) => [
      nombre,
      excepto.has(nombre)
        ? config
        : conCaja(config, { conFondo: !sinFondo.has(nombre) }),
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

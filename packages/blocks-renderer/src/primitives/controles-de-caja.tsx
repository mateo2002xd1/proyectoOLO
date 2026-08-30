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

import { campoColor } from './color-picker-field';
import { campoIcono } from './icon-selector-field';

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
  label: 'Espaciado y Ancho',
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
    fondo: campoColor('Color de fondo'),
  },
};

export const campoHashtag = {
  type: 'object' as const,
  label: 'Hashtag decorativo',
  objectFields: {
    habilitar: {
      type: 'radio',
      label: 'Mostrar hashtag',
      options: [
        { label: 'Sí', value: 'si' },
        { label: 'No', value: 'no' },
      ],
    },
    texto: { type: 'richtext', label: 'Texto' },
    tamano: {
      type: 'select',
      label: 'Tamaño del texto',
      options: [
        { label: 'Pequeño (14px)', value: '0.875rem' },
        { label: 'Normal (16px)', value: '1rem' },
        { label: 'Mediano (20px)', value: '1.25rem' },
        { label: 'Grande (24px)', value: '1.5rem' },
        { label: 'Extra Grande (32px)', value: '2rem' },
        { label: 'Gigante (48px)', value: '3rem' },
      ],
    },
    tamanoIcono: {
      type: 'select',
      label: 'Tamaño del icono',
      options: [
        { label: 'Pequeño (24px)', value: '1.5rem' },
        { label: 'Normal (32px)', value: '2rem' },
        { label: 'Mediano (40px)', value: '2.5rem' },
        { label: 'Grande (48px)', value: '3rem' },
        { label: 'Extra Grande (64px)', value: '4rem' },
        { label: 'Gigante (96px)', value: '6rem' },
      ],
    },
    color: campoColor('Color del texto'),
    alineacion: {
      type: 'radio' as const,
      label: 'Alineación horizontal',
      options: [
        { label: 'Izquierda', value: 'flex-start' },
        { label: 'Centro', value: 'center' },
        { label: 'Derecha', value: 'flex-end' },
      ],
    },
    posicionY: {
      type: 'radio' as const,
      label: 'Posición vertical',
      options: [
        { label: 'Arriba', value: 'arriba' },
        { label: 'Abajo', value: 'abajo' },
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
  fondo: '',
};

export const hashtagPorDefecto = {
  habilitar: 'no',
  texto: '',
  tamano: '2rem',
  tamanoIcono: '4rem',
  color: '#333333',
  alineacion: 'center',
  posicionY: 'arriba',
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

export interface ValoresHashtag {
  habilitar?: 'si' | 'no';
  texto?: any;
  tamano?: string;
  tamanoIcono?: string;
  color?: string;
  alineacion?: 'flex-start' | 'center' | 'flex-end';
  posicionY?: 'arriba' | 'abajo';
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

export function conCaja<T extends ConfigDeBloque>(config: T): T {
  if (config[YA_TIENE_CAJA]) return config;

  return {
    ...config,
    [YA_TIENE_CAJA]: true,
    fields: {
      ...(config.fields ?? {}),
      caja: campoCaja,
      hashtag: campoHashtag,
    },
    defaultProps: {
      ...(config.defaultProps ?? {}),
      caja: { ...cajaPorDefecto, ...config.defaultProps?.caja },
      hashtag: { ...hashtagPorDefecto, ...config.defaultProps?.hashtag },
    },
    render: (props: any) => {
      const contenido = config.render(props);
      const { className, style } = estiloDeCaja(props?.caja);

      const aplica =
        props?.caja &&
        Object.keys(props.caja).some(
          (k) =>
            !['fondo', 'alineacion'].includes(k) &&
            (props.caja as any)[k] !== 'ninguno' &&
            (props.caja as any)[k] !== 'completo'
        );

      const habilitarHashtag = props?.hashtag?.habilitar === 'si';
      const textoHashtag = props?.hashtag?.texto;
      const colorHashtag = props?.hashtag?.color || '#333333';
      const tamanoHashtag = props?.hashtag?.tamano || '2rem';
      const tamanoIcono = props?.hashtag?.tamanoIcono || '4rem';
      const alineacionHashtag = props?.hashtag?.alineacion || 'center';
      const posicionY = props?.hashtag?.posicionY || 'arriba';

      const tieneHashtag = habilitarHashtag && !!textoHashtag;

      if (!aplica && !tieneHashtag) return contenido;

      const nodoHashtag = tieneHashtag ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: alineacionHashtag, 
          width: '100%', 
          padding: '24px', // Añade respiro general
          marginBottom: posicionY === 'arriba' ? '16px' : '0', 
          marginTop: posicionY === 'abajo' ? '16px' : '0' 
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.3em',
            fontSize: tamanoHashtag, 
            color: colorHashtag, 
            textAlign: alineacionHashtag === 'center' ? 'center' : alineacionHashtag === 'flex-start' ? 'left' : 'right', 
            lineHeight: 1.1 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <svg 
                width={tamanoIcono}
                height={tamanoIcono}
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_913_6185)">
                  <path d="M23 7.00015H18.191L18.991 1.13515C19.0087 1.00501 19.0007 0.872656 18.9672 0.745638C18.9338 0.61862 18.8757 0.499428 18.7962 0.39487C18.7167 0.290311 18.6174 0.202432 18.504 0.136251C18.3905 0.0700693 18.2651 0.0268815 18.135 0.00915302C18.0049 -0.00857543 17.8725 -0.000497315 17.7455 0.0329261C17.6185 0.0663496 17.4993 0.124464 17.3947 0.203951C17.2902 0.283438 17.2023 0.382741 17.1361 0.49619C17.0699 0.609639 17.0267 0.735013 17.009 0.865153L16.173 7.00015H9.191L9.991 1.13515C10.0087 1.00501 10.0007 0.872656 9.96723 0.745638C9.9338 0.61862 9.87569 0.499428 9.7962 0.39487C9.71672 0.290311 9.61741 0.202432 9.50396 0.136251C9.39051 0.0700693 9.26514 0.0268815 9.135 0.00915305C9.00486 -0.00857541 8.8725 -0.000497289 8.74548 0.0329262C8.61847 0.0663496 8.49928 0.124464 8.39472 0.203951C8.29016 0.283438 8.20228 0.382741 8.1361 0.49619C8.06992 0.609639 8.02673 0.735013 8.009 0.865153L7.173 7.00015H2C1.73478 7.00015 1.48043 7.10551 1.29289 7.29305C1.10536 7.48058 1 7.73494 1 8.00015C1 8.26537 1.10536 8.51972 1.29289 8.70726C1.48043 8.8948 1.73478 9.00015 2 9.00015H6.9L6.082 15.0002H1C0.734784 15.0002 0.48043 15.1055 0.292893 15.293C0.105357 15.4806 0 15.7349 0 16.0002C0 16.2654 0.105357 16.5197 0.292893 16.7073C0.48043 16.8948 0.734784 17.0002 1 17.0002H5.809L5.009 22.8652C4.9732 23.128 5.04327 23.3943 5.2038 23.6054C5.36433 23.8166 5.60217 23.9553 5.865 23.9912C6.12783 24.027 6.39412 23.9569 6.60528 23.7964C6.81645 23.6358 6.9552 23.398 6.991 23.1352L7.827 17.0002H14.809L14.009 22.8652C13.9732 23.128 14.0433 23.3943 14.2038 23.6054C14.3643 23.8166 14.6022 23.9553 14.865 23.9912C15.1278 24.027 15.3941 23.9569 15.6053 23.7964C15.8165 23.6358 15.9552 23.398 15.991 23.1352L16.827 17.0002H22C22.2652 17.0002 22.5196 16.8948 22.7071 16.7073C22.8946 16.5197 23 16.2654 23 16.0002C23 15.7349 22.8946 15.4806 22.7071 15.293C22.5196 15.1055 22.2652 15.0002 22 15.0002H17.1L17.918 9.00015H23C23.2652 9.00015 23.5196 8.8948 23.7071 8.70726C23.8946 8.51972 24 8.26537 24 8.00015C24 7.73494 23.8946 7.48058 23.7071 7.29305C23.5196 7.10551 23.2652 7.00015 23 7.00015ZM15.082 15.0002H8.1L8.918 9.00015H15.9L15.082 15.0002Z" fill="#1dbaf6"/>
                </g>
                <defs>
                  <clipPath id="clip0_913_6185">
                    <rect width="24" height="24" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </div>
            <div>
              {textoHashtag}
            </div>
          </div>
        </div>
      ) : null;

      return (
        <div className={className || undefined} style={style}>
          {posicionY === 'arriba' && nodoHashtag}
          {contenido}
          {posicionY === 'abajo' && nodoHashtag}
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

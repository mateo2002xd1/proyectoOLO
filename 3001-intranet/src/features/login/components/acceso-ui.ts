/**
 * Clases de las pantallas de acceso de la intranet: login, recuperación y primer ingreso.
 *
 * **Sin tarjeta blanca, en todos los anchos.** El formulario va directo sobre el azul, con el
 * texto en blanco y los campos transparentes; los mensajes de cada paso, encima en el móvil
 * y en la columna izquierda desde `xl`. Lo pidió el usuario el 2026-10-11 («encima los
 * mensajes del flujo sin card blanco», «quita el color del card que es blanco»). Hasta
 * entonces, desde `xl` había una tarjeta blanca con el texto oscuro.
 *
 * **Medidas de letra**, las del acceso al panel del sitio web (`3000-sitio-web/.../auth/
 * components/auth-ui.tsx` y `marco-de-pasos.tsx`), también del 2026-10-11. Los colores y el
 * azul siguen siendo los de la intranet: cada frontend lleva su identidad (`2-convenciones`
 * §10.5). Poppins la pone `app/(auth)/template.tsx`.
 *
 * | Qué | Tamaño |
 * |---|---|
 * | Título del paso (`h1`) | 20-24 px en el móvil, 30 desde `md`, Semibold |
 * | Texto bajo el título | 14-16 px en el móvil, 18 desde `md` |
 * | Etiquetas, enlaces | 14 px en el móvil, 16 desde `md` |
 * | Campos y botones | 16 px, 44 de alto |
 * | Errores y avisos | 14 px |
 *
 * Por debajo de `md` las medidas y los huecos se encogen con el alto (`dvh`), como en el
 * sitio: en el móvil cada paso tiene que caber sin scroll (2026-10-10).
 *
 * Contraste sobre el azul `#001A39`: marcador (blanco al 65 %) 7.8:1, borde (blanco al 50 %)
 * 5.1:1, ojo (al 80 %) 11.3:1. Pasan 4.5 y 3 (WCAG 1.4.3 y 1.4.11).
 */

/**
 * El formulario. Las medidas son las de la tarjeta del sitio (`authPasosCardClass`): 330 px en
 * el móvil, 452 desde `md` con esquinas de 32 y relleno de 32 × 40. Sin fondo blanco: desde
 * `md` solo un borde blanco tenue, para que conserve su forma y su aire sobre el azul.
 */
export const accesoTarjetaClass =
  'w-full max-w-[330px] md:max-w-[452px] md:rounded-[32px] md:border md:border-white/20 md:px-8 md:py-10';

/**
 * Aire entre los bloques del formulario (campo y campo, aviso y campo, puntos y botón): de 12
 * a 24 px según el alto en el móvil, 24 desde `md`. Son `authPasosHuecoClass` y
 * `authPasosHuecoArribaClass` del sitio: usar estas y no `mb-6`/`mt-4` sueltos.
 */
export const accesoHuecoClass = 'mb-[clamp(0.75rem,2.2dvh,1.5rem)] md:mb-6';
/** El mismo hueco, por arriba: el enlace discreto bajo el botón. */
export const accesoHuecoArribaClass = 'mt-[clamp(0.5rem,2.2dvh,1.5rem)] md:mt-6';

/** «Regresar al sitio web del Observatorio», con las medidas de `BackToSiteLink` del sitio. */
export const accesoRegresoClass =
  'inline-flex items-center rounded py-1.5 text-sm text-white/90 transition hover:-translate-y-px hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:py-2.5 md:text-base';

/** Título del paso, en blanco: arriba en el móvil, a la izquierda desde `xl`. */
export const accesoTituloMarcoClass =
  'text-[clamp(1.25rem,3.6dvh,1.5rem)] font-semibold leading-tight text-balance text-white md:text-3xl';

/** Texto bajo ese título. */
export const accesoTextoMarcoClass =
  'mt-[clamp(0.5rem,2dvh,1rem)] space-y-2 text-[clamp(0.875rem,2.35dvh,1rem)] leading-[1.45] text-pretty text-white/85 md:mt-6 md:space-y-6 md:text-lg md:leading-7 xl:mt-8';

/** Etiqueta de un campo. */
export const accesoEtiquetaClass = 'mb-1 block text-sm font-medium text-white md:mb-2 md:text-base';

/**
 * Campo de una línea, transparente y en píldora, como en el sitio (esquinas de 32 px; el
 * desplegable de preguntas pasa `rounded-[16px]`, como allí). Va como parámetro y no como
 * clase añadida después: dos clases de radio en el mismo elemento las resuelve el orden del
 * CSS, no el del atributo. El autorrelleno de Chrome pinta su propio fondo claro
 * encima de cualquier `background`: se tapa con una sombra interior del color del fondo, que
 * es la única forma de cambiarlo.
 */
export const accesoCampoClass = (conError: boolean, extra = '', esquinas = 'rounded-[32px]') =>
  [
    `h-11 w-full ${esquinas} border bg-transparent px-5 text-base text-white placeholder:text-white/65`,
    'autofill:shadow-[inset_0_0_0_1000px_#001A39] autofill:[-webkit-text-fill-color:#fff]',
    'transition-colors focus:outline-none focus:ring-2',
    conError
      ? 'border-red-300 focus:border-red-300 focus:ring-red-300'
      : 'border-white/50 focus:border-white focus:ring-white',
    extra,
  ].join(' ');

/**
 * Las opciones de un `<select>` heredan el color del campo, y la lista que abre el navegador
 * es blanca: con el texto blanco no se leían. Van siempre en oscuro.
 */
export const accesoOpcionesClass = '[&_option]:text-gray-900';

/** Icono dentro de un campo (el ojo de la contraseña, la flecha del desplegable). */
export const accesoIconoCampoClass = 'text-white/80 hover:text-white';

/** Error bajo un campo. */
export const accesoErrorClass = 'mt-1.5 text-sm text-red-300';

/** Banda roja para el error que no es de un campo: clara, se lee sobre el azul. */
export const accesoErrorGeneralClass =
  'mb-[clamp(0.75rem,2.2dvh,1.5rem)] rounded-[16px] border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-600 md:mb-6';

/** Rótulo pequeño en mayúsculas («PREGUNTA 1 DE 3»). */
export const accesoRotuloClass = 'block text-xs font-semibold uppercase tracking-wide text-white/70';

/** Botón principal: blanco y en píldora, como «Ingresar» (esquinas de 32, como en el sitio). */
export const accesoBotonClass =
  'inline-flex h-11 w-full items-center justify-center rounded-[32px] bg-white px-6 text-base font-medium text-[#0d1526] shadow-[0_2px_8px_-2px_rgba(13,21,38,0.4)] transition hover:bg-gray-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#001A39] disabled:cursor-not-allowed disabled:opacity-50';

/** Enlace discreto bajo el botón («Volver a iniciar sesión», «Cancelar»): solo texto. */
export const accesoEnlaceClass =
  'rounded px-1 py-1 text-sm text-white/90 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:text-base';

/** Texto secundario dentro del formulario (la pista del aviso de éxito). */
export const accesoTextoSecundarioClass = 'text-sm text-white/75';

/** Botón secundario («Atrás» entre preguntas): borde blanco, sin fondo, en píldora. */
export const accesoBotonSecundarioClass =
  'inline-flex h-11 items-center justify-center rounded-[32px] border border-white/50 bg-transparent px-6 text-base font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white';

/** Encabezado dentro del formulario («Preguntas de seguridad»): 18/20 px, Medium. */
export const accesoEncabezadoClass = 'text-lg font-medium text-white md:text-xl';

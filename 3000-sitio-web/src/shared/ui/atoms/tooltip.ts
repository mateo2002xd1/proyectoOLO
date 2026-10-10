/**
 * Tooltip encima de un botón, con la forma de los del botón de edición
 * (`.fab-speed-dial__tooltip`): esquinas de 6 px, 12 px en negrita, sombra y una
 * entrada corta hacia arriba. Lo usan la cola de revisión y el ojo de Auditoría.
 *
 * El botón lleva `GRUPO_TOOLTIP` y dentro un `<span aria-hidden="true">` con
 * `TOOLTIP_ENCIMA` más su fondo y su letra. Si es la etiqueta de una acción, el color sale
 * de `COLOR_DE_ACCION` (`shared/lib/identidad-panel`), que se cambia en Configuración. `aria-hidden` porque el nombre ya lo da el
 * botón (`aria-label` o un `sr-only`); sin eso el lector lo leería dos veces. Aparece al
 * pasar el puntero y al llegar con el teclado (`focus-visible`). Si el grupo es un
 * envoltorio y el foco lo recibe algo de dentro (el `Switch` de Usuarios, que no acepta
 * `className`), también aparece: `group-has-[:focus-visible]`.
 *
 * Son cadenas enteras a propósito: Tailwind solo genera las clases que encuentra
 * escritas tal cual en el código.
 *
 * `whitespace-nowrap!` (importante) y no `whitespace-nowrap`: con la tabla en tarjetas,
 * `.olo-tabla-apilable … td :where(*)` pone `white-space: normal` y la celda
 * `overflow-wrap: anywhere`, fuera de las capas de Tailwind, así que ganaban. El
 * tooltip, `absolute` dentro de un botón angosto, se encogía al ancho del botón y se
 * partía letra por letra. Un `!important` dentro de una capa sí gana.
 */
export const GRUPO_TOOLTIP = 'group/tooltip relative';

const TOOLTIP =
  'pointer-events-none absolute bottom-full z-10 mb-2 translate-y-1 whitespace-nowrap! rounded-md px-2.5 py-1 text-xs font-semibold opacity-0 shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition duration-150 group-hover/tooltip:translate-y-0 group-hover/tooltip:opacity-100 group-focus-visible/tooltip:translate-y-0 group-focus-visible/tooltip:opacity-100 group-has-[:focus-visible]/tooltip:translate-y-0 group-has-[:focus-visible]/tooltip:opacity-100 motion-reduce:transition-none';

/** Centrado sobre el botón. */
export const TOOLTIP_ENCIMA = `${TOOLTIP} left-1/2 -translate-x-1/2`;

/**
 * Alineado al borde derecho del botón, para el que está en la última columna de una
 * tabla con `overflow-x-auto`: centrado sobresale por la derecha y, aunque esté
 * invisible (`opacity-0`), ocupa sitio y le da a la tabla una barra horizontal.
 */
export const TOOLTIP_ENCIMA_A_LA_DERECHA = `${TOOLTIP} right-0`;

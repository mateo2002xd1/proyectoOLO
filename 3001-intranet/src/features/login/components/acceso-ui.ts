/**
 * Medidas de letra de las pantallas de acceso de la intranet: login, recuperación y primer
 * ingreso.
 *
 * Son las del acceso al panel del sitio web (`3000-sitio-web/.../auth/components/auth-ui.tsx`
 * y `marco-de-pasos.tsx`), que el usuario pidió iguales en las dos apps el 2026-10-11. Los
 * colores, las esquinas y el fondo azul siguen siendo los de la intranet: cada frontend lleva
 * su identidad (`2-convenciones` §10.5). Poppins la pone `app/(auth)/template.tsx`.
 *
 * | Qué | Tamaño |
 * |---|---|
 * | Título del panel izquierdo (`h1`, desde `xl`) | 30 px, Semibold |
 * | Texto bajo ese título | 18 px, Regular |
 * | Encabezado de la tarjeta (`h2`) | 18 px en el móvil, 20 desde `md`, Medium |
 * | Texto bajo el encabezado de la tarjeta | 14-16 px en el móvil, 18 desde `md` |
 * | Etiquetas, enlaces | 14 px en el móvil, 16 desde `md` |
 * | Campos y botones | 16 px, 44 de alto |
 * | Errores y avisos | 14 px |
 *
 * Por debajo de `md` las medidas se encogen como en el sitio: en el móvil todo tiene que
 * caber en el alto de la pantalla sin scroll (2026-10-10).
 */

/** La tarjeta blanca de cada paso. */
export const accesoTarjetaClass =
  'w-full max-w-[380px] rounded-[24px] bg-white px-6 py-[clamp(1.25rem,3.5dvh,2rem)] shadow-[0_25px_60px_rgba(0,0,0,0.35)] sm:px-9 sm:py-10 md:max-w-[452px]';

/** Título del paso a la izquierda, desde `xl` (en blanco sobre el azul). */
export const accesoTituloMarcoClass = 'text-3xl font-semibold leading-tight text-balance text-white';

/** Texto bajo ese título. */
export const accesoTextoMarcoClass = 'mt-8 space-y-6 text-lg leading-7 text-pretty text-white/90';

/** Encabezado dentro de la tarjeta, por debajo de `xl` («¿Olvidaste tu contraseña?»). */
export const accesoEncabezadoClass = 'text-lg font-medium leading-snug text-[#0d1526] md:text-xl';

/** Texto bajo el encabezado de la tarjeta. */
export const accesoDescripcionClass =
  'mt-1.5 text-[clamp(0.875rem,2.35dvh,1rem)] leading-[1.45] text-gray-500 md:text-lg md:leading-7';

/** Etiqueta de un campo. */
export const accesoEtiquetaClass = 'mb-1 block text-sm font-medium text-[#0d1526] md:mb-2 md:text-base';

/** Campo de una línea. El rojo, si `conError`. */
export const accesoCampoClass = (conError: boolean) =>
  [
    'h-11 w-full rounded-lg border bg-white px-4 text-base text-gray-900 placeholder:text-gray-400',
    'transition-colors focus:outline-none focus:ring-2',
    conError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-[#0d1526] focus:ring-[#0d1526]',
  ].join(' ');

/** Error bajo un campo. */
export const accesoErrorClass = 'mt-1.5 text-sm text-red-600';

/** Banda roja para el error que no es de un campo. */
export const accesoErrorGeneralClass =
  'mb-4 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2.5 text-sm text-red-600';

/** Botón principal de la tarjeta. */
export const accesoBotonClass =
  'inline-flex h-11 w-full items-center justify-center rounded-[16px] bg-[#0d1526] px-6 text-base font-medium text-white shadow-[0_2px_8px_-2px_rgba(13,21,38,0.4)] transition hover:bg-[#1a2340] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0d1526] disabled:cursor-not-allowed disabled:opacity-50';

/** Enlace discreto bajo el botón («Volver a iniciar sesión», «Cancelar»): solo texto. */
export const accesoEnlaceClass =
  'rounded px-1 py-1 text-sm text-[#0d1526] underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d1526] md:text-base';

'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { HomeIcon } from '@heroicons/react/20/solid';
import { IconoMascara } from '@/shared/ui/atoms/icono-mascara';
import { LONGITUD_MINIMA, requisitosDe } from '@olo/password-policy';

/**
 * Primitivas de las pantallas de acceso del panel: login, primer ingreso y recuperación
 * de contraseña. El marco de todas es `MarcoDePasos` (`marco-de-pasos.tsx`).
 *
 * ## Un solo juego de medidas (simetría, 2026-10-09)
 *
 * Los mockups llegaron pantalla por pantalla y cada uno traía las suyas: en el de móvil el
 * campo medía 330 px en el login, 320 en la recuperación y 283 en las preguntas, y el botón
 * de la confirmación, 272. El usuario pidió simetría entre todas las rutas, así que aquí
 * está el único juego, y todas lo usan:
 *
 *   · campos, la caja de la pregunta y botones: 44 px de alto (el mínimo táctil de
 *     `2-convenciones` §10.4) y a todo el ancho del formulario. Campos y botones con esquinas
 *     de 32 px; lo que muestra una pregunta de seguridad (la caja de la recuperación y el
 *     desplegable del primer ingreso), de 16, como los mensajes de estado, porque si la
 *     pregunta es larga ocupa dos líneas;
 *   · el formulario: en el móvil, sin tarjeta y 330 px como máximo, como en el mockup de
 *     móvil; desde `md`, tarjeta de 452 px con borde y las mismas esquinas de 32 px;
 *   · las letras, de la escala tipográfica del usuario: etiquetas, campos, botones y
 *     enlaces a 16 px («Body»); errores y avisos a 14 («Footnote»).
 *
 * Hasta ese día convivían dos pieles, elegidas con un contexto: la de siempre (`tarjeta`,
 * que al final solo usaba el login) y la del diseño nuevo (`pasos`). Con el login en el
 * diseño nuevo, la vieja y su marco (`AuthSplitShell`) se quitaron. Las clases conservan
 * el prefijo `authPasos`.
 *
 * No hay variantes `dark:` salvo en `PasswordRequisitos`, que también usa el perfil dentro
 * del panel: estas pantallas pintan su propio fondo, y con el tema oscuro del sistema
 * operativo un campo oscuro quedaba sobre la tarjeta blanca.
 */

/* ---------- Clases ---------- *
 * Colores medidos en los mockups: texto `#001631`, etiquetas y campos `#001a39`, borde
 * `#d9d9d9`, marcador `#b3b3b3`, botón y barras `#001631`, ojo `#334861`. */

/**
 * El formulario de cada pantalla. Por debajo de `md` no es tarjeta: va directo sobre el
 * fondo blanco, como en el mockup de móvil. Desde `md`, tarjeta con borde; en el
 * escritorio queda sobre el azul de la mitad derecha.
 */
export const authPasosCardClass =
  'w-full max-w-[330px] bg-white md:max-w-[452px] md:rounded-[32px] md:border md:border-[#d9d9d9] md:px-8 md:py-10';

export const authPasosPrimaryClass =
  'inline-flex h-11 w-full items-center justify-center rounded-[32px] bg-[#001631] px-6 text-base font-medium text-[#f5f5f5] transition-colors hover:bg-[#0d2c4f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001631] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

export const authPasosSecondaryClass =
  'inline-flex h-11 items-center justify-center rounded-[32px] border border-[#d9d9d9] bg-white px-6 text-base font-medium text-[#001a39] transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001631] focus-visible:ring-offset-2';

/** El enlace discreto bajo el botón («Iniciar sesión», «¿Olvidaste tu contraseña?»). */
export const authPasosQuietLinkClass =
  'rounded px-1 py-1 text-sm text-[#001631] md:text-base underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001631]';

/**
 * Aire entre los bloques del formulario (campo y campo, aviso y campo, barras y botón).
 *
 * En el móvil todo tiene que caber en el alto de la pantalla sin scroll (pedido del usuario,
 * 2026-10-10): el hueco se encoge con el alto visible, de 12 px a 24, y en un teléfono de
 * 640 px queda en 14. Desde `md`, los 24 de siempre. Usar estas dos y no `mb-6`/`mt-6`
 * sueltos: son las que hacen que las pantallas quepan y sigan siendo iguales entre sí.
 */
export const authPasosHuecoClass = 'mb-[clamp(0.75rem,2.2dvh,1.5rem)] md:mb-6';
/** El mismo hueco, por arriba: el enlace discreto bajo el botón. */
export const authPasosHuecoArribaClass = 'mt-[clamp(0.5rem,2.2dvh,1.5rem)] md:mt-6';

// 16 px en peso medio desde `md`; en el móvil, 14 y más pegada al campo, para que el
// formulario quepa sin scroll. Con Poppins, «Ingresa nuevamente la contraseña» mide unos
// 290 px a 16 px, y el formulario tiene 328 en un móvil de 360 (sin tarjeta, ver arriba) y
// 388 por dentro de la tarjeta: cabe en una línea en todos los anchos.
const authPasosLabelClass = 'mb-1 block text-sm font-medium text-[#001a39] md:mb-2 md:text-base';

/**
 * Encabezado dentro del formulario («Crea tu nueva contraseña», «Responde tus
 * preguntas»): 20 px en peso medio («Headline»), entre el título de la pantalla y las
 * etiquetas. Va en un `h2`: el `h1` es el título del marco.
 */
export const authPasosCardHeadingClass = 'text-lg font-medium text-[#001631] md:text-xl';

/**
 * Exportada para el campo que no cabe en los de abajo (la respuesta a la pregunta).
 * `esquinas`: las de píldora por defecto; el desplegable de preguntas pasa `rounded-xl` (16 px
 * en este sitio). Va como parámetro y no como clase añadida después: dos clases de radio en el
 * mismo elemento las resuelve el orden del CSS, no el del atributo.
 */
export const authPasosInputClass = (hasError: boolean, esquinas = 'rounded-[32px]') =>
  [
    // `py-2`: el `select` de Chrome pinta el texto arriba de su caja, no centrado.
    `h-11 w-full ${esquinas} border bg-white px-5 py-2 text-base text-[#001a39] placeholder:text-[#b3b3b3]`,
    'transition-colors focus:outline-none focus:ring-2',
    hasError
      ? 'border-red-500 focus:border-red-600 focus:ring-red-600'
      : 'border-[#d9d9d9] focus:border-[#001631] focus:ring-[#001631]',
  ].join(' ');

export const authPasosErrorTextClass = 'mt-1.5 text-sm text-red-600';

/* ---------- Avisos ---------- *
 * Los mensajes de estado llevan esquinas de 16 px, no las de 32 de campos y botones, para
 * que no se confundan con ellos (pedido del usuario, 2026-10-09). `rounded-xl` es 16 en este
 * sitio: globals.css redefine la escala de radios (en Tailwind sería 12), y `rounded-2xl`
 * es 24, que en una banda se veía igual que un botón. */

/** Banda roja para errores que no pertenecen a un campo concreto. */
export function AuthGeneralError({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${authPasosHuecoClass} rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600`}
      role="alert"
    >
      {children}
    </div>
  );
}

/**
 * Aviso informativo sobre el formulario de acceso.
 *
 * Existe aparte de `AuthGeneralError` porque no todo lo que hay que contar en el login
 * es un fallo. Cerrar la sesión tras quince minutos parado es el sistema haciendo su
 * trabajo, y pintarlo en rojo —junto a «Correo o contraseña incorrectos», que es lo
 * otro que aparece en este hueco— hace creer que uno se equivocó en algo.
 *
 * `role="status"` y no `"alert"`: se anuncia sin interrumpir lo que el lector de
 * pantalla esté diciendo, que es lo apropiado para algo que solo informa.
 */
export function AuthGeneralNotice({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${authPasosHuecoClass} rounded-xl border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-800`}
      role="status"
    >
      {children}
    </div>
  );
}

/**
 * Avance dentro de un cuestionario de varios pasos: las barras del mockup (32 × 6 px), la
 * actual en `#001631` y el resto en `#ccd3d7`.
 *
 * Decorativo a propósito (`aria-hidden`): la posición se anuncia en texto —
 * «Pregunta 2 de 3»— junto al campo, que es lo que de verdad sirve a quien no ve
 * las barras.
 */
export function AuthProgressDots({
  total,
  current,
  className = 'mb-5',
  variante = 'barras',
}: {
  total: number;
  current: number;
  className?: string;
  /**
   * `puntos`: la actual, una píldora; las ya respondidas, puntos medio atenuados; las que
   * faltan, puntos claros. Es el diseño de «Verifica tu identidad» de la intranet, que el
   * usuario pidió también aquí para la recuperación (2026-10-11). `barras`, el de siempre.
   */
  variante?: 'barras' | 'puntos';
}) {
  return (
    <div className={`flex justify-center ${variante === 'puntos' ? 'gap-1.5' : 'gap-2'} ${className}`} aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => {
        const clase =
          variante === 'puntos'
            ? i === current
              ? 'w-6 bg-[#001631]'
              : i < current
                ? 'w-1.5 bg-[#001631]/45'
                : 'w-1.5 bg-[#ccd3d7]'
            : `w-8 ${i === current ? 'bg-[#001631]' : 'bg-[#ccd3d7]'}`;
        return <span key={i} className={`h-1.5 rounded-full transition-all ${clase}`} />;
      })}
    </div>
  );
}

/* Hasta el 2026-10-11 aquí estaba `AuthSuccessBadge`, el check blanco sobre un círculo
   #001631 de las pantallas de cierre. Lo quitó el usuario, como en la intranet. */

/* ---------- Campos ---------- */

/** Campo de texto con etiqueta y error, la forma que tienen todos los de aquí. */
export function AuthTextField({
  id,
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  autoComplete,
  autoCapitalize,
  autoCorrect,
  className = authPasosHuecoClass,
}: {
  id: string;
  label: ReactNode;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: 'text' | 'email';
  placeholder?: string;
  autoComplete?: string;
  autoCapitalize?: 'none' | 'sentences';
  autoCorrect?: 'on' | 'off';
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className={authPasosLabelClass}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={authPasosInputClass(!!error)}
      />
      {error && <p id={`${id}-error`} className={authPasosErrorTextClass}>{error}</p>}
    </div>
  );
}

/**
 * Desplegable con la misma forma que el resto de campos.
 *
 * `appearance-none` y flecha propia: el desplegable del sistema trae su borde y
 * su tipografía, y al lado de los demás campos desentonaba.
 */
export function AuthSelectField({
  id,
  label,
  value,
  onChange,
  error,
  options,
  placeholder = 'Selecciona una opción…',
  className = authPasosHuecoClass,
  etiquetaOculta = false,
}: {
  id: string;
  label: ReactNode;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
  className?: string;
  /** La etiqueta solo para el lector de pantalla: cuando un encabezado encima ya dice qué se elige. */
  etiquetaOculta?: boolean;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className={etiquetaOculta ? 'sr-only' : authPasosLabelClass}>
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          // Sin valor el campo imita a un `placeholder`; las opciones vuelven al
          // gris de texto porque en Windows heredan el color del `select`.
          // `admin-auth-select`: la lista abierta, con borde (globals.css). Esquinas de 16, como
          // la caja de la pregunta en la recuperación: la pregunta elegida puede ocupar dos líneas.
          className={`admin-auth-select ${authPasosInputClass(!!error, 'rounded-xl')} appearance-none pr-12 ${value ? '' : 'text-[#b3b3b3]'}`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opcion) => (
            <option
              key={opcion.value}
              value={opcion.value}
              disabled={opcion.disabled}
              className="text-gray-900"
            >
              {opcion.label}
            </option>
          ))}
        </select>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-gray-500"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {error && <p id={`${id}-error`} className={authPasosErrorTextClass}>{error}</p>}
    </div>
  );
}

/**
 * Campo de contraseña con alternador de visibilidad.
 *
 * Los ojos son los del usuario (2026-10-09), los mismos `eye-closed` y `eye-open` de
 * `/assets/svg` que usan los botones de «ver» del panel. Muestran el estado, como en el
 * mockup: cerrado mientras la contraseña está oculta, abierto cuando se ve. El nombre
 * accesible dice la acción («Mostrar contraseña»).
 *
 * El ojo va en una caja de 16 × 16 (antes 24 × 20; el usuario lo pidió más pequeño el
 * 2026-10-11, igual que en la intranet). `IconoMascara` lo ajusta con `contain` y el ojo es el
 * doble de ancho que de alto: manda el ancho de la caja, no el alto.
 */
export function PasswordField({
  id,
  label,
  value,
  onChange,
  onFocus,
  error,
  placeholder = `Mínimo ${LONGITUD_MINIMA} caracteres`,
  autoComplete,
  describedBy,
  className = authPasosHuecoClass,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onFocus?: () => void;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  /** `id` de lo que explica el campo además de su error (la lista de requisitos). */
  describedBy?: string;
  className?: string;
}) {
  const [show, setShow] = useState(false);
  const descripciones = [describedBy, error ? `${id}-error` : undefined].filter(Boolean).join(' ');

  return (
    <div className={className}>
      <label htmlFor={id} className={authPasosLabelClass}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={descripciones || undefined}
          // Hueco para el ojo: 12 px al borde, el botón y 8 de aire antes del texto.
          className={`${authPasosInputClass(!!error)} pr-14`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="absolute right-3 top-1/2 flex -translate-y-1/2 rounded-full p-1.5 text-[#334861] transition-colors hover:text-[#001a39] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001631]"
        >
          <IconoMascara nombre={show ? 'eye-open' : 'eye-closed'} tamano="h-4 w-4" />
        </button>
      </div>
      {error && <p id={`${id}-error`} className={authPasosErrorTextClass}>{error}</p>}
    </div>
  );
}

/**
 * Lista de requisitos de §1, marcando cuáles cumple ya lo tecleado.
 *
 * Se pinta entera desde el principio —incluso con el campo vacío— en vez de ir
 * soltando errores al enviar: con cuatro reglas, descubrirlas de una en una a base
 * de rechazos es una forma segura de que alguien abandone en el primer intento.
 *
 * `aria-live` para que un lector de pantalla anuncie los que se van cumpliendo; sin
 * eso la lista es información visual que no llega a todo el mundo.
 *
 * Es la única primitiva con dos variantes, porque además de estas pantallas la usa
 * el perfil dentro del panel, que sí tiene tema oscuro (`variant="panel"`).
 *
 * `resumirAlCumplir`: cumplidos todos, la lista se queda en una sola línea («Cumple todos los
 * requisitos»). La usan las pantallas de acceso, que en el móvil tienen que caber sin scroll
 * (2026-10-10): eran cinco líneas que seguían ocupando sitio cuando ya no pedían nada. Mientras
 * falte alguno se ve entera, por lo dicho arriba.
 */
export function PasswordRequisitos({
  id,
  password,
  className = 'mb-4',
  variant = 'panel',
  resumirAlCumplir = false,
}: {
  /** Para que el campo lo nombre en su `aria-describedby`. */
  id?: string;
  password: string;
  className?: string;
  variant?: 'panel' | 'solid';
  resumirAlCumplir?: boolean;
}) {
  const todos = requisitosDe(password);
  const requisitos =
    resumirAlCumplir && todos.every((r) => r.cumplido)
      ? [{ id: 'todos', etiqueta: 'Cumple todos los requisitos', cumplido: true }]
      : todos;
  const esSolido = variant === 'solid';

  return (
    <ul id={id} className={`${className} space-y-1`} aria-live="polite">
      {requisitos.map((requisito) => {
        const claseEstado = requisito.cumplido
          ? esSolido
            ? 'text-green-700'
            : 'text-green-700 dark:text-green-400'
          : esSolido
            ? 'text-gray-500'
            : 'text-gray-500 dark:text-slate-400';

        return (
          <li key={requisito.id} className={`flex items-start gap-1.5 text-xs ${claseEstado}`}>
            <span aria-hidden="true" className="mt-px leading-none">
              {requisito.cumplido ? '✓' : '○'}
            </span>
            {/* El estado va también en texto: el color y el símbolo solos no lo dicen. */}
            <span className="sr-only">{requisito.cumplido ? 'Cumplido:' : 'Pendiente:'}</span>
            <span>{requisito.etiqueta}</span>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- Navegación ---------- */

/**
 * Enlace de regreso al sitio público, al pie de cada pantalla (lo pone `MarcoDePasos`).
 * Por debajo de `xl` va sobre el fondo blanco, en `#001631`; desde `xl`, sobre el azul
 * de la mitad derecha, en blanco. La casa rellena y el texto de 16 px del mockup.
 */
export function BackToSiteLink({
  className = '',
  label = 'Ir al sitio web',
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div className={`text-center ${className}`}>
      <Link
        href="/inicio"
        // En línea y no `inline-flex`: a 360 px el texto parte en dos y la casa debe ir
        // pegada a la primera palabra, no sola a la izquierda.
        className="inline-block rounded py-1.5 text-sm text-[#001631] md:py-2.5 md:text-base transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001631] xl:text-white xl:focus-visible:ring-white"
      >
        <HomeIcon aria-hidden="true" className="mr-2 inline-block size-5 align-[-4px]" />
        {label}
      </Link>
    </div>
  );
}

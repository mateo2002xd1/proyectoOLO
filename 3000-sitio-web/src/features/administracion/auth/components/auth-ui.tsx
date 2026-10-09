'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconoMascara } from '@/shared/ui/atoms/icono-mascara';
import { LONGITUD_MINIMA, requisitosDe } from '@olo/password-policy';

/**
 * Primitivas compartidas por las pantallas de autenticación del panel:
 * acceso, primer ingreso y recuperación de contraseña.
 *
 * ## Un solo marco para las tres
 *
 * Las tres viven dentro de `AuthSplitShell` —identidad a la izquierda, tarjeta
 * blanca sobre el azul institucional a la derecha— y comparten el mismo juego de
 * estilos. Antes solo la de acceso lo hacía: primer ingreso y recuperación traían
 * un juego con variantes `dark:`, pensado para una tarjeta que sigue el tema del
 * panel. Dentro de este marco eso se rompía dos veces:
 *
 *   · el tema oscuro se activa también por preferencia del sistema operativo
 *     (`layout.tsx` lo aplica antes de pintar), así que la tarjeta salía blanca
 *     con etiquetas gris claro y texto gris azulado encima;
 *   · los títulos de paso se pintaban fuera de la tarjeta, en `text-gray-900`,
 *     es decir gris oscuro sobre el azul `#001631`: ilegibles.
 *
 * Por eso aquí no hay variantes `dark:` salvo en `PasswordRequisitos`, que además
 * de estas pantallas sirve al perfil dentro del panel, donde sí hay tema.
 */

/* ---------- Clases base ---------- *
 * La tarjeta es siempre blanca y el marco pinta su propio fondo, así que estas
 * clases no llevan tema oscuro: hacerlo dejaría un campo oscuro dentro de una
 * tarjeta blanca. */

// Relleno menor en el móvil: con `px-9` dentro del `px-6` del marco, a 360 px el
// campo se quedaba en 240 px y la pregunta de seguridad partía en cuatro líneas.
export const authSolidCardClass =
  'w-full max-w-[380px] rounded-2xl bg-white px-6 py-8 shadow-[0_25px_60px_rgba(0,0,0,0.35)] sm:px-9 sm:py-10';

/**
 * Tarjeta del login. Por debajo de `xl` no es tarjeta: la pantalla entera es blanca
 * (ver `AuthSplitShell`) y el formulario va directo sobre ella, sin borde ni sombra,
 * como en el diseño de móvil y tablet. Desde `xl` vuelve a ser la de las demás.
 */
export const authLoginCardClass =
  'w-full max-w-[380px] bg-white xl:rounded-2xl xl:px-9 xl:py-10 xl:shadow-[0_25px_60px_rgba(0,0,0,0.35)]';

export const authSolidLabelClass = 'mb-1.5 block text-sm font-semibold text-[#0d1526]';

export const authSolidInputClass = (hasError: boolean) =>
  [
    'w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400',
    'transition-colors focus:outline-none focus:ring-2',
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
      : // El anillo va a opacidad plena por lo mismo que en `Button`: SC 1.4.11 pide
      // 3:1 para el indicador de foco y cualquier `/20` lo hunde por debajo.
      'border-gray-300 focus:border-[#0d1526] focus:ring-[#0d1526]',
  ].join(' ');

export const authErrorTextClass = 'mt-1 text-xs text-red-600';

/** Enlaces secundarios de una tarjeta: volver, ir al login, cambiar de paso. */
export const authQuietLinkClass =
  'rounded text-xs text-gray-500 transition-colors hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d1526]';

/**
 * Piel del botón principal cuando la acción es navegar y no enviar.
 *
 * Repite lo que `Button variant="navy"` da a un `<button>`, porque las pantallas
 * de éxito terminan en un enlace. Meter un `<Button>` dentro de un `<Link>` sería
 * anidar contenido interactivo, que es HTML inválido y confunde a los lectores de
 * pantalla sobre qué se está activando.
 */
export const authNavyActionClass =
  'inline-flex w-full items-center justify-center rounded-[16px] bg-[#0d1526] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_2px_8px_-2px_rgba(13,21,38,0.4)] transition hover:bg-[#1a2340] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-focus';

/* ---------- Contenedores ---------- */

/**
 * Marco partido de las pantallas de autenticación: identidad a la izquierda,
 * tarjeta a la derecha sobre el azul institucional.
 *
 * El logo vive aquí y no dentro de la tarjeta porque el panel izquierdo ya lo
 * sostiene. Por debajo de `xl` ese panel se oculta, así que el marco repone la marca
 * arriba: si no, la pantalla de móvil se quedaría sin ninguna.
 *
 * ## Por qué el corte es `xl` y no `md`
 *
 * El diseño de móvil vale hasta la tablet grande incluida (iPad Pro 13", 1032 × 1376
 * en vertical). `lg` empieza en 1024, así que esa tablet caía en el diseño partido,
 * con dos columnas de 516 px; `xl` (1280) es el primer corte de la escala por encima
 * (`2-convenciones` §10.1). La misma tablet en horizontal (1376) sí lo parte.
 *
 * ## El login, por debajo de `xl`, es otra pantalla
 *
 * Fondo blanco entero, el logo a color con «Panel de Administración» encima y el
 * formulario sin tarjeta (`authLoginCardClass`). El resto del flujo sigue sobre el
 * azul, con la marca compacta en blanco y su tarjeta. Por eso el marco mira la ruta:
 * vive en el layout y es el único que pinta el fondo.
 *
 * El enlace de regreso al sitio también es del marco y no de cada pantalla: sale
 * igual en el acceso, en la elección de editor, en el primer ingreso y en la
 * recuperación.
 */
export function AuthSplitShell({ children }: { children: ReactNode }) {
  const esLogin = usePathname() === '/login';

  return (
    <div className={`flex min-h-dvh w-full xl:bg-[#001631] ${esLogin ? 'bg-white' : 'bg-[#001631]'}`}>
      {/* Panel izquierdo — identidad sobre blanco, con la esquina derecha redondeada. */}
      <div className="hidden w-[50%] shrink-0 items-center justify-center bg-white rounded-r-[16px] xl:flex">
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logos/olo-logo-none.svg" alt="OLO Logo" className="mx-auto w-[210px]" />
          <p className="mt-6 text-2xl font-light text-[#0d1526]">Panel de</p>
          {/* Es el título de la pantalla, así que va como encabezado y no como
              párrafo: sin esto la página no tiene ningún `h1` que anunciar. Los
              títulos de cada paso van dentro de la tarjeta como `h2`. */}
          <h1 className="text-3xl font-bold leading-tight text-[#0d1526]">ADMINISTRACIÓN</h1>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 px-6 py-12 sm:py-16">
        {/* Marca mientras el panel izquierdo está oculto. Los dos `h1` nunca
            coexisten: el que no toca está en `display:none` y no llega al árbol
            de accesibilidad. */}
        {esLogin ? (
          // Login: el logo a color y el título grande, con aire antes del formulario.
          <div className="mb-4 text-center sm:mb-10 xl:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/logos/olo-logo-none.svg"
              alt="OLO Logo"
              className="mx-auto w-24 sm:w-28"
            />
            <h1 className="mt-4 leading-tight text-[#0d1526]">
              <span className="block text-xl font-light sm:text-2xl">Panel de</span>{' '}
              {/* El espacio de arriba es para el nombre accesible: dos `block`
                  seguidos se leían «Panel deAdministración». */}
              <span className="block text-2xl font-bold sm:text-3xl">Administración</span>
            </h1>
          </div>
        ) : (
          <div className="mb-2 text-center xl:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/logos/olo-logo-none.svg"
              alt="OLO Logo"
              className="mx-auto mb-2 w-16 brightness-0 invert"
            />
            <h1 className="text-lg text-white">
              Panel de <span className="font-bold">ADMINISTRACIÓN</span>
            </h1>
          </div>
        )}

        {children}

        <BackToSiteLink label="Regresar al sitio web del Observatorio" sobreBlanco={esLogin} />
      </div>
    </div>
  );
}

/**
 * Encabezado de una tarjeta: qué pantalla es y qué se espera de quien la ve.
 *
 * Va **dentro** de la tarjeta blanca. Fuera solo cabe lo que el marco pinta en
 * blanco sobre el azul; cualquier texto oscuro ahí desaparece.
 *
 * Es `h2` porque el `h1` de la página lo pone el marco. La pantalla de acceso no
 * lo usa: allí el panel izquierdo ya dice a dónde se está entrando y la tarjeta
 * empieza directamente por el formulario.
 */
export function AuthCardTitle({
  title,
  description,
  className = 'mb-6',
}: {
  title: string;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="text-[19px] font-bold leading-snug text-[#0d1526]">{title}</h2>
      {description && (
        <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">{description}</p>
      )}
    </div>
  );
}

/** Banda roja para errores que no pertenecen a un campo concreto. */
export function AuthGeneralError({ children }: { children: ReactNode }) {
  return (
    <div
      className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2.5 text-sm text-red-600"
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
      className="mb-4 rounded-lg border border-blue-300 bg-blue-50 px-3.5 py-2.5 text-sm text-blue-800"
      role="status"
    >
      {children}
    </div>
  );
}

/**
 * Avance dentro de un cuestionario de varios pasos.
 *
 * Decorativo a propósito (`aria-hidden`): la posición se anuncia en texto —
 * «Pregunta 2 de 3»— junto al campo, que es lo que de verdad sirve a quien no ve
 * los puntos. El paso actual se distingue por forma *y* color, no solo por color.
 */
export function AuthProgressDots({
  total,
  current,
  className = 'mb-5',
}: {
  total: number;
  current: number;
  className?: string;
}) {
  return (
    <div className={`flex justify-center gap-1.5 ${className}`} aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i === current
              ? 'w-6 bg-[#0d1526]'
              : i < current
                ? 'w-1.5 bg-[#0d1526]/45'
                : 'w-1.5 bg-gray-300'
            }`}
        />
      ))}
    </div>
  );
}

/** Marca de operación terminada, para las pantallas de cierre del flujo. */
export function AuthSuccessBadge() {
  return (
    <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-[#0d1526]">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  );
}

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
  className = 'mb-4',
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
      <label htmlFor={id} className={authSolidLabelClass}>
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
        className={authSolidInputClass(!!error)}
      />
      {error && <p className={authErrorTextClass}>{error}</p>}
    </div>
  );
}

/**
 * Desplegable con la misma piel que el resto de campos.
 *
 * `appearance-none` y flecha propia: el desplegable del sistema trae su borde y
 * su tipografía, y dentro de esta tarjeta cantaba al lado de los demás campos.
 */
export function AuthSelectField({
  id,
  label,
  value,
  onChange,
  error,
  options,
  placeholder = 'Selecciona una opción…',
  className = 'mb-4',
}: {
  id: string;
  label: ReactNode;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className={authSolidLabelClass}>
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          // Sin valor el campo imita a un `placeholder`; las opciones vuelven al
          // gris de texto porque en Windows heredan el color del `select`.
          // `admin-auth-select`: la lista abierta, con borde (globals.css).
          className={`admin-auth-select ${authSolidInputClass(!!error)} appearance-none pr-10 ${value ? '' : 'text-gray-400'
            }`}
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
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {error && <p className={authErrorTextClass}>{error}</p>}
    </div>
  );
}

/** Campo de contraseña con alternador de visibilidad. */
export function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  placeholder = `Mínimo ${LONGITUD_MINIMA} caracteres`,
  autoComplete,
  className = 'mb-4',
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className={className}>
      <label htmlFor={id} className={authSolidLabelClass}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${authSolidInputClass(!!error)} pr-10`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 transition-colors hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d1526]"
        >
          <IconoMascara nombre={show ? 'eye-open' : 'eye-closed'} tamano="h-5 w-5" />
        </button>
      </div>
      {error && <p className={authErrorTextClass}>{error}</p>}
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
 * Es la única primitiva con dos pieles, porque además de estas pantallas la usa
 * el perfil dentro del panel, que sí tiene tema oscuro (`variant="panel"`).
 */
export function PasswordRequisitos({
  password,
  className = 'mb-4',
  variant = 'panel',
}: {
  password: string;
  className?: string;
  variant?: 'panel' | 'solid';
}) {
  const requisitos = requisitosDe(password);
  const esSolido = variant === 'solid';

  return (
    <ul className={`${className} space-y-1`} aria-live="polite">
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
 * Enlace de regreso al sitio público.
 *
 * Solo lo usa `AuthSplitShell`, que lo pone sobre el azul: de ahí el blanco. Con
 * `sobreBlanco` (el login por debajo de `xl`, que va sobre fondo blanco) pasa a
 * gris oscuro hasta ese corte; desde `xl` vuelve a estar sobre el azul.
 */
export function BackToSiteLink({
  className = '',
  label = 'Ir al sitio web',
  sobreBlanco = false,
}: {
  className?: string;
  label?: string;
  sobreBlanco?: boolean;
}) {
  const color = sobreBlanco
    ? 'text-gray-600 hover:text-gray-900 xl:text-white/90 xl:hover:text-white'
    : 'text-white/90 hover:text-white';

  return (
    <div className={`text-center ${className}`}>
      <Link
        href="/inicio"
        // `py-2.5`: el texto solo mide 20 px de alto, y en el móvil el objetivo
        // táctil debe llegar a 24 (`2-convenciones` §10.4).
        className={`inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition hover:-translate-y-px ${color}`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        {label}
      </Link>
    </div>
  );
}

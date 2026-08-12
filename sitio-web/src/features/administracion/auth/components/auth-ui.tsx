'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { LONGITUD_MINIMA, requisitosDe } from '@olo/password-policy';

/**
 * Primitivas compartidas por las pantallas de autenticación
 * (login, elección de editor y configuración de primer ingreso).
 *
 * Antes cada pantalla repetía la misma tarjeta, los mismos inputs y
 * hasta los mismos SVGs del ojo. Todo lo común vive aquí.
 */

/**
 * Qué juego de estilos usa una primitiva.
 * `solid` es el del marco partido (`AuthSplitShell`): tarjeta blanca fija, sin tema oscuro.
 */
export type AuthVariant = 'default' | 'solid';

/* ---------- Clases base ---------- */
export const authCardClass =
  'w-full max-w-[400px] rounded-xl bg-white dark:bg-[#131b2f] px-9 py-10 shadow-[0_20px_60px_rgba(0,0,0,0.2)] dark:shadow-none dark:border dark:border-[#1e293b]';

export const authLabelClass = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-[#f6f6f6]';

export const authInputClass = (hasError: boolean) =>
  [
    'w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 dark:text-[#f6f6f6] dark:bg-[#0b1121]',
    'transition-colors placeholder:text-gray-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2',
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30'
      : 'border-gray-300 dark:border-[#1e293b] focus:border-brand-focus focus:ring-brand-focus',
  ].join(' ');

export const authErrorTextClass = 'mt-1 text-xs text-red-600';

/* ---------- Clases del juego «sólido» ---------- *
 * Para lo que va dentro de `AuthSplitShell`, que pinta su propio fondo azul y
 * lleva la tarjeta siempre en blanco. Por eso aquí no hay variantes `dark:`: las
 * del juego de arriba dejarían un input oscuro dentro de una tarjeta blanca.
 * Los componentes que sirven a las dos pantallas lo eligen con `variant="solid"`. */

export const authSolidCardClass =
  'w-full max-w-[380px] rounded-2xl bg-white px-9 py-10 shadow-[0_25px_60px_rgba(0,0,0,0.35)]';

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

/* ---------- Contenedores ---------- */

/** Fondo a pantalla completa que centra la tarjeta de autenticación. */
export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6">
      {children}
    </div>
  );
}

/**
 * Marco partido de la pantalla de acceso al panel: identidad a la izquierda,
 * tarjeta a la derecha sobre el azul institucional.
 *
 * El logo vive aquí y no dentro de la tarjeta —como en `AuthCardHeader`— porque
 * el panel izquierdo ya lo sostiene. Por debajo de `md` ese panel se oculta, así
 * que el marco repone una versión compacta arriba: si no, la pantalla de móvil
 * se quedaría sin ninguna marca.
 *
 * El enlace de regreso al sitio también es del marco y no de cada pantalla: sale
 * igual en el formulario, en la elección de editor y en el primer ingreso.
 */
export function AuthSplitShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-[#001631]">
      {/* Panel izquierdo — identidad sobre blanco, con la esquina derecha redondeada. */}
      <div className="hidden w-[35%] shrink-0 items-center justify-center bg-white rounded-r-[16px] md:flex">
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logos/olo-logo-none.svg" alt="OLO Logo" className="mx-auto w-[110px]" />
          <p className="mt-6 text-2xl font-light text-[#0d1526]">Panel de</p>
          {/* Es el título de la pantalla, así que va como encabezado y no como
              párrafo: sin esto la página no tiene ningún `h1` que anunciar. */}
          <h1 className="text-3xl font-bold leading-tight text-[#0d1526]">ADMINISTRACIÓN</h1>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16">
        {/* Marca compacta, solo mientras el panel izquierdo está oculto. Los dos
            `h1` nunca coexisten: el que no toca está en `display:none` y no llega
            al árbol de accesibilidad. */}
        <div className="mb-2 text-center md:hidden">
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

        {children}

        <BackToSiteLink tone="on-dark" label="Regresar al sitio web del Observatorio" />
      </div>
    </div>
  );
}

/** Cabecera con el logo institucional y una frase. */
export function AuthCardHeader({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`text-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/logos/olo-logo-none.svg" alt="OLO Logo" className="mx-auto mb-3 h-auto w-[60px] dark:brightness-0 dark:invert dark:opacity-[0.96]" />
      {children}
    </div>
  );
}

/** Banda roja para errores que no pertenecen a un campo concreto. */
export function AuthGeneralError({
  children,
  variant = 'default',
}: {
  children: ReactNode;
  variant?: AuthVariant;
}) {
  const tema =
    variant === 'solid'
      ? ''
      : ' dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400';

  return (
    <div
      className={`mb-4 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2.5 text-sm text-red-600${tema}`}
      role="alert"
    >
      {children}
    </div>
  );
}

/* ---------- Campos ---------- */

function EyeIcon({ crossed }: { crossed: boolean }) {
  return crossed ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
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
  variant = 'default',
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
  variant?: AuthVariant;
}) {
  const [show, setShow] = useState(false);
  const esSolido = variant === 'solid';
  const claseEtiqueta = esSolido ? authSolidLabelClass : authLabelClass;
  const claseCampo = esSolido ? authSolidInputClass(!!error) : authInputClass(!!error);
  const claseOjo = esSolido
    ? 'text-gray-500 hover:text-gray-700 focus-visible:ring-[#0d1526]'
    : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-[#f6f6f6] focus-visible:ring-brand-focus';

  return (
    <div className={className}>
      <label htmlFor={id} className={claseEtiqueta}>
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
          className={`${claseCampo} pr-10`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className={`absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 ${claseOjo}`}
        >
          <EyeIcon crossed={show} />
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
 */
export function PasswordRequisitos({ password, className = 'mb-4' }: { password: string; className?: string }) {
  const requisitos = requisitosDe(password);

  return (
    <ul className={`${className} space-y-1`} aria-live="polite">
      {requisitos.map((requisito) => (
        <li
          key={requisito.id}
          className={`flex items-start gap-1.5 text-xs ${requisito.cumplido
              ? 'text-green-700 dark:text-green-400'
              : 'text-gray-500 dark:text-slate-400'
            }`}
        >
          <span aria-hidden="true" className="mt-px leading-none">
            {requisito.cumplido ? '✓' : '○'}
          </span>
          {/* El estado va también en texto: el color y el símbolo solos no lo dicen. */}
          <span className="sr-only">{requisito.cumplido ? 'Cumplido:' : 'Pendiente:'}</span>
          <span>{requisito.etiqueta}</span>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Navegación ---------- */

/** Enlace de regreso al sitio público. */
export function BackToSiteLink({
  className = '',
  tone = 'default',
  label = 'Ir al sitio web',
}: {
  className?: string;
  /** `on-dark` para cuando el enlace cae sobre el azul del marco partido. */
  tone?: 'default' | 'on-dark';
  label?: string;
}) {
  const claseTono =
    tone === 'on-dark'
      ? 'text-white/90 hover:text-white'
      : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-[#f6f6f6]';

  return (
    <div className={`text-center ${className}`}>
      <Link
        href="/"
        className={`inline-flex items-center justify-center gap-2 text-sm font-medium transition hover:-translate-y-px ${claseTono}`}
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

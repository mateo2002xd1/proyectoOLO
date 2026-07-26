'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';

/**
 * Primitivas compartidas por las pantallas de autenticación
 * (login, elección de editor y configuración de primer ingreso).
 *
 * Antes cada pantalla repetía la misma tarjeta, los mismos inputs y
 * hasta los mismos SVGs del ojo. Todo lo común vive aquí.
 */

/* ---------- Clases base ---------- */
export const authCardClass =
  'w-full max-w-[400px] rounded-xl bg-white px-9 py-10 shadow-[0_20px_60px_rgba(0,0,0,0.2)]';

export const authLabelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

export const authInputClass = (hasError: boolean) =>
  [
    'w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900',
    'transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2',
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30'
      : 'border-gray-300 focus:border-brand focus:ring-brand/30',
  ].join(' ');

export const authErrorTextClass = 'mt-1 text-xs text-red-600';

/* ---------- Contenedores ---------- */

/** Fondo a pantalla completa que centra la tarjeta de autenticación. */
export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6">
      {children}
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
      <img src="/asset/logos/olo-logo-none.svg" alt="OLO Logo" className="mx-auto mb-3 h-auto w-[60px]" />
      {children}
    </div>
  );
}

/** Banda roja para errores que no pertenecen a un campo concreto. */
export function AuthGeneralError({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
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
  placeholder = 'Mínimo 8 caracteres',
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
      <label htmlFor={id} className={authLabelClass}>
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
          className={`${authInputClass(!!error)} pr-10`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 transition-colors hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <EyeIcon crossed={show} />
        </button>
      </div>
      {error && <p className={authErrorTextClass}>{error}</p>}
    </div>
  );
}

/* ---------- Navegación ---------- */

/** Enlace de regreso al sitio público. */
export function BackToSiteLink({ className = '' }: { className?: string }) {
  return (
    <div className={`text-center ${className}`}>
      <Link
        href="/"
        className="inline-flex items-center justify-center gap-2 text-sm font-medium text-gray-600 transition hover:-translate-y-px hover:text-gray-900"
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
        Ir al sitio web
      </Link>
    </div>
  );
}

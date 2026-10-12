'use client';

import { useState } from 'react';
import { IconoMascara } from '@/shared/ui/atoms/icono-mascara';
import { LONGITUD_MINIMA } from '@olo/password-policy';

interface PasswordFieldProps {
  id?: string;
  classPrefix?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  label?: string;
  maxLength?: number;
  autoComplete?: string;
  className?: string;
}

export function PasswordField({
  id,
  classPrefix,
  value,
  onChange,
  placeholder = `Mínimo ${LONGITUD_MINIMA} caracteres`,
  error,
  label,
  maxLength = 50,
  autoComplete,
  className = 'mb-4',
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  if (classPrefix) {
    return (
      <div className={`${classPrefix}-field`}>
        {label && (
          <label htmlFor={id} className={`${classPrefix}-label`}>
            {label}
          </label>
        )}
        <div className={`${classPrefix}-password-wrap`}>
          <input
            id={id}
            type={visible ? 'text' : 'password'}
            maxLength={maxLength}
            autoComplete={autoComplete}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${classPrefix}-input ${classPrefix}-input-password ${error ? `${classPrefix}-input-error` : ''}`}
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className={`${classPrefix}-eye-btn`}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <span className="text-[#6c757d]">
              <IconoMascara nombre={visible ? 'eye-open' : 'eye-closed'} tamano="h-5 w-5" />
            </span>
          </button>
        </div>
        {error && <span className={`${classPrefix}-error`}>{error}</span>}
      </div>
    );
  }

  // Medidas de letra del acceso (`features/login/components/acceso-ui.ts`, las del sitio
  // web): etiqueta de 14/16 px en peso medio, campo de 44 px de alto con texto de 16.
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-[#0d1526] md:mb-2 md:text-base">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          maxLength={maxLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`h-11 w-full rounded-lg border bg-white px-4 pr-12 text-base text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-[#0d1526] focus:ring-[#0d1526]'
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 transition-colors hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d1526]"
        >
          <IconoMascara nombre={visible ? 'eye-open' : 'eye-closed'} tamano="h-5 w-5" />
        </button>
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}

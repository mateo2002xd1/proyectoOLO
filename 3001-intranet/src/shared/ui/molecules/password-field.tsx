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
            <span className="text-white/80">
              <IconoMascara nombre={visible ? 'eye-open' : 'eye-closed'} tamano="h-4 w-4" />
            </span>
          </button>
        </div>
        {error && <span className={`${classPrefix}-error`}>{error}</span>}
      </div>
    );
  }

  // Las clases de `features/login/components/acceso-ui.ts` (las medidas del sitio web):
  // texto blanco y campo transparente sobre el azul del acceso. Escritas aquí y no
  // importadas: `shared/` no depende de `features/`.
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-white md:mb-2 md:text-base">
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
          className={`h-11 w-full rounded-[32px] border bg-transparent px-5 pr-14 text-base text-white placeholder:text-white/65 autofill:shadow-[inset_0_0_0_1000px_#001A39] autofill:[-webkit-text-fill-color:#fff] transition-colors focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-300 focus:border-red-300 focus:ring-red-300'
              : 'border-white/50 focus:border-white focus:ring-white'
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <IconoMascara nombre={visible ? 'eye-open' : 'eye-closed'} tamano="h-4 w-4" />
        </button>
      </div>
      {error && <p className="mt-1.5 text-sm text-red-300">{error}</p>}
    </div>
  );
}

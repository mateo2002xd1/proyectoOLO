'use client';

import { useState } from 'react';
import { IconoMascara } from '@/shared/ui/atoms/icono-mascara';
import { LONGITUD_MINIMA } from '@olo/password-policy';

interface PasswordFieldProps {
  id?: string;
  classPrefix: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  label?: string;
  maxLength?: number;
}

export function PasswordField({
  id,
  classPrefix,
  value,
  onChange,
  placeholder = `mínimo ${LONGITUD_MINIMA} caracteres`,
  error,
  label,
  maxLength = 50,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

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
          <span className="text-[#6c757d]"><IconoMascara nombre={visible ? 'eye-open' : 'eye-closed'} tamano="h-5 w-5" /></span>        </button>
      </div>
      {error && <span className={`${classPrefix}-error`}>{error}</span>}
    </div>
  );
}

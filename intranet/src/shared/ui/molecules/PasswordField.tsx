'use client';

import { useState } from 'react';

interface PasswordFieldProps {
  id?: string;
  classPrefix: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  label?: string;
}

export function PasswordField({
  id,
  classPrefix,
  value,
  onChange,
  placeholder = 'mínimo 8 caracteres',
  error,
  label,
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {visible ? (
              <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </>
            ) : (
              <>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </>
            )}
          </svg>
        </button>
      </div>
      {error && <span className={`${classPrefix}-error`}>{error}</span>}
    </div>
  );
}

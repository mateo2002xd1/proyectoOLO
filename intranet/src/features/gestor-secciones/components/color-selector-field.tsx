'use client';

import React from 'react';

interface ColorSelectorFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const COLORES = [
  { hex: '#002237', nombre: 'Azul oscuro' },
  { hex: '#1FACE3', nombre: 'Azul claro' },
  { hex: '#7DB728', nombre: 'Verde' },
];

export function ColorSelectorField({ value, onChange }: ColorSelectorFieldProps) {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      {COLORES.map((color) => (
        <button
          key={color.hex}
          type="button"
          onClick={() => onChange(color.hex)}
          title={color.nombre}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: color.hex,
            border: value === color.hex ? '3px solid #000' : '1px solid #ccc',
            cursor: 'pointer',
            padding: 0,
            outline: 'none',
            boxShadow: value === color.hex ? '0 0 0 2px #fff inset' : 'none',
          }}
          aria-label={`Seleccionar color ${color.nombre}`}
          aria-pressed={value === color.hex}
        />
      ))}
      <button
         type="button"
         onClick={() => onChange('')}
         style={{
           background: 'transparent',
           border: 'none',
           textDecoration: 'underline',
           cursor: 'pointer',
           fontSize: '12px',
           marginLeft: 'auto'
         }}
      >
        Limpiar
      </button>
    </div>
  );
}

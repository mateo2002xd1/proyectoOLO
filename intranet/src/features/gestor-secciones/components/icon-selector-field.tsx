'use client';

import React from 'react';

interface IconSelectorFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const ICONOS = [
  { ruta: '', nombre: 'Ninguno' },
  { ruta: '/assets/svg/icono-1.svg', nombre: 'Ícono 1' },
  { ruta: '/assets/svg/icono-2.svg', nombre: 'Ícono 2' },
  { ruta: '/assets/svg/icono-3.svg', nombre: 'Ícono 3' },
  { ruta: '/assets/svg/icono-4.svg', nombre: 'Ícono 4' },
];

export function IconSelectorField({ value, onChange }: IconSelectorFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {ICONOS.map((icono) => (
          <button
            key={icono.ruta || 'ninguno'}
            type="button"
            onClick={() => onChange(icono.ruta)}
            title={icono.nombre}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '4px',
              backgroundColor: value === icono.ruta ? '#e0f2fe' : '#f3f4f6',
              border: value === icono.ruta ? '2px solid #0284c7' : '1px solid #d1d5db',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
            }}
            aria-label={`Seleccionar icono ${icono.nombre}`}
            aria-pressed={value === icono.ruta}
          >
            {icono.ruta ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={icono.ruta} alt={icono.nombre} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: '10px', color: '#6b7280' }}>Ø</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { idDeVideoDeYoutube } from './video-embebido';

/**
 * Campo del editor para el video de «Video embebido»: el enlace o el ID de YouTube,
 * con una línea debajo que dice si se reconoció y qué ID se va a usar.
 *
 * Los estilos van en línea, con los mismos bordes, esquinas y foco que los controles
 * de `@olo/blocks-renderer`.
 */
export function CampoVideoDeYoutube({
  value,
  onChange,
}: {
  value?: string;
  onChange: (valor: string) => void;
}) {
  const [enfocado, setEnfocado] = useState(false);
  const texto = value ?? '';
  const id = idDeVideoDeYoutube(texto);
  const vacio = texto.trim() === '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <input
        type="text"
        value={texto}
        onChange={(evento) => onChange(evento.target.value)}
        onFocus={() => setEnfocado(true)}
        onBlur={() => setEnfocado(false)}
        placeholder="https://www.youtube.com/watch?v=… o el ID"
        spellCheck={false}
        aria-invalid={!vacio && !id}
        style={{
          height: 40,
          width: '100%',
          boxSizing: 'border-box',
          padding: '0 12px',
          fontSize: 14,
          color: '#333333',
          background: '#ffffff',
          border: `1px solid ${enfocado ? '#001631' : !vacio && !id ? '#dc2626' : '#d1d5db'}`,
          borderRadius: 8,
          outline: 'none',
          boxShadow: enfocado ? '0 0 0 1px #001631' : 'none',
        }}
      />
      <span style={{ fontSize: 12, lineHeight: 1.4, color: vacio ? '#6b7280' : id ? '#15803d' : '#dc2626' }}>
        {vacio
          ? 'Solo videos de YouTube: el enlace del video o su ID de 11 caracteres.'
          : id
            ? `Video reconocido (ID ${id}).`
            : 'No es un enlace de YouTube ni un ID válido; el video no se mostrará.'}
      </span>
    </div>
  );
}

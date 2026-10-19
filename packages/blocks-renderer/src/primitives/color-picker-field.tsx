'use client';

/**
 * Selector de color para Puck: selector visual (`input type="color"`) + hex a
 * mano, sincronizados. Vive en el paquete compartido porque no depende de nada
 * propio de una app (a diferencia de `ImageUploaderField`, que sí llama a la
 * API de subida de cada app y por eso está duplicado en cada una).
 *
 * Vacío significa «sin color propio»: el bloque sigue el que ya trae su CSS.
 * Es el mismo criterio que `conCaja` — sin valor puesto, el bloque se pinta
 * exactamente igual que antes de que existiera el campo.
 */

import { CLASE_CONTROL, CLASE_ENFOCABLE, EstilosDeCampos } from './estilos-de-campos';

export interface ColorPickerFieldProps {
  value?: string;
  onChange: (value: string) => void;
}

const HEX_VALIDO = /^#[0-9a-fA-F]{6}$/;
const BORDE = '1px solid #d1d5db';

export function ColorPickerField({ value, onChange }: ColorPickerFieldProps) {
  // El selector visual necesita un hex de 6 dígitos siempre; si el campo de
  // texto trae otra cosa (vacío, un nombre CSS, un hex a medio escribir), se le
  // muestra blanco sin tocar lo que hay guardado en `value`.
  const hexParaElSelector = value && HEX_VALIDO.test(value) ? value : '#ffffff';

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <EstilosDeCampos />
      <input
        type="color"
        className={CLASE_CONTROL}
        value={hexParaElSelector}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Selector visual de color"
        style={{
          width: '40px',
          height: '40px',
          padding: '3px',
          border: BORDE,
          borderRadius: '8px',
          background: '#ffffff',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      />
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Usar el color por defecto"
        className={CLASE_CONTROL}
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: '40px',
          padding: '8px 10px',
          border: BORDE,
          borderRadius: '8px',
          fontSize: '14px',
          fontFamily: 'inherit',
          boxSizing: 'border-box',
        }}
      />
      {!!value && (
        <button
          type="button"
          onClick={() => onChange('')}
          title="Quitar el color y volver al de por defecto"
          aria-label="Quitar el color y volver al de por defecto"
          className={CLASE_ENFOCABLE}
          style={{
            width: '40px',
            height: '40px',
            border: BORDE,
            borderRadius: '8px',
            background: 'white',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

/** Campo de Puck listo para usar: `fondo: campoColor('Color de fondo')`. */
export function campoColor(label: string) {
  return {
    type: 'custom' as const,
    label,
    render: ({ value, onChange }: { value?: string; onChange: (v: string) => void }) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>{label}</span>
        <ColorPickerField value={value} onChange={onChange} />
      </div>
    ),
  };
}

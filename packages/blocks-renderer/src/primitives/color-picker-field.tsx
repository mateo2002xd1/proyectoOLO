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

export interface ColorPickerFieldProps {
  value?: string;
  onChange: (value: string) => void;
}

const HEX_VALIDO = /^#[0-9a-fA-F]{6}$/;

export function ColorPickerField({ value, onChange }: ColorPickerFieldProps) {
  // El selector visual necesita un hex de 6 dígitos siempre; si el campo de
  // texto trae otra cosa (vacío, un nombre CSS, un hex a medio escribir), se le
  // muestra blanco sin tocar lo que hay guardado en `value`.
  const hexParaElSelector = value && HEX_VALIDO.test(value) ? value : '#ffffff';

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <input
        type="color"
        value={hexParaElSelector}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Selector visual de color"
        style={{
          width: '36px',
          height: '36px',
          padding: 0,
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      />
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Usar el color por defecto"
        style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minWidth: 0 }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          title="Quitar el color y volver al de por defecto"
          style={{
            padding: '4px 8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
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
      <ColorPickerField value={value} onChange={onChange} />
    ),
  };
}

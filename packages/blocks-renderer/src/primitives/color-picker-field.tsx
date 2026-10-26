'use client';

/**
 * Selector de color para Puck: una caja con la muestra, el hex a mano y un botón para quitarlo.
 * La muestra abre el panel de color del OLO (`panel-de-color.ts`, el mismo de la herramienta
 * «Color del texto» de Editor.js) en una ventana flotante bajo la caja. Vive en el paquete
 * compartido porque no depende de nada propio de una app (a diferencia de `ImageUploaderField`,
 * que sí llama a la API de subida de cada app y por eso está duplicado en cada una).
 *
 * Vacío significa «sin color propio»: el bloque sigue el que ya trae su CSS.
 * Es el mismo criterio que `conCaja` — sin valor puesto, el bloque se pinta
 * exactamente igual que antes de que existiera el campo.
 *
 * Simetría: la muestra y el botón de quitar miden lo mismo (40 px, esquinas de
 * 8) y la caja que los envuelve lleva esquinas de 12 con 3 px de relleno, así
 * las esquinas son concéntricas. El botón de quitar reserva su sitio aunque no
 * haya color, para que la caja no cambie de forma al escribir.
 */

import { useRef, useState } from 'react';
import { EstilosDeCampos } from './estilos-de-campos';
import { PopoverDelPanelDeColor } from './popover-del-panel-de-color';

export interface ColorPickerFieldProps {
  value?: string;
  onChange: (value: string) => void;
}

const HEX_SIN_ALMOHADILLA = /^[0-9a-fA-F]{6}$/;
/**
 * Lo único que se pinta tal cual en la muestra: hex, `rgb()`/`hsl()` numéricos,
 * una variable del tema o un nombre. Lo mismo que admite la API en un campo de
 * color; así un `url(...)` escrito a mano no llega a un `background`.
 */
const COLOR_PINTABLE = /^(#[0-9a-f]{3,8}|[a-z]+|(?:rgb|hsl)a?\([\d\s.,%/-]+\)|var\(--[a-z0-9-]+\))$/i;

const BORDE = '1px solid #d1d5db';
const COLOR_TEXTO = '#333333';

/** Raya diagonal sobre blanco: «sin color propio». */
const SIN_COLOR =
  'linear-gradient(135deg, transparent calc(50% - 1px), #9ca3af calc(50% - 1px), #9ca3af calc(50% + 1px), transparent calc(50% + 1px)), #ffffff';

export function ColorPickerField({ value, onChange }: ColorPickerFieldProps) {
  const texto = value ?? '';
  const pintable = texto.trim() !== '' && COLOR_PINTABLE.test(texto.trim());
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  const muestra = useRef<HTMLButtonElement>(null);

  return (
    <>
      <EstilosDeCampos />

      <div
        ref={caja}
        className="olo-color-caja"
        data-abierto={abierto}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '3px',
          border: BORDE,
          borderRadius: '12px',
          background: '#ffffff',
          boxSizing: 'border-box',
        }}
      >
        <button
          ref={muestra}
          type="button"
          className="olo-color-muestra"
          title="Abrir el selector de color"
          aria-label="Abrir el selector de color"
          aria-haspopup="dialog"
          aria-expanded={abierto}
          onClick={() => setAbierto((a) => !a)}
          style={{
            width: '40px',
            height: '40px',
            flexShrink: 0,
            padding: 0,
            border: 0,
            borderRadius: '8px',
            background: pintable ? texto.trim() : SIN_COLOR,
            cursor: 'pointer',
          }}
        />

        <input
          type="text"
          value={texto}
          onChange={(e) => {
            // «ff0000» sin almohadilla se guarda como «#ff0000»; lo demás se guarda como se escribe.
            const escrito = e.target.value;
            onChange(HEX_SIN_ALMOHADILLA.test(escrito.trim()) ? `#${escrito.trim()}` : escrito);
          }}
          placeholder="Color por defecto"
          aria-label="Color en hexadecimal"
          spellCheck={false}
          autoComplete="off"
          className="olo-color-texto"
          style={{
            flex: 1,
            minWidth: 0,
            height: '40px',
            padding: '0 4px',
            border: 0,
            background: 'transparent',
            color: COLOR_TEXTO,
            fontSize: '14px',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />

        <button
          type="button"
          onClick={() => onChange('')}
          title="Quitar el color y volver al de por defecto"
          aria-label="Quitar el color y volver al de por defecto"
          className="olo-color-limpiar"
          style={{
            visibility: texto ? 'visible' : 'hidden',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            flexShrink: 0,
            padding: 0,
            border: 0,
            borderRadius: '8px',
            background: 'transparent',
            color: '#6b7280',
            cursor: 'pointer',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {abierto && (
        <PopoverDelPanelDeColor
          ancla={caja}
          valor={texto}
          onElegir={onChange}
          onQuitar={() => onChange('')}
          onCerrar={(devolverFoco) => {
            setAbierto(false);
            if (devolverFoco) muestra.current?.focus();
          }}
        />
      )}
    </>
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

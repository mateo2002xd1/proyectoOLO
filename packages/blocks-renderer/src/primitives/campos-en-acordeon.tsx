'use client';

/**
 * Campos de Puck en acordeón: cada opción se pliega en su propia fila, con el
 * valor actual a la vista en la cabecera, y los controles llevan borde.
 *
 * Puck no ofrece acordeones por campo, así que estos se entregan como campos
 * `custom` que pintan sus propios controles. Por eso entienden solo los tipos
 * que hoy se usan en los paneles que los adoptaron —`select`, `radio`, `text`,
 * `color` (el selector de `ColorPickerField`) y `custom`—; un `custom` interior
 * se pinta con su propio `render`, sin etiqueta, porque la etiqueta ya la pone
 * la cabecera del acordeón.
 *
 * Los estilos van en línea, como en `ColorPickerField`: este paquete no tiene
 * hoja de estilos propia y Tailwind de cada app no lo recorre.
 *
 * - `campoEnAcordeon(campo)`: un campo suelto.
 * - `campoGrupoEnAcordeones(label, campos)`: un grupo cuyo valor es un objeto
 *   (como `caja`), con un acordeón por clave.
 */

import React, { useId, useState, type ReactNode } from 'react';
import { ColorPickerField } from './color-picker-field';

// ─── Definiciones que entiende el acordeón ───────────────────────────────────
interface Opcion {
  label: string;
  value: any;
}

export type CampoDeAcordeon =
  | { type: 'select'; label: string; options: Opcion[] }
  | { type: 'radio'; label: string; options: Opcion[] }
  | { type: 'text'; label: string; placeholder?: string }
  | { type: 'color'; label: string }
  | {
      type: 'custom';
      label: string;
      render: (props: { value: any; onChange: (valor: any) => void; [clave: string]: any }) => any;
    };

export interface OpcionesDeAcordeon {
  /** Abre el acordeón al montar. Por defecto, cerrado. */
  abierto?: boolean;
  /** Texto corto de la cabecera; por defecto se deduce del valor. */
  resumen?: (valor: any) => string;
}

// ─── Estilos ─────────────────────────────────────────────────────────────────
const COLOR_BORDE = '#d1d5db';
const COLOR_TEXTO = '#333333';
const COLOR_SUAVE = '#6b7280';
const COLOR_ACENTO = '#0033a0';
const FONDO_ACENTO = '#eef3fb';

const estiloControl: React.CSSProperties = {
  width: '100%',
  minHeight: '40px',
  padding: '8px 10px',
  border: `1px solid ${COLOR_BORDE}`,
  borderRadius: '6px',
  background: '#ffffff',
  color: COLOR_TEXTO,
  fontSize: '14px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

// ─── Acordeón ────────────────────────────────────────────────────────────────
export function AcordeonDeCampo({
  etiqueta,
  resumen,
  abiertoAlInicio = false,
  children,
}: {
  etiqueta: string;
  resumen?: ReactNode;
  abiertoAlInicio?: boolean;
  children: ReactNode;
}) {
  const [abierto, setAbierto] = useState(abiertoAlInicio);
  const idContenido = useId();

  return (
    <div
      style={{
        border: `1px solid ${COLOR_BORDE}`,
        borderRadius: '8px',
        background: '#ffffff',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-controls={idContenido}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
          minHeight: '44px',
          padding: '8px 12px',
          border: 0,
          background: abierto ? '#f9fafb' : '#ffffff',
          color: COLOR_TEXTO,
          fontFamily: 'inherit',
          fontSize: '14px',
          fontWeight: 500,
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <span style={{ flex: 1, minWidth: 0 }}>{etiqueta}</span>
        {resumen != null && resumen !== '' && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              maxWidth: '45%',
              minWidth: 0,
              color: COLOR_SUAVE,
              fontSize: '13px',
              fontWeight: 400,
            }}
          >
            {typeof resumen === 'string' ? (
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resumen}</span>
            ) : (
              resumen
            )}
          </span>
        )}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{
            flexShrink: 0,
            color: COLOR_SUAVE,
            transform: abierto ? 'rotate(180deg)' : 'none',
            transition: 'transform 150ms ease',
          }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div
        id={idContenido}
        hidden={!abierto}
        style={{ padding: '12px', borderTop: `1px solid ${COLOR_BORDE}` }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Controles con borde ─────────────────────────────────────────────────────
function OpcionesSegmentadas({
  etiqueta,
  opciones,
  valor,
  onChange,
}: {
  etiqueta: string;
  opciones: Opcion[];
  valor: any;
  onChange: (valor: any) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={etiqueta}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        border: `1px solid ${COLOR_BORDE}`,
        borderRadius: '6px',
        overflow: 'hidden',
      }}
    >
      {opciones.map((opcion, i) => {
        const elegida = opcion.value === valor;
        return (
          <button
            key={String(opcion.value)}
            type="button"
            role="radio"
            aria-checked={elegida}
            onClick={() => onChange(opcion.value)}
            style={{
              flex: '1 1 auto',
              minHeight: '40px',
              padding: '8px 10px',
              border: 0,
              borderLeft: i === 0 ? 0 : `1px solid ${COLOR_BORDE}`,
              background: elegida ? FONDO_ACENTO : '#ffffff',
              color: elegida ? COLOR_ACENTO : COLOR_TEXTO,
              fontFamily: 'inherit',
              fontSize: '14px',
              fontWeight: elegida ? 500 : 400,
              cursor: 'pointer',
            }}
          >
            {opcion.label}
          </button>
        );
      })}
    </div>
  );
}

function ControlDeCampo({
  campo,
  valor,
  onChange,
  props,
}: {
  campo: CampoDeAcordeon;
  valor: any;
  onChange: (valor: any) => void;
  props?: Record<string, any>;
}) {
  switch (campo.type) {
    case 'select':
      return (
        <select
          aria-label={campo.label}
          value={valor ?? ''}
          onChange={(e) => {
            const elegida = campo.options.find((o) => String(o.value) === e.target.value);
            onChange(elegida ? elegida.value : e.target.value);
          }}
          style={{ ...estiloControl, cursor: 'pointer' }}
        >
          {campo.options.map((o) => (
            <option key={String(o.value)} value={String(o.value)}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case 'radio':
      return (
        <OpcionesSegmentadas etiqueta={campo.label} opciones={campo.options} valor={valor} onChange={onChange} />
      );
    case 'text':
      return (
        <input
          type="text"
          aria-label={campo.label}
          value={valor ?? ''}
          placeholder={campo.placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={estiloControl}
        />
      );
    case 'color':
      return <ColorPickerField value={valor} onChange={onChange} />;
    case 'custom':
      return campo.render({ ...props, value: valor, onChange });
  }
}

function resumenPorDefecto(campo: CampoDeAcordeon, valor: any): ReactNode {
  if (campo.type === 'select' || campo.type === 'radio') {
    return campo.options.find((o) => o.value === valor)?.label ?? '';
  }
  if (campo.type === 'text') return typeof valor === 'string' ? valor : '';
  if (campo.type === 'color') {
    if (!valor) return 'Por defecto';
    return (
      <>
        <span
          aria-hidden="true"
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '4px',
            border: `1px solid ${COLOR_BORDE}`,
            background: valor,
            flexShrink: 0,
          }}
        />
        {valor}
      </>
    );
  }
  return '';
}

function FilaDeAcordeon({
  campo,
  valor,
  onChange,
  opciones = {},
  props,
}: {
  campo: CampoDeAcordeon;
  valor: any;
  onChange: (valor: any) => void;
  opciones?: OpcionesDeAcordeon;
  props?: Record<string, any>;
}) {
  return (
    <AcordeonDeCampo
      etiqueta={campo.label}
      resumen={opciones.resumen ? opciones.resumen(valor) : resumenPorDefecto(campo, valor)}
      abiertoAlInicio={opciones.abierto}
    >
      <ControlDeCampo campo={campo} valor={valor} onChange={onChange} props={props} />
    </AcordeonDeCampo>
  );
}

// ─── Fábricas de campos de Puck ──────────────────────────────────────────────
/** Un campo suelto dentro de su acordeón: `imagenAlt: campoEnAcordeon({ type: 'text', label: '…' })`. */
export function campoEnAcordeon(campo: CampoDeAcordeon, opciones: OpcionesDeAcordeon = {}) {
  return {
    type: 'custom' as const,
    label: campo.label,
    render: ({ value, onChange, ...props }: { value: any; onChange: (v: any) => void; [clave: string]: any }) => (
      <FilaDeAcordeon campo={campo} valor={value} onChange={onChange} opciones={opciones} props={props} />
    ),
  };
}

/** Un grupo con valor objeto (como `caja`), un acordeón por clave bajo un título. */
export function campoGrupoEnAcordeones(label: string, campos: Record<string, CampoDeAcordeon>) {
  return {
    type: 'custom' as const,
    label,
    campos,
    render: ({ value, onChange }: { value?: Record<string, any>; onChange: (v: Record<string, any>) => void }) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: COLOR_TEXTO }}>{label}</span>
        {Object.entries(campos).map(([clave, campo]) => (
          <FilaDeAcordeon
            key={clave}
            campo={campo}
            valor={value?.[clave]}
            onChange={(v) => onChange({ ...(value ?? {}), [clave]: v })}
          />
        ))}
      </div>
    ),
  };
}

'use client';

import { useRef, useState, useEffect, useLayoutEffect } from 'react';

interface CampoDescripcionConVariablesProps {
  value?: string;
  onChange: (value: string) => void;
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function CampoDescripcionConVariables({
  value,
  onChange,
}: CampoDescripcionConVariablesProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cursorRef = useRef<{ start: number; end: number } | null>(null);

  // Estado local para evitar el salto del cursor al final al editar o borrar texto
  const [textoLocal, setTextoLocal] = useState<string>(value ?? '');

  // Sincronizar si cambia externamente (ej. cambio de componente o reset)
  useEffect(() => {
    if (value !== undefined && value !== textoLocal) {
      setTextoLocal(value);
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  // Restaurar la posición del cursor de forma síncrona en el DOM tras la reconciliación de React
  useIsomorphicLayoutEffect(() => {
    if (cursorRef.current && textareaRef.current) {
      const { start, end } = cursorRef.current;
      if (document.activeElement === textareaRef.current) {
        textareaRef.current.setSelectionRange(start, end);
      }
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const nuevo = target.value;

    cursorRef.current = { start, end };
    setTextoLocal(nuevo);
    onChange(nuevo);
  };

  const handleSelectionChange = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    cursorRef.current = {
      start: target.selectionStart,
      end: target.selectionEnd,
    };
  };

  const insertarToken = (token: string) => {
    const el = textareaRef.current;
    const actual = textoLocal;

    if (!el) {
      const nuevo = (actual ? actual + ' ' : '') + token;
      cursorRef.current = { start: nuevo.length, end: nuevo.length };
      setTextoLocal(nuevo);
      onChange(nuevo);
      return;
    }

    const start = el.selectionStart ?? actual.length;
    const end = el.selectionEnd ?? actual.length;
    const nuevo = actual.substring(0, start) + token + actual.substring(end);
    const nuevaPos = start + token.length;

    cursorRef.current = { start: nuevaPos, end: nuevaPos };
    setTextoLocal(nuevo);
    onChange(nuevo);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(nuevaPos, nuevaPos);
    }, 10);
  };

  const tokens = [
    {
      label: 'Total proyectos del departamento',
      token: '{proyectos}',
    },
    {
      label: '% Participación del departamento',
      token: '{porcentaje}%',
    },
    {
      label: 'Total nacional de proyectos',
      token: '{totalNacional}',
    },
    {
      label: 'Nombre del departamento',
      token: '{departamento}',
    },
    {
      label: 'Fuentes de información',
      token: '{fuentes}',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '10px' }}>
      {/* Cabecera idéntica a Puck: usa clases nativas _Input-label y _Input-labelIcon */}
      <div
        className="_Input-label_qyenz_5"
        style={{
          display: 'flex',
          alignItems: 'center',
          color: 'var(--puck-field-label-color-text, var(--puck-color-text-secondary, #5a5a5a))',
          fontSize: 'var(--puck-field-label-font-size, var(--puck-font-size-xxs, 14px))',
          fontWeight: 'var(--puck-field-label-font-weight, 600)',
          fontFamily: 'var(--puck-font-family, inherit)',
          lineHeight: '1.2',
        }}
      >
        <div
          className="_Input-labelIcon_qyenz_17"
          style={{
            color: 'var(--puck-field-label-color-icon, var(--puck-color-text-subtle, #ababab))',
            display: 'flex',
            alignItems: 'center',
            marginInlineEnd: 'var(--puck-space-1, 4px)',
            paddingInlineStart: 'var(--puck-space-1, 4px)',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="4 7 4 4 20 4 20 7" />
            <line x1="9" y1="20" x2="15" y2="20" />
            <line x1="12" y1="4" x2="12" y2="20" />
          </svg>
        </div>
        <span>Descripción info departamento</span>
      </div>

      {/* Botones de variables dinámicas más entendibles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--puck-color-text-secondary, #5a5a5a)',
            fontFamily: 'var(--puck-font-family, inherit)',
          }}
        >
          <span>Insertar datos (clic o arrastrar):</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {tokens.map((t) => (
            <button
              key={t.token}
              type="button"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', t.token);
              }}
              onClick={() => insertarToken(t.token)}
              title={`Clic para insertar ${t.token} o arrástralo al texto`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 11px',
                fontSize: '13px',
                fontFamily: 'var(--puck-font-family, inherit)',
                fontWeight: 500,
                color: 'var(--puck-color-text, #181818)',
                backgroundColor: 'var(--puck-color-surface, #ffffff)',
                border: '1px solid var(--puck-color-border, #dcdcdc)',
                borderRadius: 'var(--puck-radius-m, 4px)',
                cursor: 'pointer',
                userSelect: 'none',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--puck-color-surface-muted, #f5f5f5)';
                e.currentTarget.style.borderColor = 'var(--puck-color-border-hover, #767676)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--puck-color-surface, #ffffff)';
                e.currentTarget.style.borderColor = 'var(--puck-color-border, #dcdcdc)';
              }}
            >
              <span
                style={{
                  color: 'var(--puck-color-interactive, #0158ad)',
                  fontWeight: 700,
                  fontSize: '14px',
                  lineHeight: 1,
                }}
              >
                +
              </span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Textarea con control de cursor y clase nativa _Input-input de Puck */}
      <textarea
        ref={textareaRef}
        className="_Input-input_qyenz_29"
        value={textoLocal}
        onChange={handleChange}
        onSelect={handleSelectionChange}
        onClick={handleSelectionChange}
        onKeyUp={handleSelectionChange}
        rows={4}
        placeholder="Escribe la descripción..."
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '10px 14px',
          border: '1px solid var(--puck-field-color-border, var(--puck-color-border, #dcdcdc))',
          borderRadius: 'var(--puck-field-radius, var(--puck-radius-m, 4px))',
          backgroundColor: 'var(--puck-field-color-bg, var(--puck-color-surface, #ffffff))',
          fontSize: 'var(--puck-field-font-size, var(--puck-font-size-xxs, 14px))',
          fontFamily: 'var(--puck-font-family, inherit)',
          color: 'var(--puck-field-color-text, var(--puck-color-text, #181818))',
          lineHeight: '1.5',
          minHeight: '85px',
          resize: 'vertical',
          outline: 'none',
        }}
      />
    </div>
  );
}

'use client';

import React from 'react';

export interface IconoDelCatalogo {
  id: string;
  nombre: string;
  ruta?: string;
  tipo: 'svg-path' | 'archivo';
}

export interface IconSelectorFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Íconos que se ofrecen. Por defecto, `ICONOS_DISPONIBLES`. */
  catalogo?: IconoDelCatalogo[];
  /** Muestra el campo para escribir una ruta o URL a mano. Por defecto, sí. */
  permitirRuta?: boolean;
}

// Catálogo de íconos disponibles: Mantiene intactos los 4 existentes e incorpora los sectoriales y utilitarios
export const ICONOS_DISPONIBLES: IconoDelCatalogo[] = [
  { id: '', nombre: 'Ninguno', tipo: 'archivo', ruta: '' },
  // ─── Íconos existentes en /assets/svg/ (100% compatibles) ───
  { id: '/assets/svg/icono-1.svg', nombre: 'Lista', tipo: 'archivo', ruta: '/assets/svg/icono-1.svg' },
  { id: '/assets/svg/icono-2.svg', nombre: 'Maletín', tipo: 'archivo', ruta: '/assets/svg/icono-2.svg' },
  { id: '/assets/svg/icono-3.svg', nombre: 'Bombilla', tipo: 'archivo', ruta: '/assets/svg/icono-3.svg' },
  { id: '/assets/svg/icono-4.svg', nombre: 'Calidad / Pulgar', tipo: 'archivo', ruta: '/assets/svg/icono-4.svg' },
  { id: '/assets/svg/logo-sena.svg', nombre: 'Logo SENA', tipo: 'archivo', ruta: '/assets/svg/logo-sena.svg' },

  // ─── Íconos sectoriales (Referencia institucional OLO) ───
  { id: 'acuicola', nombre: 'Acuícola (Peces)', tipo: 'svg-path' },
  { id: 'justicia', nombre: 'Justicia (Mazo)', tipo: 'svg-path' },
  { id: 'agua', nombre: 'Agua potable', tipo: 'svg-path' },
  { id: 'artes-escenicas', nombre: 'Artes escénicas', tipo: 'svg-path' },
  { id: 'artesanias', nombre: 'Artesanías', tipo: 'svg-path' },
  { id: 'azucar-biocombustibles', nombre: 'Azúcar y Biocombustibles', tipo: 'svg-path' },
  { id: 'audiovisual', nombre: 'Audiovisual', tipo: 'svg-path' },
  { id: 'automatizacion', nombre: 'Automatización (Robótica)', tipo: 'svg-path' },
  { id: 'automotriz', nombre: 'Automotriz', tipo: 'svg-path' },

  // ─── Íconos utilitarios ───
  { id: 'descarga', nombre: 'Descargar archivo', tipo: 'svg-path' },
  { id: 'enlace', nombre: 'Enlace externo', tipo: 'svg-path' },
  { id: 'documento', nombre: 'Documento / PDF', tipo: 'svg-path' },
];

/**
 * Renderiza el vector SVG correspondiente al identificador o ruta indicada.
 */
export function IconoRenderer({
  icono,
  color = 'currentColor',
  size = 24,
  className = '',
  style,
}: {
  icono?: string;
  color?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (!icono) return null;

  // Si es el logo del SENA u otro recurso multicolor o externo
  if (icono.includes('logo-sena') || icono.startsWith('http')) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={icono}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        className={className}
        style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain', display: 'inline-block', flexShrink: 0, ...style }}
      />
    );
  }

  // Si es un archivo SVG local monocromático (/assets/svg/icono-1.svg, etc.), usar máscara para que tome exactamente el color del texto
  if (icono.startsWith('/')) {
    return (
      <span
        aria-hidden="true"
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color || '#002237',
          maskImage: `url("${icono}")`,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskImage: `url("${icono}")`,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          display: 'inline-block',
          flexShrink: 0,
          ...style,
        }}
      />
    );
  }

  const propsSvg = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    style: { flexShrink: 0, display: 'inline-block', ...style },
    'aria-hidden': true,
  };

  switch (icono) {
    case 'acuicola':
      return (
        <svg {...propsSvg} fill="currentColor" stroke="none">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.93c-2.48-.37-4.43-2.32-4.8-4.8H13v4.8zm-2-9.86c2.48.37 4.43 2.32 4.8 4.8H11V7.07zM5.5 12c0-3.21 2.34-5.88 5.4-6.4v3.52c-1.39.38-2.52 1.51-2.9 2.88H5.5zm13 0h-2.5c-.38-1.37-1.51-2.5-2.9-2.88V5.6c3.06.52 5.4 3.19 5.4 6.4z" />
        </svg>
      );
    case 'justicia':
      return (
        <svg {...propsSvg} fill="none" stroke="currentColor">
          <path d="m14 13-7.5 7.5a2.12 2.12 0 1 1-3-3L11 10" />
          <path d="m16 16 6-6" />
          <path d="m8 8 6-6" />
          <path d="m9 7 8 8" />
          <path d="m21 11-8-8" />
          <rect x="2" y="20" width="20" height="2" rx="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'agua':
      return (
        <svg {...propsSvg} fill="none" stroke="currentColor">
          <path d="M6 10h12" />
          <path d="M6 6h6v4" />
          <path d="M12 4v2" />
          <path d="M8 14v6a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-6" />
          <path d="M7 16h10" />
        </svg>
      );
    case 'artes-escenicas':
      return (
        <svg {...propsSvg} fill="none" stroke="currentColor">
          <circle cx="9" cy="9" r="6" />
          <path d="M7 8h.01M11 8h.01" />
          <path d="M7 11c.7 1 1.7 1 2 1s1.3 0 2-1" />
          <circle cx="16" cy="14" r="5" />
          <path d="M14.5 13h.01M17.5 13h.01" />
          <path d="M14.5 16c.5-.7 1.5-.7 1.7-.7s1.2 0 1.8.7" />
        </svg>
      );
    case 'artesanias':
      return (
        <svg {...propsSvg} fill="none" stroke="currentColor">
          <ellipse cx="12" cy="7" rx="9" ry="3" />
          <path d="M3 7c0 5 4 9 9 9s9-4 9-9" />
          <path d="M6 16v4M12 16v5M18 16v4" />
        </svg>
      );
    case 'azucar-biocombustibles':
      return (
        <svg {...propsSvg} fill="none" stroke="currentColor">
          <rect x="3" y="5" width="10" height="15" rx="2" />
          <path d="M3 11h10" />
          <path d="M13 8l3-2v10a2 2 0 0 0 2 2h1" />
          <circle cx="8" cy="15" r="1.5" fill="currentColor" />
        </svg>
      );
    case 'audiovisual':
      return (
        <svg {...propsSvg} fill="none" stroke="currentColor">
          <rect x="2" y="3" width="13" height="11" rx="2" />
          <circle cx="16" cy="16" r="5" />
          <path d="M16 14v4l3-2-3-2z" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'automatizacion':
      return (
        <svg {...propsSvg} fill="none" stroke="currentColor">
          <rect x="6" y="19" width="12" height="3" rx="1" fill="currentColor" stroke="none" />
          <path d="M12 19V14" />
          <circle cx="12" cy="14" r="2" />
          <path d="m13.5 12.5 4-4" />
          <circle cx="17.5" cy="8.5" r="2" />
          <path d="m19 7 2-2M16 5.5l2-2" />
        </svg>
      );
    case 'automotriz':
      return (
        <svg {...propsSvg} fill="none" stroke="currentColor">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10l-2-4H10L8 10s-2.7.6-4.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <circle cx="17" cy="17" r="2" />
        </svg>
      );
    case 'descarga':
      return (
        <svg {...propsSvg} fill="none" stroke="currentColor">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      );
    case 'enlace':
      return (
        <svg {...propsSvg} fill="none" stroke="currentColor">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      );
    case 'documento':
      return (
        <svg {...propsSvg} fill="none" stroke="currentColor">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    default:
      return null;
  }
}

export function IconSelectorField({
  value,
  onChange,
  catalogo = ICONOS_DISPONIBLES,
  permitirRuta = true,
}: IconSelectorFieldProps) {
  const [personalizado, setPersonalizado] = React.useState(
    value && !catalogo.some((i) => i.id === value) ? value : ''
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '180px', overflowY: 'auto', padding: '4px', border: '1px solid #e5e7eb', borderRadius: '6px', backgroundColor: '#f9fafb' }}>
        {catalogo.map((icono) => {
          const seleccionado = value === icono.id;
          return (
            <button
              key={icono.id || 'ninguno'}
              type="button"
              onClick={() => {
                onChange(icono.id);
                setPersonalizado('');
              }}
              title={icono.nombre}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '6px',
                backgroundColor: seleccionado ? '#e0f2fe' : '#ffffff',
                border: seleccionado ? '2px solid #0284c7' : '1px solid #d1d5db',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                transition: 'all 0.15s ease',
              }}
              aria-label={`Seleccionar icono ${icono.nombre}`}
              aria-pressed={seleccionado}
            >
              {icono.id ? (
                <IconoRenderer icono={icono.id} size={20} color={seleccionado ? '#0284c7' : '#4b5563'} />
              ) : (
                <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>Ø</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Opción de ruta o URL personalizada */}
      {permitirRuta && (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <input
            type="text"
            value={personalizado}
            placeholder="O escribe ruta de ícono (/assets/... o URL)"
            onChange={(e) => {
              const val = e.target.value;
              setPersonalizado(val);
              onChange(val);
            }}
            style={{
              flex: 1,
              padding: '6px 10px',
              fontSize: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              outline: 'none',
            }}
          />
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setPersonalizado('');
              }}
              title="Quitar ícono"
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                background: '#fee2e2',
                color: '#b91c1c',
                border: '1px solid #fca5a5',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Quitar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export const campoIcono = (label: string) => ({
  type: 'custom' as const,
  label,
  render: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{label}</span>
      <IconSelectorField value={value} onChange={onChange} />
    </div>
  ),
});

import React from 'react';

export interface IconoBloqueProps {
  icono?: string;
  colorIcono?: string;
  texto?: string;
  tamanoTexto?: string;
  colorTexto?: string;
}

export function IconoBloque({ icono, colorIcono, texto, tamanoTexto = '1rem', colorTexto = '#333' }: IconoBloqueProps) {
  if (!icono) {
    return (
      <div style={{ padding: '20px', border: '1px dashed #ccc', textAlign: 'center', color: '#999', width: '100%' }}>
        Selecciona un icono en el panel derecho
      </div>
    );
  }

  return (
    <div className="olo-icono-bloque" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: '64px',
            height: '64px',
            backgroundColor: colorIcono || 'currentColor',
            maskImage: `url(${icono})`,
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskImage: `url(${icono})`,
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
          }}
        />
        {texto && <span style={{ fontSize: tamanoTexto, color: colorTexto, textAlign: 'center' }}>{texto}</span>}
      </div>
    </div>
  );
}

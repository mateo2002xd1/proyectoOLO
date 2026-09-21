'use client';

import React, { useState } from 'react';
import { usePaginaEnEdicion, useRegistrarSubida } from './pagina-en-edicion-context';
import { formatearBytes } from './formato-archivos';

export interface DestinoBotonConfig {
  tipo: 'enlace' | 'archivo' | 'ninguno';
  urlEnlace?: string;
  abrirNuevaPestana?: boolean;
  urlArchivo?: string;
  nombreArchivo?: string;
  pesoArchivo?: string;
}

interface SelectorDestinoBotonFieldProps {
  value?: DestinoBotonConfig;
  onChange: (value: DestinoBotonConfig) => void;
}

export function SelectorDestinoBotonField({ value, onChange }: SelectorDestinoBotonFieldProps) {
  const slug = usePaginaEnEdicion();
  const registrarSubida = useRegistrarSubida();

  const config: DestinoBotonConfig = {
    tipo: value?.tipo || 'enlace',
    urlEnlace: value?.urlEnlace || '',
    abrirNuevaPestana: value?.abrirNuevaPestana ?? false,
    urlArchivo: value?.urlArchivo || '',
    nombreArchivo: value?.nombreArchivo || '',
    pesoArchivo: value?.pesoArchivo || '',
  };

  const [subiendo, setSubiendo] = useState(false);
  const [errorSubida, setErrorSubida] = useState<string | null>(null);

  const cambiarTipo = (nuevoTipo: 'enlace' | 'archivo' | 'ninguno') => {
    onChange({
      ...config,
      tipo: nuevoTipo,
    });
  };

  const alSubirArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    setSubiendo(true);
    setErrorSubida(null);

    const formData = new FormData();
    formData.append('file', archivo);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        let mensaje = 'Error al subir el archivo';
        try {
          const errData = await res.json();
          if (errData.error) mensaje = errData.error;
        } catch (_) {}
        throw new Error(mensaje);
      }

      const data = await res.json();
      const pesoFormateado = data.pesoFormateado || (archivo.size ? formatearBytes(archivo.size) : undefined);
      onChange({
        ...config,
        tipo: 'archivo',
        urlArchivo: data.url,
        nombreArchivo: archivo.name,
        pesoArchivo: pesoFormateado,
      });

      // Anota la subida pendiente según las normas establecidas
      if (registrarSubida) {
        void registrarSubida(data.url);
      } else if (slug) {
        void fetch(`/api/paginas/${encodeURIComponent(slug)}/subidas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ruta: data.url }),
          credentials: 'include',
        }).catch(() => undefined);
      }
    } catch (err) {
      setErrorSubida(err instanceof Error ? err.message : 'Error desconocido al subir el archivo');
    } finally {
      setSubiendo(false);
      e.target.value = '';
    }
  };

  const nombreVisible = config.nombreArchivo || (config.urlArchivo ? config.urlArchivo.split('/').pop() : '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
      {/* Selector de modo: Enlace vs Archivo vs Ninguno */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '4px',
          background: '#f3f4f6',
          padding: '3px',
          borderRadius: '6px',
        }}
      >
        <button
          type="button"
          onClick={() => cambiarTipo('enlace')}
          style={{
            padding: '6px 8px',
            fontSize: '12px',
            fontWeight: config.tipo === 'enlace' ? 600 : 400,
            borderRadius: '4px',
            border: 'none',
            background: config.tipo === 'enlace' ? '#ffffff' : 'transparent',
            color: config.tipo === 'enlace' ? '#002237' : '#4b5563',
            boxShadow: config.tipo === 'enlace' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            cursor: 'pointer',
          }}
        >
          Enlace URL
        </button>

        <button
          type="button"
          onClick={() => cambiarTipo('archivo')}
          style={{
            padding: '6px 8px',
            fontSize: '12px',
            fontWeight: config.tipo === 'archivo' ? 600 : 400,
            borderRadius: '4px',
            border: 'none',
            background: config.tipo === 'archivo' ? '#ffffff' : 'transparent',
            color: config.tipo === 'archivo' ? '#002237' : '#4b5563',
            boxShadow: config.tipo === 'archivo' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            cursor: 'pointer',
          }}
        >
          Archivo
        </button>

        <button
          type="button"
          onClick={() => cambiarTipo('ninguno')}
          style={{
            padding: '6px 8px',
            fontSize: '12px',
            fontWeight: config.tipo === 'ninguno' ? 600 : 400,
            borderRadius: '4px',
            border: 'none',
            background: config.tipo === 'ninguno' ? '#ffffff' : 'transparent',
            color: config.tipo === 'ninguno' ? '#002237' : '#4b5563',
            boxShadow: config.tipo === 'ninguno' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            cursor: 'pointer',
          }}
        >
          Sin acción
        </button>
      </div>

      {/* Modo: Enlace */}
      {config.tipo === 'enlace' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            type="text"
            value={config.urlEnlace || ''}
            onChange={(e) => onChange({ ...config, urlEnlace: e.target.value })}
            placeholder="https://ejemplo.com o /ruta-interna"
            style={{
              padding: '7px 10px',
              fontSize: '13px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              outline: 'none',
            }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#4b5563', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={Boolean(config.abrirNuevaPestana)}
              onChange={(e) => onChange({ ...config, abrirNuevaPestana: e.target.checked })}
            />
            Abrir enlace en una nueva pestaña
          </label>
        </div>
      )}

      {/* Modo: Archivo */}
      {config.tipo === 'archivo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Mensaje informativo idéntico al de pestañas cuando se configura un archivo */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px dashed #cbd5e1',
              background: '#f8fafc',
              fontSize: '12px',
              color: '#475569',
              lineHeight: 1.4,
            }}
          >
            <div style={{ fontWeight: 600, color: '#002237', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Botón configurado para descarga de archivo
            </div>
            <div style={{ color: '#4b5563', fontSize: '12px' }}>
              Archivo adjunto:{' '}
              {config.urlArchivo ? (
                <span style={{ color: '#0033a0', fontWeight: 600, wordBreak: 'break-all' }}>
                  {config.nombreArchivo || config.urlArchivo}
                  {config.pesoArchivo ? ` (${config.pesoArchivo})` : ''}
                </span>
              ) : (
                <span style={{ color: '#9ca3af' }}>(Sin archivo subido en el panel lateral)</span>
              )}
            </div>
            <div style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>
              Al hacer clic en el botón se descargará directamente este archivo y se mostrará la notificación en pantalla.
            </div>
          </div>

          {config.urlArchivo ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '6px',
                fontSize: '12px',
              }}
            >
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '8px' }}>
                <span style={{ fontWeight: 600, color: '#166534' }}>Archivo vinculado:</span>{' '}
                <span style={{ color: '#374151' }}>
                  {nombreVisible}
                  {config.pesoArchivo ? ` (${config.pesoArchivo})` : ''}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onChange({ ...config, urlArchivo: '', nombreArchivo: '', pesoArchivo: undefined })}
                style={{
                  padding: '2px 6px',
                  background: '#fee2e2',
                  color: '#b91c1c',
                  border: '1px solid #fca5a5',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                Quitar
              </button>
            </div>
          ) : null}

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 12px',
                background: '#002237',
                color: '#ffffff',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: subiendo ? 'wait' : 'pointer',
                opacity: subiendo ? 0.7 : 1,
              }}
            >
              {subiendo ? 'Subiendo archivo...' : 'Subir archivo'}
              <input
                type="file"
                disabled={subiendo}
                onChange={alSubirArchivo}
                style={{ display: 'none' }}
              />
            </label>
            <input
              type="text"
              value={config.urlArchivo || ''}
              onChange={(e) => onChange({ ...config, urlArchivo: e.target.value })}
              placeholder="O escribe la ruta /storage/..."
              style={{
                flex: 1,
                padding: '6px 10px',
                fontSize: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                outline: 'none',
              }}
            />
          </div>

          {errorSubida && (
            <p style={{ margin: 0, fontSize: '11px', color: '#b91c1c' }}>{errorSubida}</p>
          )}
        </div>
      )}
    </div>
  );
}

export const campoDestinoBoton = (label = 'Destino del botón') => ({
  type: 'custom' as const,
  label,
  render: ({ value, onChange }: { value?: DestinoBotonConfig; onChange: (v: DestinoBotonConfig) => void }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{label}</span>
      <SelectorDestinoBotonField value={value} onChange={onChange} />
    </div>
  ),
});

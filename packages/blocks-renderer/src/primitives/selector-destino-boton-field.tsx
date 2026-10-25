'use client';

import React, { useState } from 'react';
import { usePaginaEnEdicion, useRegistrarSubida } from './pagina-en-edicion-context';
import { formatearBytes } from './formato-archivos';
import { campoEnAcordeon, Interruptor } from './campos-en-acordeon';
import { CLASE_CONTROL, CLASE_ENFOCABLE, EstilosDeCampos } from './estilos-de-campos';

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

  const nombreVisible =
    config.nombreArchivo ||
    (config.urlArchivo ? decodeURIComponent(config.urlArchivo.split('?')[0].split('/').pop() ?? '') : '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <EstilosDeCampos />
      {/* Selector de modo: Enlace vs Archivo vs Ninguno (mismas medidas que los demás controles del panel: 8 de esquina, 40 de alto) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '4px',
          background: '#f3f4f6',
          padding: '3px',
          borderRadius: '8px',
          border: '1px solid #d1d5db',
          boxSizing: 'border-box',
        }}
      >
        <button
          type="button"
          className={CLASE_ENFOCABLE}
          onClick={() => cambiarTipo('enlace')}
          style={{
            minHeight: '32px',
            padding: '6px 8px',
            fontSize: '13px',
            fontWeight: config.tipo === 'enlace' ? 600 : 400,
            borderRadius: '6px',
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
          className={CLASE_ENFOCABLE}
          onClick={() => cambiarTipo('archivo')}
          style={{
            minHeight: '32px',
            padding: '6px 8px',
            fontSize: '13px',
            fontWeight: config.tipo === 'archivo' ? 600 : 400,
            borderRadius: '6px',
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
          className={CLASE_ENFOCABLE}
          onClick={() => cambiarTipo('ninguno')}
          style={{
            minHeight: '32px',
            padding: '6px 8px',
            fontSize: '13px',
            fontWeight: config.tipo === 'ninguno' ? 600 : 400,
            borderRadius: '6px',
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
            aria-label="Dirección del enlace"
            className={CLASE_CONTROL}
            style={{
              width: '100%',
              minHeight: '40px',
              padding: '8px 10px',
              fontSize: '14px',
              fontFamily: 'inherit',
              color: '#333333',
              background: '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              boxSizing: 'border-box',
            }}
          />
          <Interruptor
            etiqueta="Abrir enlace en una nueva pestaña"
            encendido={Boolean(config.abrirNuevaPestana)}
            onChange={(encendido) => onChange({ ...config, abrirNuevaPestana: encendido })}
            textoSi="Abrir enlace en una nueva pestaña"
            textoNo="Abrir enlace en una nueva pestaña"
          />
        </div>
      )}

      {/* Modo: Archivo */}
      {config.tipo === 'archivo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Información del archivo adjunto */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px dashed #cbd5e1',
              background: '#f8fafc',
              fontSize: '12px',
              color: '#475569',
              lineHeight: 1.4,
            }}
          >
            <div style={{ color: '#4b5563', fontSize: '12px' }}>
              Archivo adjunto:{' '}
              {config.urlArchivo ? (
                <span style={{ color: '#0033a0', fontWeight: 600, wordBreak: 'break-all' }}>
                  {nombreVisible}
                  {config.pesoArchivo ? ` (${config.pesoArchivo})` : ''}
                </span>
              ) : (
                <span style={{ color: '#9ca3af' }}>(Sin archivo subido en el panel lateral)</span>
              )}
            </div>
          </div>


          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '40px',
                padding: '8px 14px',
                background: '#002237',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: subiendo ? 'wait' : 'pointer',
                opacity: subiendo ? 0.7 : 1,
                width: '100%',
                boxSizing: 'border-box',
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

/**
 * El mismo selector dentro de su acordeón, con su línea de ayuda. La cabecera ya dice
 * «Destino del botón», así que no se repite la etiqueta que lleva `campoDestinoBoton`.
 */
export const campoDestinoBotonEnAcordeon = (label = 'Destino del botón', ayuda?: string) =>
  campoEnAcordeon(
    {
      type: 'custom',
      label,
      ayuda,
      render: ({ value, onChange }) => <SelectorDestinoBotonField value={value} onChange={onChange} />,
    },
    {
      resumen: (valor: DestinoBotonConfig | undefined) =>
        valor?.tipo === 'archivo'
          ? 'Archivo'
          : valor?.tipo === 'ninguno'
          ? 'Sin acción'
          : valor?.urlEnlace || 'Sin dirección',
    }
  );

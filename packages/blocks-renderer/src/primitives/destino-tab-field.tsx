'use client';

import React, { useState } from 'react';
import { usePaginaEnEdicion, useRegistrarSubida } from './pagina-en-edicion-context';
import { formatearBytes } from './formato-archivos';

export interface DestinoTabConfig {
  tipo: 'contenido' | 'enlace' | 'archivo';
  urlEnlace?: string;
  abrirNuevaPestana?: 'si' | 'no';
  urlArchivo?: string;
  nombreArchivo?: string;
  pesoArchivo?: string;
}

interface DestinoTabFieldProps {
  value?: DestinoTabConfig;
  onChange: (value: DestinoTabConfig) => void;
  slotId?: string;
}

/**
 * Comprueba si la pestaña activa en el lienzo de Puck contiene actualmente bloques o componentes.
 */
function verificarSiPestanaActivaTieneContenido(): boolean {
  if (typeof document === 'undefined') return false;

  // 1. Buscar en iframes de Puck (donde reside el canvas de previsualización)
  const iframes = Array.from(document.querySelectorAll('iframe'));
  for (const iframe of iframes) {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        const paneles = Array.from(doc.querySelectorAll('[role="tabpanel"]'));
        for (const panel of paneles) {
          const estilo = window.getComputedStyle(panel);
          if (estilo.display !== 'none' && panel.querySelector('[data-puck-component]')) {
            return true;
          }
        }
      }
    } catch (_) {}
  }

  // 2. Buscar en el documento principal
  const paneles = Array.from(document.querySelectorAll('[role="tabpanel"]'));
  for (const panel of paneles) {
    const estilo = window.getComputedStyle(panel);
    if (estilo.display !== 'none' && panel.querySelector('[data-puck-component]')) {
      return true;
    }
  }

  return false;
}

/**
 * Campo de configuración del destino de la pestaña alineado a los estándares de Intranet.
 * Utiliza los estilos de formulario, colores (#0033a0) y botones existentes en intranet.
 */
export function DestinoTabField({ value, onChange }: DestinoTabFieldProps) {
  const slug = usePaginaEnEdicion();
  const registrarSubida = useRegistrarSubida();

  const config: DestinoTabConfig = {
    tipo: value?.tipo || 'contenido',
    urlEnlace: value?.urlEnlace || '',
    abrirNuevaPestana: value?.abrirNuevaPestana || 'si',
    urlArchivo: value?.urlArchivo || '',
    nombreArchivo: value?.nombreArchivo || '',
    pesoArchivo: value?.pesoArchivo || '',
  };

  const [subiendo, setSubiendo] = useState(false);
  const [errorSubida, setErrorSubida] = useState<string | null>(null);

  const cambiarTipo = (nuevoTipo: 'contenido' | 'enlace' | 'archivo') => {
    if (nuevoTipo === config.tipo) return;

    if (config.tipo === 'contenido' && (nuevoTipo === 'archivo' || nuevoTipo === 'enlace')) {
      const tieneBloques = verificarSiPestanaActivaTieneContenido();
      if (tieneBloques) {
        const confirmar = window.confirm(
          'Atención: Esta pestaña ya contiene bloques agregados.\n' +
            'Si cambia el tipo a ' +
            (nuevoTipo === 'archivo' ? 'descarga de archivo' : 'hipervínculo') +
            ', ese contenido no se mostrará en la página.\n\n' +
            '¿Desea continuar?'
        );
        if (!confirmar) {
          return;
        }
      }
    }

    onChange({
      ...config,
      tipo: nuevoTipo,
    });
  };

  const alSubirArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    if (config.tipo === 'contenido') {
      const tieneBloques = verificarSiPestanaActivaTieneContenido();
      if (tieneBloques) {
        const confirmar = window.confirm(
          'Atención: Esta pestaña ya contiene bloques agregados.\n' +
            'Al agregar un archivo para descargar, ese contenido no se mostrará en la página.\n\n' +
            '¿Desea continuar?'
        );
        if (!confirmar) {
          e.target.value = '';
          return;
        }
      }
    }

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

  const nombreVisible = config.nombreArchivo || (config.urlArchivo
    ? decodeURIComponent(config.urlArchivo.split('/').pop() ?? '')
    : '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
      <label style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
        Tipo de destino
      </label>

      {/* Selector de 3 opciones en estilo nativo intranet */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '4px',
          background: '#f3f4f6',
          padding: '3px',
          borderRadius: '4px',
        }}
      >
        <button
          type="button"
          onClick={() => cambiarTipo('contenido')}
          style={{
            padding: '6px 8px',
            fontSize: '12px',
            fontWeight: config.tipo === 'contenido' ? 600 : 400,
            borderRadius: '4px',
            border: config.tipo === 'contenido' ? '1px solid #d1d5db' : 'none',
            cursor: 'pointer',
            textAlign: 'center',
            background: config.tipo === 'contenido' ? '#ffffff' : 'transparent',
            color: config.tipo === 'contenido' ? '#0033a0' : '#4b5563',
          }}
        >
          Contenido
        </button>

        <button
          type="button"
          onClick={() => cambiarTipo('enlace')}
          style={{
            padding: '6px 8px',
            fontSize: '12px',
            fontWeight: config.tipo === 'enlace' ? 600 : 400,
            borderRadius: '4px',
            border: config.tipo === 'enlace' ? '1px solid #d1d5db' : 'none',
            cursor: 'pointer',
            textAlign: 'center',
            background: config.tipo === 'enlace' ? '#ffffff' : 'transparent',
            color: config.tipo === 'enlace' ? '#0033a0' : '#4b5563',
          }}
        >
          Enlace
        </button>

        <button
          type="button"
          onClick={() => cambiarTipo('archivo')}
          style={{
            padding: '6px 8px',
            fontSize: '12px',
            fontWeight: config.tipo === 'archivo' ? 600 : 400,
            borderRadius: '4px',
            border: config.tipo === 'archivo' ? '1px solid #d1d5db' : 'none',
            cursor: 'pointer',
            textAlign: 'center',
            background: config.tipo === 'archivo' ? '#ffffff' : 'transparent',
            color: config.tipo === 'archivo' ? '#0033a0' : '#4b5563',
          }}
        >
          Archivo
        </button>
      </div>

      {/* Modo: Hipervínculo */}
      {config.tipo === 'enlace' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
              URL
            </label>
            <input
              type="text"
              value={config.urlEnlace || ''}
              placeholder="https://..."
              onChange={(e) =>
                onChange({
                  ...config,
                  urlEnlace: e.target.value,
                })
              }
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '13px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
              Abrir en nueva pestaña
            </label>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#374151' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="abrirNuevaPestana"
                  checked={config.abrirNuevaPestana !== 'no'}
                  onChange={() => onChange({ ...config, abrirNuevaPestana: 'si' })}
                />
                Sí
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="abrirNuevaPestana"
                  checked={config.abrirNuevaPestana === 'no'}
                  onChange={() => onChange({ ...config, abrirNuevaPestana: 'no' })}
                />
                No
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Modo: Descarga de archivo (Idéntico a ArchivoUploaderField de intranet) */}
      {config.tipo === 'archivo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

          {nombreVisible && (
            <div style={{ fontSize: '12px', color: '#4b5563', wordBreak: 'break-all' }}>
              <span>
                Archivo actual: {nombreVisible}
                {config.pesoArchivo ? ` (${config.pesoArchivo})` : ''}
              </span>
            </div>
          )}

          <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block', width: '100%' }}>
            <button
              type="button"
              disabled={subiendo}
              style={{
                padding: '8px 16px',
                backgroundColor: '#0033a0',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: subiendo ? 'not-allowed' : 'pointer',
                opacity: subiendo ? 0.7 : 1,
                width: '100%',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {subiendo ? 'Subiendo archivo...' : 'Subir archivo'}
            </button>
            <input
              type="file"
              accept=".pptx,.ppt,.pdf,.xlsx,.xls,.docx,.doc,.zip,.rar"
              onChange={alSubirArchivo}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
              }}
            />
          </div>

          {errorSubida && <span style={{ color: 'red', fontSize: '12px' }}>{errorSubida}</span>}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { mensajeDeError } from '@/shared/lib/errors';
import { registrarSubidaPendiente } from '../services/edicion.service';
import { usePaginaEnEdicion, useRegistrarSubida } from '../lib/pagina-en-edicion';

interface ArchivoUploaderFieldProps {
  value: string;
  onChange: (value: string, nombreOriginal?: string) => void;
  /** Tipos que acepta el selector, en formato `accept` de HTML. */
  accept?: string;
  etiquetaBoton?: string;
  nombreOriginal?: string;
}

/**
 * Campo para adjuntar un archivo (presentaciones, PDF, hojas de cálculo).
 *
 * Es el equivalente de `ImageUploaderField` para lo que no es una imagen: sube al
 * mismo endpoint y guarda la ruta resultante, pero sin previsualización y dejando
 * elegir qué extensiones se admiten.
 */
export function ArchivoUploaderField({
  value,
  onChange,
  accept = '.pptx,.ppt,.pdf,.xlsx,.xls,.docx,.doc',
  etiquetaBoton = 'Subir archivo',
  nombreOriginal,
}: ArchivoUploaderFieldProps) {
  const slug = usePaginaEnEdicion();
  const registrarSubida = useRegistrarSubida();
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alElegirArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    setSubiendo(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', archivo);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        let errorMsg = 'Error al subir el archivo';
        try {
          const errData = await res.json();
          if (errData.error) errorMsg = errData.error;
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const data = await res.json();
      const nombreSubido = data.nombreOriginal || archivo.name;
      const urlFinal = `${data.url}?nombre=${encodeURIComponent(nombreSubido)}`;
      onChange(urlFinal, nombreSubido);
      if (registrarSubida) {
        void registrarSubida(data.url);
      } else if (slug) {
        void registrarSubidaPendiente(slug, data.url);
      }
    } catch (err) {
      setError(mensajeDeError(err, 'Error desconocido'));
    } finally {
      setSubiendo(false);
    }
  };

  const nombreDeUrl = value?.includes('?nombre=')
    ? (() => {
        try {
          return decodeURIComponent(value.split('?nombre=')[1]?.split('&')[0] ?? '');
        } catch {
          return '';
        }
      })()
    : '';

  const nombreVisible =
    nombreOriginal ||
    nombreDeUrl ||
    (value ? decodeURIComponent(value.split('?')[0].split('/').pop() ?? '') : '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {nombreVisible && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 10px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
          }}
        >
          <svg
            style={{ width: '18px', height: '18px', color: '#dc2626', flexShrink: 0 }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: '#334155',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={nombreVisible}
          >
            {nombreVisible}
          </span>
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginLeft: 'auto',
              fontSize: '11px',
              color: '#2563eb',
              textDecoration: 'underline',
              flexShrink: 0,
            }}
          >
            Ver
          </a>
        </div>
      )}
      <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
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
          }}
        >
          {subiendo ? 'Subiendo archivo...' : etiquetaBoton}
        </button>
        <input
          type="file"
          accept={accept}
          onChange={alElegirArchivo}
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
      {error && <span style={{ color: 'red', fontSize: '12px' }}>{error}</span>}
    </div>
  );
}

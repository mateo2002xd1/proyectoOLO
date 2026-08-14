'use client';

import React, { useState } from 'react';
import { mensajeDeError } from '@/shared/lib/errors';

interface ArchivoUploaderFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Tipos que acepta el selector, en formato `accept` de HTML. */
  accept?: string;
  etiquetaBoton?: string;
}

/**
 * Campo para adjuntar un archivo (presentaciones, PDF, hojas de cálculo).
 *
 * Es el equivalente de `ImageUploaderField` para lo que no es una imagen: sube al
 * mismo endpoint y guarda la ruta resultante, pero sin previsualización y dejando
 * elegir qué extensiones se admiten. La ruta también se puede escribir a mano, que
 * es lo práctico cuando el archivo ya está en el servidor.
 */
export function ArchivoUploaderField({
  value,
  onChange,
  accept = '.pptx,.ppt,.pdf,.xlsx,.xls,.docx,.doc',
  etiquetaBoton = 'Subir archivo',
}: ArchivoUploaderFieldProps) {
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
      if (!res.ok) throw new Error('Error al subir el archivo');

      const data = await res.json();
      onChange(data.url);
    } catch (err) {
      setError(mensajeDeError(err, 'Error desconocido'));
    } finally {
      setSubiendo(false);
    }
  };

  const nombreVisible = value ? decodeURIComponent(value.split('/').pop() ?? '') : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {nombreVisible && (
        <span style={{ fontSize: '12px', color: '#4b5563', wordBreak: 'break-all' }}>
          Archivo actual: {nombreVisible}
        </span>
      )}
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ruta del archivo"
        style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
      />
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
          {subiendo ? 'Subiendo...' : etiquetaBoton}
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

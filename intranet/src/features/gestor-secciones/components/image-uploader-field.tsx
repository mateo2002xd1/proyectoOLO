'use client';

import React, { useState } from 'react';
import { mensajeDeError } from '@/shared/lib/errors';

interface ImageUploaderFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function ImageUploaderField({ value, onChange }: ImageUploaderFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        let errorMsg = 'Error al subir el archivo';
        try {
          const errData = await res.json();
          if (errData.error) errorMsg = errData.error;
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const data = await res.json();
      onChange(data.url); // The API should return { url: '/uploads/filename.png' }
    } catch (err) {
      setError(mensajeDeError(err, 'Error desconocido'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!value) return;

    setIsDeleting(true);
    setError(null);

    try {
      // Solo se borra del servidor si es un archivo que subimos nosotros;
      // una URL externa (por ejemplo, pegada a mano) no se toca.
      if (value.startsWith('/uploads/')) {
        const res = await fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: value }),
        });

        if (!res.ok) {
          let errorMsg = 'Error al eliminar el archivo';
          try {
            const errData = await res.json();
            if (errData.error) errorMsg = errData.error;
          } catch (_) {}
          throw new Error(errorMsg);
        }
      }

      onChange('');
    } catch (err) {
      setError(mensajeDeError(err, 'Error desconocido'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {value && (
        <div style={{ position: 'relative' }}>
          {/* src dinamico y tamano por CSS: next/image exigiria width/height fijos o remotePatterns */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '4px' }}
          />
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Eliminar imagen"
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '24px',
              height: '24px',
              lineHeight: '24px',
              textAlign: 'center',
              padding: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              opacity: isDeleting ? 0.7 : 1,
            }}
          >
            ✕
          </button>
        </div>
      )}
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="URL de la imagen"
        style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
      />
      <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
        <button
          type="button"
          disabled={isUploading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#0033a0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            opacity: isUploading ? 0.7 : 1,
            width: '100%',
          }}
        >
          {isUploading ? 'Subiendo...' : 'Subir Imagen Local'}
        </button>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer'
          }}
        />
      </div>
      {error && <span style={{ color: 'red', fontSize: '12px' }}>{error}</span>}
    </div>
  );
}

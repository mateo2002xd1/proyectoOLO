'use client';

import React, { useState } from 'react';

interface ImportadorExcelUploaderFieldProps {
  value: any;
  onChange: (value: any) => void;
}

export function ImportadorExcelUploaderField({
  value,
  onChange,
}: ImportadorExcelUploaderFieldProps) {
  const [subiendo, setSubiendo] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const alElegirArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    setSubiendo(true);
    setErrorLocal(null);

    const formData = new FormData();
    formData.append('file', archivo);

    try {
      const res = await fetch('/api/observatorio/importar', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar el archivo');
      }

      // Guardamos el resultado en Puck para que el bloque pueda mostrarlo en el lienzo
      onChange({ exito: true, data });
      
    } catch (err: any) {
      setErrorLocal(err.message || 'Error inesperado.');
      onChange({ exito: false, error: err.message || 'Error inesperado.' });
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
          {subiendo ? 'Procesando...' : 'Seleccionar Excel e Importar'}
        </button>
        <input
          type="file"
          accept=".xlsx"
          onChange={alElegirArchivo}
          disabled={subiendo}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: subiendo ? 'not-allowed' : 'pointer',
          }}
        />
      </div>
      
      {errorLocal && <span style={{ color: 'red', fontSize: '12px' }}>{errorLocal}</span>}
      
      {value?.exito && value?.data && (
        <div style={{ padding: '8px', backgroundColor: '#ecfdf5', color: '#065f46', fontSize: '12px', borderRadius: '4px' }}>
          <strong>¡Éxito!</strong>
          <ul style={{ margin: 0, paddingLeft: '16px' }}>
            <li>Filas: {value.data.estadisticas?.filasCargadas}</li>
          </ul>
        </div>
      )}
    </div>
  );
}

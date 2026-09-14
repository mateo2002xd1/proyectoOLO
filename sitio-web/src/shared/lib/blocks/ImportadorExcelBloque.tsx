'use client';

import React, { useState } from 'react';
import { poppins } from '@/shared/lib/fonts';

interface ImportadorExcelProps {
  block: { id: string };
  titulo?: string;
  descripcion?: string;
}

export function ImportadorExcelBloque({ block, titulo = 'Importador de Excel', descripcion = 'Sube un archivo .xlsx para procesarlo.' }: ImportadorExcelProps) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const alElegirArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArchivo(file);
      setError(null);
      setResultado(null);
    }
  };

  const procesarArchivo = async () => {
    if (!archivo) return;
    setSubiendo(true);
    setError(null);
    setResultado(null);

    try {
      const formData = new FormData();
      formData.append('file', archivo);

      // Enviamos al endpoint de Next.js que reenvía los bytes al backend sin guardar en disco
      const res = await fetch('/api/observatorio/importar', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar el archivo');
      }

      setResultado(data);
      setArchivo(null); // Limpiar el input
    } catch (err: any) {
      setError(err.message || 'Error inesperado.');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className={`${poppins.className} bg-white dark:bg-[#0b1121]`} data-block-id={block.id}>
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-gray-200 dark:border-[#1e293b] bg-white dark:bg-[#131b2f] p-6 shadow-sm transition-colors">
          <div className="border-b border-gray-100 dark:border-[#1e293b] pb-3 mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-[#f6f6f6]">{titulo}</h2>
          </div>

          <div className="space-y-4 text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
            <p>{descripcion}</p>

            <div className="flex items-center gap-4 mt-4">
              <input
                type="file"
                accept=".xlsx"
                onChange={alElegirArchivo}
                disabled={subiendo}
                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
              />
              <button
                onClick={procesarArchivo}
                disabled={!archivo || subiendo}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {subiendo ? 'Procesando...' : 'Importar'}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                <strong>Error:</strong> {error}
              </div>
            )}

            {resultado && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
                <strong>{resultado.mensaje}</strong>
                {resultado.estadisticas && (
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Filas analizadas/cargadas: {resultado.estadisticas.filasCargadas}</li>
                    <li>Nuevos Departamentos: {resultado.estadisticas.nuevosDepartamentos}</li>
                    <li>Nuevos Centros: {resultado.estadisticas.nuevosCentros}</li>
                    <li>Nuevos Niveles: {resultado.estadisticas.nuevosNiveles}</li>
                    <li>Nuevos Programas: {resultado.estadisticas.nuevosProgramas}</li>
                  </ul>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

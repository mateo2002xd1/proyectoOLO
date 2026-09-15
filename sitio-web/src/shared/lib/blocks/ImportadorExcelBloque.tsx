'use client';

import React, { useState } from 'react';
import { poppins } from '@/shared/lib/fonts';

interface ImportadorExcelProps {
  id?: string;
  block?: { id: string };
  estadoImportacion?: {
    exito?: boolean;
    error?: string;
    data?: any;
  };
}

export function ImportadorExcelBloque({
  id,
  block,
  estadoImportacion,
}: ImportadorExcelProps) {
  const resultado = estadoImportacion?.exito ? estadoImportacion.data : null;
  const error = estadoImportacion?.error;

  return (
    <div className={`${poppins.className} bg-white`} data-block-id={block?.id || id || 'importador-excel'}>
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="border-b border-gray-100 pb-3 mb-4">
            <h2 className="text-lg font-bold text-[#001631]">Importador de Excel</h2>
          </div>

          <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
            <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 text-center">
              <p className="text-gray-500">
                Selecciona este bloque en el lienzo y usa el panel lateral de Puck para importar el archivo Excel de programas sobresalientes.
              </p>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
                <strong>Error:</strong> {error}
              </div>
            )}

            {resultado && (
              <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg">
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

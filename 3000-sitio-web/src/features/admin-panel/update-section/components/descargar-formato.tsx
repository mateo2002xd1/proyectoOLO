'use client';

import { useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/20/solid';
import { mensajeDeErrorApi } from '@/shared/lib/errores-api';
import { descargarFormatoDeCarga } from '../services/observatorio.service';
import type { FormatoDeCarga } from '../types';

/**
 * "Descargar formato" de una tarjeta de Actualizaciones: baja el Excel de ejemplo con las
 * hojas y columnas que espera su carga, para llenarlo antes de subirlo. El archivo sale de
 * `api-backend/uploads/formatos-carga/`.
 */
export function DescargarFormato({ formato }: { formato: FormatoDeCarga }) {
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const descargar = async () => {
    setDescargando(true);
    setError(null);
    try {
      const archivo = await descargarFormatoDeCarga(formato);
      const url = URL.createObjectURL(archivo);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = `formato-${formato}.xlsx`;
      enlace.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(mensajeDeErrorApi(err, 'No se pudo descargar el formato.'));
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={descargar}
        disabled={descargando}
        className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-interactive disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-transparent dark:text-zinc-200"
      >
        {/* El verde de la marca no llega al contraste de texto sobre blanco: va solo en el ícono. */}
        <ArrowDownTrayIcon className="size-4 text-brand-interactive" />
        {descargando ? 'Descargando...' : 'Descargar formato'}
      </button>
      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

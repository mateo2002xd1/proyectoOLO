'use client';

import { useRef } from 'react';
import { ArrowUpTrayIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/20/solid';
import { useCargasFuentesFuturas } from '../hooks/use-cargas-fuentes-futuras';
import { DescargarFormato } from './descargar-formato';
import { HistorialCargasGrid } from './historial-cargas-grid';

interface CargaFuentesFuturasProps {
  /** Solo Administrador/Superadmin puede subir — el resto ve el historial nada más. */
  puedeActualizar: boolean;
}

/**
 * Tarjeta "Fuentes futuras de empleo" de "Actualizaciones".
 *
 * Es la única carga cuyo Excel no se importa a ninguna tabla: el archivo de la última
 * carga es lo que lee la sección pública. Por eso no hay barra de progreso (se publica
 * en la misma petición) y el borrado sí cambia lo que ve el visitante — el aviso del
 * historial lo dice con esas palabras.
 *
 * Antes de esto el Excel se dejaba a mano en `uploads/cargas-datos/` con un nombre fijo
 * y había que hacer commit para cambiar los datos del portal.
 */
export function CargaFuentesFuturas({ puedeActualizar }: CargaFuentesFuturasProps) {
  const { cargas, cargando, subiendo, error, aviso, subirArchivo, eliminarCarga } = useCargasFuentesFuturas();
  const inputRef = useRef<HTMLInputElement>(null);

  const alElegirArchivo = async (evento: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    await subirArchivo(archivo);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 ease-out hover:translate-x-1 hover:border-gray-300 hover:shadow-md dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:hover:border-[#334155]">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <h2 className="font-bold text-[#001631] dark:text-[#f6f6f6]">Fuentes futuras de empleo</h2>
        {puedeActualizar && <DescargarFormato formato="fuentes-futuras" />}
      </div>

      {puedeActualizar ? (
        <div className="mt-4">
          <label
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors ${
              subiendo
                ? 'cursor-not-allowed bg-brand-interactive/60'
                : 'cursor-pointer bg-brand-interactive hover:bg-brand-interactive-hover'
            }`}
          >
            <ArrowUpTrayIcon className="size-4" />
            {subiendo ? 'Publicando...' : 'Cargar'}
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx"
              onChange={alElegirArchivo}
              disabled={subiendo}
              className="hidden"
            />
          </label>
          <p className="mt-2 flex w-fit items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
            <InformationCircleIcon className="size-3.5 shrink-0" />
            Formato admitido: .xlsx
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-[#94a3b8]">
            El archivo que se suba reemplaza lo que muestra la sección del sitio; el anterior queda
            en el historial.
          </p>
          {error && (
            <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          {aviso && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-green-700 dark:text-green-400">
              <CheckCircleIcon className="size-4 shrink-0" />
              {aviso}
            </p>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-500 dark:text-[#94a3b8]">
          Solo un Administrador puede cargar este archivo.
        </p>
      )}

      <div className="mt-6">
        <h3 className="mb-2 text-sm font-bold text-gray-700 dark:text-zinc-300">Historial de cargas</h3>
        {cargando ? (
          <p className="text-sm text-gray-500 dark:text-[#94a3b8]">Cargando historial...</p>
        ) : (
          <HistorialCargasGrid
            cargas={cargas}
            onEliminar={puedeActualizar ? eliminarCarga : undefined}
            descripcionEliminar={
              <>
                Se borra del historial y, si ninguna otra carga usa el mismo archivo, también el
                Excel guardado en el servidor. Ojo: aquí el archivo <em>es</em> el dato, así que la
                sección del sitio vuelve a mostrar la carga anterior — y si esta es la única, se
                queda sin datos.
              </>
            }
          />
        )}
      </div>
    </div>
  );
}

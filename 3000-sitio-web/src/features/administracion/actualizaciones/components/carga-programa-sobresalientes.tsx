'use client';

import { useRef } from 'react';
import { ArrowUpTrayIcon, InformationCircleIcon } from '@heroicons/react/20/solid';
import { useCargasProgramaSobresalientes } from '../hooks/use-cargas-programa-sobresalientes';
import { CargandoSeccion } from '@/shared/ui/molecules/cargando-seccion';
import { BarraDeProgreso } from './barra-de-progreso';
import { DescargarFormato } from './descargar-formato';
import { HistorialCargasGrid } from './historial-cargas-grid';

/** Etiqueta de la fase actual — 60% es donde `importarProgramasExcel` pasa de
 * leer el Excel a escribir en la base (ver `ProgresoImportacion` en el backend). */
const etiquetaFase = (progreso: number) => (progreso < 60 ? 'Leyendo el archivo' : 'Guardando en la base de datos');

interface CargaProgramaSobresalientesProps {
  /** Solo Administrador/Superadmin puede subir — el resto ve el historial nada más. */
  puedeActualizar: boolean;
}

/**
 * Tarjeta "Programa + Sobresalientes" de "Actualizaciones": el Administrador sube
 * el Excel de SENA y la base de datos se actualiza de inmediato, sin paso de
 * aprobación (decisión de sesión — se descartó el flujo editor-sube/admin-aprueba).
 */
export function CargaProgramaSobresalientes({ puedeActualizar }: CargaProgramaSobresalientesProps) {
  const { cargas, cargando, subiendo, error, subirArchivo, cargaEnProceso, eliminarCarga } =
    useCargasProgramaSobresalientes();
  const inputRef = useRef<HTMLInputElement>(null);
  const procesando = subiendo || cargaEnProceso !== null;

  const alElegirArchivo = async (evento: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    await subirArchivo(archivo);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 ease-out hover:translate-x-1 hover:border-gray-300 hover:shadow-md dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:hover:border-[#334155]">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <h2 className="font-bold text-[#001631] dark:text-[#f6f6f6]">Programa + Sobresalientes</h2>
        {puedeActualizar && <DescargarFormato formato="programas-sobresalientes" />}
      </div>
      {puedeActualizar ? (
        <div className="mt-4">
          <label
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors ${
              procesando
                ? 'cursor-not-allowed bg-brand-interactive/60'
                : 'cursor-pointer bg-brand-interactive hover:bg-brand-interactive-hover'
            }`}
          >
            <ArrowUpTrayIcon className="size-4" />
            {subiendo ? 'Subiendo...' : cargaEnProceso ? 'Procesando...' : 'Cargar'}
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx"
              onChange={alElegirArchivo}
              disabled={procesando}
              className="hidden"
            />
          </label>
          <p className="mt-2 flex w-fit items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
            <InformationCircleIcon className="size-3.5 shrink-0" />
            Formato admitido: .xlsx
          </p>
          {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
          {cargaEnProceso && (
            <BarraDeProgreso
              progreso={cargaEnProceso.progreso}
              filasProcesadas={cargaEnProceso.filasProcesadas}
              filasTotales={cargaEnProceso.filasTotales}
              fase={etiquetaFase(cargaEnProceso.progreso)}
            />
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
          <CargandoSeccion label="Cargando historial..." className="min-h-[14rem]" />
        ) : (
          <HistorialCargasGrid cargas={cargas} onEliminar={puedeActualizar ? eliminarCarga : undefined} />
        )}
      </div>
    </div>
  );
}

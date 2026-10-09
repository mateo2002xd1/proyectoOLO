'use client';

import { useRef, useState } from 'react';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, InformationCircleIcon, PlusIcon } from '@heroicons/react/20/solid';
import { mensajeDeErrorApi } from '@/shared/lib/errores-api';
import { useCargasAlertasInversion } from '../hooks/use-cargas-alertas-inversion';
import { descargarFormatoAlertasInversion, descargarFormatoSectoresCiiu } from '../services/observatorio.service';
import { ActualizarSectoresCiiu } from './actualizar-sectores-ciiu';
import { BarraDeProgreso } from './barra-de-progreso';
import { HistorialCargasGrid } from './historial-cargas-grid';
import { FormularioProyectoInversion } from './formulario-proyecto-inversion';
import { ListaProyectosInversion } from './lista-proyectos-inversion';

/** 50% es donde `importarAlertasInversionExcel` pasa de leer el Excel a escribir en la base. */
const etiquetaFase = (progreso: number) => (progreso < 50 ? 'Leyendo el archivo' : 'Guardando en la base de datos');

interface CargaAlertasInversionProps {
  /** Solo Administrador/Superadmin puede subir o agregar a mano — el resto ve el historial. */
  puedeActualizar: boolean;
}

/**
 * Tarjeta "Alertas de inversión" de "Actualizaciones": dos formas de entrar datos al
 * mismo destino (`proyectos_inversion`) — subir un Excel con varios proyectos, o
 * agregar uno a mano. Las dos publican de inmediato, sin paso de aprobación, igual
 * que "Programa + Sobresalientes".
 */
export function CargaAlertasInversion({ puedeActualizar }: CargaAlertasInversionProps) {
  const {
    cargas,
    proyectos,
    cargando,
    subiendo,
    error,
    subirArchivo,
    cargaEnProceso,
    eliminarCarga,
    eliminarProyecto,
    limpiarProyectos,
    refrescar,
  } = useCargasAlertasInversion();
  const inputRef = useRef<HTMLInputElement>(null);
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [errorDescarga, setErrorDescarga] = useState<string | null>(null);
  const [descargando, setDescargando] = useState<'proyectos' | 'sectores' | null>(null);
  const procesando = subiendo || cargaEnProceso !== null;

  const alElegirArchivo = async (evento: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    await subirArchivo(archivo);
    if (inputRef.current) inputRef.current.value = '';
  };

  const descargarFormato = async (cual: 'proyectos' | 'sectores') => {
    setDescargando(cual);
    setErrorDescarga(null);
    try {
      const archivo = await (cual === 'proyectos' ? descargarFormatoAlertasInversion() : descargarFormatoSectoresCiiu());
      const url = URL.createObjectURL(archivo);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = cual === 'proyectos' ? 'formato-alertas-inversion.xlsx' : 'formato-actualizar-ciiu.xlsx';
      enlace.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setErrorDescarga(mensajeDeErrorApi(err, 'No se pudo descargar el formato.'));
    } finally {
      setDescargando(null);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 ease-out hover:translate-x-1 hover:border-gray-300 hover:shadow-md dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:hover:border-[#334155]">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <h2 className="font-bold text-[#001631] dark:text-[#f6f6f6]">Alertas de inversión</h2>
        {puedeActualizar && (
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['proyectos', 'Descargar formato'],
                ['sectores', 'Descargar formato CIIU'],
              ] as const
            ).map(([cual, etiqueta]) => (
              <button
                key={cual}
                type="button"
                onClick={() => descargarFormato(cual)}
                disabled={descargando !== null}
                className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-interactive disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-transparent dark:text-zinc-200"
              >
                <ArrowDownTrayIcon className="size-4 text-brand-interactive" />
                {descargando === cual ? 'Descargando...' : etiqueta}
              </button>
            ))}
          </div>
        )}
      </div>

      {puedeActualizar ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors ${
              procesando
                ? 'cursor-not-allowed bg-brand-interactive/60'
                : 'cursor-pointer bg-brand-interactive hover:bg-brand-interactive-hover'
            }`}
          >
            <ArrowUpTrayIcon className="size-4" />
            {subiendo ? 'Subiendo...' : cargaEnProceso ? 'Procesando...' : 'Cargar Excel'}
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx"
              onChange={alElegirArchivo}
              disabled={procesando}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => setFormularioAbierto(true)}
            className="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-interactive dark:border-zinc-600 dark:text-zinc-200"
          >
            <PlusIcon className="size-4 text-brand-interactive" />
            Agregar manualmente
          </button>

          <ActualizarSectoresCiiu />
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-500 dark:text-[#94a3b8]">
          Solo un Administrador puede cargar o agregar proyectos.
        </p>
      )}

      {puedeActualizar && (
        <p className="mt-2 flex w-fit items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
          <InformationCircleIcon className="size-3.5 shrink-0" />
          Formato admitido: .xlsx
        </p>
      )}
      {(error || errorDescarga) && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error ?? errorDescarga}</p>
      )}
      {cargaEnProceso && (
        <BarraDeProgreso
          progreso={cargaEnProceso.progreso}
          filasProcesadas={cargaEnProceso.filasProcesadas}
          filasTotales={cargaEnProceso.filasTotales}
          fase={etiquetaFase(cargaEnProceso.progreso)}
        />
      )}

      <div className="mt-6">
        <h3 className="mb-2 text-sm font-bold text-gray-700 dark:text-zinc-300">Historial de cargas</h3>
        {cargando ? (
          <p className="text-sm text-gray-500 dark:text-[#94a3b8]">Cargando historial...</p>
        ) : (
          <HistorialCargasGrid cargas={cargas} onEliminar={puedeActualizar ? eliminarCarga : undefined} />
        )}
      </div>

      <div className="mt-6">
        <h3 className="mb-2 text-sm font-bold text-gray-700 dark:text-zinc-300">Proyectos registrados</h3>
        {cargando ? (
          <p className="text-sm text-gray-500 dark:text-[#94a3b8]">Cargando proyectos...</p>
        ) : (
          <ListaProyectosInversion
            proyectos={proyectos}
            onEliminar={puedeActualizar ? eliminarProyecto : undefined}
            onLimpiar={puedeActualizar ? limpiarProyectos : undefined}
          />
        )}
      </div>

      <FormularioProyectoInversion
        open={formularioAbierto}
        onClose={() => setFormularioAbierto(false)}
        onCreado={refrescar}
      />
    </div>
  );
}

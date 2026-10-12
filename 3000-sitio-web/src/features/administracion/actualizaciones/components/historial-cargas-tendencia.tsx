'use client';

import { useState } from 'react';
import { TrashIcon } from '@heroicons/react/20/solid';
import { Alert, AlertActions, AlertDescription, AlertTitle } from '@/shared/ui/molecules/alert';
import { Button } from '@/shared/ui/atoms/button';
import { CargandoSeccion } from '@/shared/ui/molecules/cargando-seccion';
import { CustomSelect } from '@/shared/ui/molecules/custom-select';
import { Paginacion } from '@/shared/ui/molecules/paginacion';
import { YearPicker } from '@/shared/ui/molecules/year-picker';
import { EstadoFlag, estadoDeCarga, resumenDeFilas } from './estado-flag';
import { ReporteCargaTendencia } from './reporte-carga-tendencia';
import type { CargaTendencia, FiltroHistorialTendencia, HistorialTendencia } from '../types';

interface HistorialCargasTendenciaProps {
  historial: HistorialTendencia | null;
  /** La carga que se está sondeando: reemplaza a su fila para mostrar el progreso en vivo. */
  cargaEnProceso: CargaTendencia | null;
  filtro: FiltroHistorialTendencia;
  onCambiarFiltro: (cambios: Partial<FiltroHistorialTendencia>) => void;
  /** Años que se pueden filtrar: los mismos que admite una carga. */
  rangoAnios: { min: number; max: number };
  opcionesPeriodo: { value: string; label: string }[];
  onCambiarPagina: (pagina: number) => void;
  /** Ausentes en solo lectura (quien no puede actualizar no publica ni elimina). */
  onPublicar?: (corteId: string) => void;
  onDespublicar?: (corteId: string) => void;
  cortesEnAccion: string[];
  onEliminar?: (carga: CargaTendencia) => void;
  cargaEnEliminacion: string | null;
}

const formatearFecha = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

const celda = (carga: CargaTendencia) => `${carga.anio} · ${carga.periodoNombre}`;

/** Es la carga cuyos datos tiene hoy el corte: la única con publicar/despublicar. */
const esVigente = (carga: CargaTendencia) =>
  carga.estado === 'completado' && carga.vigente && carga.corteId !== null;

/** Lo que se pierde al eliminar, dicho antes de confirmar: solo lo que cambia según el caso. */
function consecuenciasDeEliminar(carga: CargaTendencia): string {
  const archivo = carga.archivoNombre ? `«${carga.archivoNombre}»` : 'su archivo';
  const base = `Se borran la carga, su reporte y ${archivo} (si otra carga no lo usa).`;
  const extra =
    carga.estado === 'procesando'
      ? ' Si quedó detenida, se retira.'
      : !esVigente(carga)
        ? ''
        : carga.corteEstado === 'publicado'
          ? ` También sus datos: el sitio deja de mostrar ${celda(carga)}.`
          : ' También sus datos en borrador.';
  return `${base}${extra} No se puede deshacer.`;
}

/**
 * Historial de cargas de percentiles: la trazabilidad de cada año y periodo. Una fila por
 * archivo subido, con quién, cuándo y cómo terminó.
 *
 * El estado va en un solo flag de color (`estadoDeCarga`): en curso, con errores, borrador,
 * publicado o inactiva (sus datos ya no están en el sitio). Las acciones de la fila van
 * juntas al final: publicar o despublicar la carga vigente, y eliminar.
 */
export function HistorialCargasTendencia({
  historial,
  cargaEnProceso,
  filtro,
  onCambiarFiltro,
  rangoAnios,
  opcionesPeriodo,
  onCambiarPagina,
  onPublicar,
  onDespublicar,
  cortesEnAccion,
  onEliminar,
  cargaEnEliminacion,
}: HistorialCargasTendenciaProps) {
  const [aDespublicar, setADespublicar] = useState<CargaTendencia | null>(null);
  const [aEliminar, setAEliminar] = useState<CargaTendencia | null>(null);

  const cargas = (historial?.cargas ?? []).map((c) => (cargaEnProceso?.id === c.id ? cargaEnProceso : c));
  const hayFiltro = filtro.anio !== '' || filtro.periodo !== '';
  const hayAcciones = Boolean(onPublicar || onDespublicar || onEliminar);

  return (
    <div>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-bold text-gray-700 dark:text-zinc-300">
          Historial de cargas
          {historial && (
            <span className="ml-2 font-normal text-zinc-500 dark:text-[#94a3b8]">
              ({historial.total.toLocaleString('es-CO')})
            </span>
          )}
        </h3>
        <div className="flex flex-col gap-2 sm:flex-row">
          <YearPicker
            value={filtro.anio}
            onChange={(anio) => onCambiarFiltro({ anio })}
            min={rangoAnios.min}
            max={rangoAnios.max}
            textoSinAnio="Todos los años"
            ariaLabel="Filtrar el historial por año"
            className="sm:w-44"
          />
          <CustomSelect
            value={filtro.periodo}
            onChange={(periodo) => onCambiarFiltro({ periodo })}
            options={[{ value: '', label: 'Todos los periodos' }, ...opcionesPeriodo]}
            ariaLabel="Filtrar el historial por periodo"
            className="sm:w-52"
          />
        </div>
      </div>

      {!historial ? (
        <CargandoSeccion label="Cargando historial..." className="min-h-[14rem]" />
      ) : cargas.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-200 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-[#94a3b8]">
          {hayFiltro ? 'Sin cargas para ese año y periodo.' : 'Todavía no hay cargas.'}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
          <table className="olo-tabla-apilable w-full min-w-[820px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">Año y periodo</th>
                <th scope="col" className="px-3 py-2 font-medium">Archivo</th>
                <th scope="col" className="px-3 py-2 font-medium">Cargado por</th>
                <th scope="col" className="px-3 py-2 font-medium">Estado</th>
                <th scope="col" className="px-3 py-2 font-medium">Resultado</th>
                {hayAcciones && (
                  <th scope="col" className="px-3 py-2 font-medium">
                    <span className="sr-only">Acciones</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {cargas.map((carga) => {
                const filas = carga.estado === 'completado' ? resumenDeFilas(carga) : null;
                const corteId = carga.corteId;
                const ocupado = corteId !== null && cortesEnAccion.includes(corteId);
                const vigente = esVigente(carga);
                return (
                  <tr key={carga.id} className="align-top transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <td className="whitespace-nowrap px-3 py-3 font-medium text-[#001631] dark:text-[#f6f6f6]">
                      {celda(carga)}
                    </td>
                    <td data-etiqueta="Archivo" className="max-w-[12rem] px-3 py-3 text-zinc-600 dark:text-zinc-300">
                      <span className="block truncate" title={carga.archivoNombre ?? undefined}>
                        {carga.archivoNombre ?? '—'}
                      </span>
                    </td>
                    <td data-etiqueta="Cargado por" className="whitespace-nowrap px-3 py-3 text-zinc-600 dark:text-zinc-300">
                      <span className="block">{carga.subidoPorNombre ?? 'Cuenta local'}</span>
                      <span className="text-xs text-zinc-500 dark:text-[#94a3b8]">{formatearFecha(carga.creadoEn)}</span>
                    </td>
                    <td data-etiqueta="Estado" className="whitespace-nowrap px-3 py-3">
                      <EstadoFlag estado={estadoDeCarga(carga)} />
                    </td>
                    <td data-etiqueta="Resultado" className="min-w-[14rem] px-3 py-3 text-zinc-600 dark:text-[#94a3b8]">
                      {filas ? (
                        <>
                          <span className="block text-zinc-700 dark:text-zinc-300">{filas.total}</span>
                          <span className="whitespace-nowrap text-xs text-zinc-500 dark:text-[#94a3b8]">{filas.detalle}</span>
                        </>
                      ) : carga.estado === 'procesando' ? (
                        <span className="text-zinc-500">Validando y guardando…</span>
                      ) : (
                        <span>{carga.mensaje ?? '—'}</span>
                      )}
                      <ReporteCargaTendencia reporte={carga.reporte} />
                    </td>
                    {hayAcciones && (
                      <td className="whitespace-nowrap px-3 py-3">
                        <div className="flex flex-wrap items-center gap-2 en-tabla:justify-end">
                          {vigente && corteId !== null && carga.corteEstado !== 'publicado' && onPublicar && (
                            <button
                              type="button"
                              onClick={() => onPublicar(corteId)}
                              disabled={ocupado}
                              className="rounded-md bg-brand-interactive px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-brand-interactive-hover disabled:opacity-50"
                            >
                              {ocupado ? 'Publicando…' : 'Publicar'}
                            </button>
                          )}
                          {vigente && carga.corteEstado === 'publicado' && onDespublicar && (
                            <button
                              type="button"
                              onClick={() => setADespublicar(carga)}
                              disabled={ocupado}
                              className="text-xs font-medium text-red-700 hover:underline disabled:opacity-50 dark:text-red-400"
                            >
                              Despublicar
                            </button>
                          )}
                          {onEliminar && (
                            <button
                              type="button"
                              onClick={() => setAEliminar(carga)}
                              disabled={cargaEnEliminacion === carga.id}
                              className="rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:animate-pulse disabled:opacity-50 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                              aria-label={`Eliminar la carga de ${celda(carga)}${carga.archivoNombre ? ` (${carga.archivoNombre})` : ''}`}
                              title="Eliminar carga y archivo"
                            >
                              <TrashIcon className="size-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {historial && historial.totalPaginas > 1 && (
        <Paginacion
          pagina={historial.pagina}
          totalPaginas={historial.totalPaginas}
          onCambiarPagina={onCambiarPagina}
          tono="panel"
          ariaLabel="Paginación del historial de cargas"
          className="mt-3"
        />
      )}

      <Alert open={aDespublicar !== null} onClose={(open) => !open && setADespublicar(null)}>
        <AlertTitle>¿Despublicar {aDespublicar ? celda(aDespublicar) : ''}?</AlertTitle>
        <AlertDescription>
          El sitio deja de mostrarlo. Los datos quedan en borrador y se pueden volver a publicar.
        </AlertDescription>
        <AlertActions>
          <Button type="button" plain onClick={() => setADespublicar(null)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              if (aDespublicar?.corteId) onDespublicar?.(aDespublicar.corteId);
              setADespublicar(null);
            }}
          >
            Despublicar
          </Button>
        </AlertActions>
      </Alert>

      <Alert open={aEliminar !== null} onClose={(open) => !open && setAEliminar(null)}>
        <AlertTitle>¿Eliminar la carga de {aEliminar ? celda(aEliminar) : ''}?</AlertTitle>
        <AlertDescription>{aEliminar ? consecuenciasDeEliminar(aEliminar) : ''}</AlertDescription>
        <AlertActions>
          <Button type="button" plain onClick={() => setAEliminar(null)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              if (aEliminar) onEliminar?.(aEliminar);
              setAEliminar(null);
            }}
          >
            Eliminar
          </Button>
        </AlertActions>
      </Alert>
    </div>
  );
}

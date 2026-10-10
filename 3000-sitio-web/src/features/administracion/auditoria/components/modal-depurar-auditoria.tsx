'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Database,
  Download,
  Info,
  Loader2,
  Trash2,
  X,
} from 'lucide-react';
import {
  analizarDepuracionAuditoria,
  ejecutarDepuracionAuditoria,
  type AnalisisDepuracionAuditoriaDTO,
  type ResultadoDepuracionAuditoriaDTO,
} from '../services/auditoria.service';
import { aCsv, descargarCsv } from '../lib/csv';
import { FormaDeModal } from '@/shared/ui/atoms/button';

interface ModalDepurarAuditoriaProps {
  abierto: boolean;
  onCerrar: () => void;
  onExito: () => void;
}

function formatearBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = 2;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function formatearFechaCorte(isoString: string): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function ModalDepurarAuditoria({
  abierto,
  onCerrar,
  onExito,
}: ModalDepurarAuditoriaProps) {
  const [analisis, setAnalisis] = useState<AnalisisDepuracionAuditoriaDTO | null>(null);
  const [cargando, setCargando] = useState(false);
  const [errorAnalisis, setErrorAnalisis] = useState<string | null>(null);

  const [csvDescargado, setCsvDescargado] = useState(false);
  const [ejecutando, setEjecutando] = useState(false);
  const [errorEjecucion, setErrorEjecucion] = useState<string | null>(null);
  const [resultadoExito, setResultadoExito] = useState<ResultadoDepuracionAuditoriaDTO | null>(null);

  useEffect(() => {
    if (!abierto) return;

    let cancelado = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCargando(true);
    setErrorAnalisis(null);


    analizarDepuracionAuditoria()
      .then((data) => {
        if (!cancelado) {
          setAnalisis(data);
          setErrorAnalisis(null);
        }
      })
      .catch((err) => {
        if (!cancelado) {
          setErrorAnalisis(err instanceof Error ? err.message : 'Error al analizar la depuración de auditoría.');
          setAnalisis(null);
        }
      })
      .finally(() => {
        if (!cancelado) {
          setCargando(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [abierto]);

  if (!abierto || typeof document === 'undefined') return null;

  const handleDescargarCsv = () => {
    if (!analisis || analisis.registros.length === 0) return;
    const nombreArchivo = `respaldo-auditoria-depurada-${new Date().toISOString().slice(0, 10)}.csv`;
    const contenidoCsv = aCsv(analisis.registros);
    descargarCsv(nombreArchivo, contenidoCsv);
    setCsvDescargado(true);
  };

  const handleEjecutar = async () => {
    if (!analisis || analisis.registros.length === 0 || !csvDescargado) return;
    setEjecutando(true);
    setErrorEjecucion(null);

    try {
      const ids = analisis.registros.map((r) => r.id);
      const res = await ejecutarDepuracionAuditoria(ids);
      setResultadoExito(res);
      setTimeout(() => {
        onExito();
      }, 1600);
    } catch (err) {
      setErrorEjecucion(err instanceof Error ? err.message : 'No se pudo completar la depuración de auditoría.');
    } finally {
      setEjecutando(false);
    }
  };

  const totalCandidatos = analisis?.registros.length ?? 0;
  const totalUltimoAnio = analisis?.totalUltimoAnio ?? 0;
  const fechaCorteTexto = analisis?.fechaCorte ? formatearFechaCorte(analisis.fechaCorte) : '';

  // Sale por un portal al `<body>`, como `Alert` (crear usuario): dentro de la columna
  // del panel la barra de abajo le quedaba encima y el desenfoque no cubría la página
  // entera. Por debajo de `lg` el fondo deja libre el alto de esa barra: la caja cabe
  // entre el borde de arriba y ella, y lo que no quepa hace scroll dentro.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center-safe justify-center overflow-y-auto bg-[#0f172a]/40 p-4 pb-[calc(var(--navegacion-mobile-alto)+1rem)] backdrop-blur-sm animate-in fade-in duration-200 lg:pb-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-depurar-auditoria"
    >
      <div className="relative flex max-h-[calc(100dvh-2rem-var(--navegacion-mobile-alto))] w-full max-w-2xl flex-col overflow-hidden rounded-[32px] border border-zinc-200 bg-white shadow-2xl lg:max-h-[calc(100dvh-2rem)] dark:border-[#2d3649] dark:bg-[#151d30]">
        {/* Las medidas de todos los modales (`alert.tsx`): esquinas de 32, botones de 44 px. */}
        <FormaDeModal>
        {/* Cabecera */}
        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-6 py-4 dark:border-[#202b42]">
          <h2
            id="titulo-modal-depurar-auditoria"
            className="text-xl font-semibold text-[#001631] dark:text-[#e6e8f0]"
          >
            Depurar tabla de auditoría
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            disabled={ejecutando}
            className="rounded-full p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50 dark:hover:bg-[#202b42] dark:hover:text-zinc-200"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenido */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {resultadoExito ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in-95 duration-200">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-[#f6f6f6]">
                ¡Depuración completada con éxito!
              </h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Se eliminaron permanentemente{' '}
                <strong className="text-zinc-800 dark:text-zinc-200">
                  {resultadoExito.eliminadas} registros
                </strong>{' '}
                de auditoría respaldados.
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-zinc-100 px-4 py-2 text-xs font-medium text-zinc-600 dark:bg-[#1a2333] dark:text-zinc-300">
                <Database size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>
                  Espacio liberado estimado:{' '}
                  <strong>{formatearBytes(resultadoExito.bytesLiberados)}</strong>
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Información de criterio y modo de prueba */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
                    <p className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
                      Importante:
                    </p>
                    <p>
                      Se conserva el último año de la bitácora donde se depuran los registros posteriores con
                      respaldo obligatorio previo en CSV.
                    </p>
                  </div>
                </div>
              </div>

              {/* Estado de carga */}
              {cargando && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-zinc-400 dark:text-zinc-500" />
                  <span className="ml-3 text-sm text-zinc-500 dark:text-zinc-400">
                    Analizando registros antiguos de la tabla...
                  </span>
                </div>
              )}

              {/* Errores */}
              {errorAnalisis && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                  {errorAnalisis}
                </div>
              )}

              {errorEjecucion && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                  {errorEjecucion}
                </div>
              )}

              {/* Resumen de análisis */}
              {!cargando && analisis && (
                <>
                  {/* La fecha de corte va en el aviso del criterio; aquí, cuánto se va y cuánto se queda. */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="col-span-2 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-3.5 text-center sm:col-span-1 dark:border-[#202b42] dark:bg-[#1a2333]/50">
                      <span className="block text-[11px] font-medium leading-tight text-zinc-500 dark:text-zinc-400">
                        Registros a depurar
                      </span>
                      <p className="mt-1 text-lg font-bold text-red-600 dark:text-red-400">
                        {totalCandidatos} {totalCandidatos === 1 ? 'registro' : 'registros'}
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {formatearBytes(analisis.pesoEstimadoBytes)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-3.5 text-center dark:border-[#202b42] dark:bg-[#1a2333]/50">
                      <span className="block text-[11px] font-medium leading-tight text-zinc-500 dark:text-zinc-400">
                        Registros del último año
                      </span>
                      <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {formatearBytes(analisis.pesoUltimoAnioBytes)}
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {totalUltimoAnio} {totalUltimoAnio === 1 ? 'registro' : 'registros'}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-3.5 text-center dark:border-[#202b42] dark:bg-[#1a2333]/50">
                      <span className="block text-[11px] font-medium leading-tight text-zinc-500 dark:text-zinc-400">
                        Registros de más de un año
                      </span>
                      <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {formatearBytes(analisis.pesoEstimadoBytes)}
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {totalCandidatos} {totalCandidatos === 1 ? 'registro' : 'registros'}
                      </p>
                    </div>
                  </div>

                  {totalCandidatos === 0 ? (
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-zinc-600 dark:border-[#202b42] dark:bg-[#1a2333] dark:text-zinc-400">
                      <Info className="mx-auto mb-2 h-6 w-6 text-zinc-400" />
                      No se encontraron registros de auditoría anteriores a {fechaCorteTexto}. No se requiere depuración en este momento.
                    </div>
                  ) : (
                    /* El respaldo va antes que el borrado: el botón rojo del pie no se
                       habilita hasta descargarlo. */
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {csvDescargado ? 'Respaldo descargado' : 'Descarga aquí el Logs de respaldo'}{' '}
                        <span className="text-red-600 dark:text-red-400" aria-hidden="true">*</span>
                        <span className="sr-only">(obligatorio)</span>
                      </p>
                      {/* Solo el icono, en blanco sobre el verde de marca (lo pidió así el usuario; el
                          contraste es 2.42:1, bajo el 3:1 de `9-accesibilidad.md` §2.1: el nombre
                          accesible y el texto de al lado dicen qué hace). */}
                      <button
                        type="button"
                        onClick={handleDescargarCsv}
                        disabled={ejecutando}
                        aria-label={csvDescargado ? 'Volver a descargar el respaldo CSV' : 'Descargar el respaldo CSV'}
                        title={csvDescargado ? 'Volver a descargar el respaldo CSV' : 'Descargar el respaldo CSV'}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#7DB728] text-white shadow-sm transition hover:bg-[#6ea321] active:bg-[#5f8f1c] disabled:opacity-50"
                      >
                        {csvDescargado ? <Check size={20} /> : <Download size={20} />}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Pie: como el de Respaldos. Depurar pide antes el respaldo descargado. */}
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-zinc-100 bg-zinc-50/60 px-4 py-4 sm:gap-3 sm:px-6 dark:border-[#202b42] dark:bg-[#111726]">
          <button
            type="button"
            onClick={onCerrar}
            disabled={ejecutando}
            className="h-11 rounded-[32px] border border-[#d9d9d9] bg-white px-4 text-base font-medium sm:px-6 text-[#001631] transition hover:bg-zinc-50 disabled:opacity-50 dark:border-[#2d3649] dark:bg-[#1a233a] dark:text-zinc-200 dark:hover:bg-[#202b42]"
          >
            {resultadoExito ? 'Cerrar' : 'Cancelar'}
          </button>

          {!resultadoExito && totalCandidatos > 0 && (
            <button
              type="button"
              onClick={handleEjecutar}
              disabled={!csvDescargado || ejecutando}
              title={csvDescargado ? undefined : 'Descarga primero el respaldo CSV'}
              className="flex h-11 items-center gap-2 whitespace-nowrap rounded-[32px] bg-red-600 px-4 text-base font-medium text-white sm:px-6 shadow-sm transition hover:bg-red-700 active:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {ejecutando ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Eliminando…
                </>
              ) : (
                <>
                  {/* Sin icono en el móvil: con él, el texto no cabía en una línea a 360 px. */}
                  <Trash2 size={16} className="hidden sm:block" />
                  Depurar {totalCandidatos} {totalCandidatos === 1 ? 'registro' : 'registros'}
                </>
              )}
            </button>
          )}
        </div>
        </FormaDeModal>
      </div>
    </div>,
    document.body,
  );
}

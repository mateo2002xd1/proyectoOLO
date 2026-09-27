'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  FileSpreadsheet,
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

  if (!abierto) return null;

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
  const fechaCorteTexto = analisis?.fechaCorte ? formatearFechaCorte(analisis.fechaCorte) : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center-safe justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-depurar-auditoria"
    >
      <div className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[24px] border border-zinc-200 bg-white shadow-2xl dark:border-[#2d3649] dark:bg-[#151d30]">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-[#202b42]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
              <Trash2 size={20} />
            </div>
            <div>
              <h2
                id="titulo-modal-depurar-auditoria"
                className="text-lg font-bold text-zinc-900 dark:text-[#f6f6f6]"
              >
                Depurar tabla de auditoría
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Elimina registros antiguos de la bitácora con respaldo obligatorio previo en CSV.
              </p>
            </div>
          </div>
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
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
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
                      Criterio de retención de 6 meses
                    </p>
                    <p>
                      El sistema identifica y depura todos los registros con fecha anterior a <strong>{fechaCorteTexto || '6 meses atrás'}</strong>.
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
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-3.5 dark:border-[#202b42] dark:bg-[#1a2333]/50">
                      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                        Registros a depurar
                      </span>
                      <p className="mt-1 text-lg font-bold text-red-600 dark:text-red-400">
                        {totalCandidatos} {totalCandidatos === 1 ? 'registro' : 'registros'}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-3.5 dark:border-[#202b42] dark:bg-[#1a2333]/50">
                      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                        Fecha de corte
                      </span>
                      <p className="mt-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        {fechaCorteTexto}
                      </p>
                    </div>

                    <div className="col-span-2 sm:col-span-1 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-3.5 dark:border-[#202b42] dark:bg-[#1a2333]/50">
                      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                        Espacio estimado
                      </span>
                      <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {formatearBytes(analisis.pesoEstimadoBytes)}
                      </p>
                    </div>
                  </div>


                  {totalCandidatos === 0 ? (
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-zinc-600 dark:border-[#202b42] dark:bg-[#1a2333] dark:text-zinc-400">
                      <Info className="mx-auto mb-2 h-6 w-6 text-zinc-400" />
                      No se encontraron registros de auditoría anteriores a {fechaCorteTexto}. No se requiere depuración en este momento.
                    </div>
                  ) : (
                    /* Tarjeta de flujo de 2 pasos */
                    <div className="rounded-2xl border border-zinc-200 bg-white p-4.5 dark:border-[#202b42] dark:bg-[#172033] space-y-4">
                      {/* Paso 1: Descargar CSV */}
                      <div className={`rounded-xl border p-4 transition-all ${
                        csvDescargado
                          ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                          : 'border-zinc-200 bg-zinc-50/80 dark:border-[#26334d] dark:bg-[#1a2333]'
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                              csvDescargado
                                ? 'bg-emerald-200 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                                : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
                            }`}>
                              {csvDescargado ? <CheckCircle2 size={16} /> : <FileSpreadsheet size={16} />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                Paso 1: Descargar respaldo CSV (Obligatorio)
                              </p>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                {csvDescargado
                                  ? 'Respaldo generado y descargado exitosamente. Ya puedes proceder al paso 2.'
                                  : 'Para poder eliminar los datos, es indispensable generar y descargar su respaldo en CSV.'}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleDescargarCsv}
                            disabled={ejecutando}
                            className={`flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-sm transition ${
                              csvDescargado
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600'
                                : 'bg-[#00324D] text-white hover:bg-[#002233] dark:bg-blue-600 dark:hover:bg-blue-500'
                            }`}
                          >
                            <Download size={14} />
                            {csvDescargado ? 'Volver a descargar CSV' : 'Descargar respaldo CSV'}
                          </button>
                        </div>
                      </div>

                      {/* Paso 2: Confirmar y eliminar */}
                      <div className={`rounded-xl border p-4 transition-all ${
                        !csvDescargado
                          ? 'border-zinc-100 bg-zinc-50/40 opacity-60 dark:border-[#202b42] dark:bg-[#151d30]'
                          : 'border-red-200 bg-red-50/40 dark:border-red-900/30 dark:bg-red-950/10'
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                              <Trash2 size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                Paso 2: Eliminación definitiva en base de datos
                              </p>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                {!csvDescargado
                                  ? 'Bloqueado. Debes completar el Paso 1 para habilitar este botón.'
                                  : 'Esta acción borrará de forma irreversible los 10 registros respaldados.'}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleEjecutar}
                            disabled={!csvDescargado || ejecutando}
                            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
                          >
                            {ejecutando ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                Eliminando...
                              </>
                            ) : (
                              <>
                                <Trash2 size={14} />
                                Confirmar y eliminar registros
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="flex items-center justify-end border-t border-zinc-100 bg-zinc-50 px-6 py-3.5 dark:border-[#202b42] dark:bg-[#151d30]">
          <button
            type="button"
            onClick={onCerrar}
            disabled={ejecutando}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-50 dark:border-[#2d3649] dark:bg-[#1a2333] dark:text-zinc-300 dark:hover:bg-[#202b42]"
          >
            {resultadoExito ? 'Cerrar' : 'Cancelar'}
          </button>
        </div>
      </div>
    </div>
  );
}

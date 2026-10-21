'use client';

import { IconoMascara } from '@/shared/ui/atoms/icono-mascara';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCierreAnimado } from '@/shared/lib/modals/use-cierre-animado';
import {
  CheckCircle2,
  Database,
  FileText,
  Loader2,
  X,
} from 'lucide-react';
import { CustomSelect } from '@/shared/ui/molecules/custom-select';
import { FormaDeModal } from '@/shared/ui/atoms/button';
import { etiquetaDeModalClass } from '@/shared/ui/molecules/alert';
import { MensajeEstado } from '@/shared/ui/molecules/mensaje-estado';
import { mensajeDeErrorApi } from '@/shared/lib/api/errores-api';
import { analizarDepuracion, ejecutarDepuracion } from '../services/respaldos.service';
import type { AnalisisDepuracionDTO, FiltrosDepuracion, RegistroRespaldo } from '../types';

interface ModalDepurarVersionesProps {
  abierto: boolean;
  registros: RegistroRespaldo[];
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

const claveTitulo = (titulo: string) => titulo.trim().toLocaleLowerCase('es');

/** Títulos que se repiten entre páginas: solo esos llevan el ámbito para distinguirse. */
function titulosRepetidos(paginas: { titulo: string }[]): Set<string> {
  const vistos = new Set<string>();
  const repetidos = new Set<string>();
  for (const { titulo } of paginas) {
    const clave = claveTitulo(titulo);
    if (vistos.has(clave)) repetidos.add(clave);
    vistos.add(clave);
  }
  return repetidos;
}

/** El título tal cual; con el ámbito detrás solo si otra página se llama igual. */
function nombrePagina(titulo: string, ambito: string | undefined, repetidos: Set<string>): string {
  if (!repetidos.has(claveTitulo(titulo))) return titulo;
  return `${titulo} · ${ambito === 'intranet' ? 'Intranet' : 'Sitio web'}`;
}

export function ModalDepurarVersiones({
  abierto,
  registros,
  onCerrar,
  onExito,
}: ModalDepurarVersionesProps) {
  const [filtros, setFiltros] = useState<FiltrosDepuracion>({
    ambito: undefined,
    paginaId: undefined,
    conservarUltimoRespaldo: true,
  });

  const [analisis, setAnalisis] = useState<AnalisisDepuracionDTO | null>(null);
  const [cargandoAnalisis, setCargandoAnalisis] = useState(false);
  const [errorAnalisis, setErrorAnalisis] = useState<string | null>(null);

  const [confirmando, setConfirmando] = useState(false);
  const [ejecutando, setEjecutando] = useState(false);
  const [errorEjecucion, setErrorEjecucion] = useState<string | null>(null);
  const [resultadoExito, setResultadoExito] = useState<{
    eliminadas: number;
    bytesLiberados: number;
  } | null>(null);

  // Catálogo único de páginas disponibles para el selector
  const opcionesPaginas = useMemo(() => {
    const mapa = new Map<string, { id: string; titulo: string; ambito?: string }>();
    for (const r of registros) {
      if (!mapa.has(r.paginaId)) {
        mapa.set(r.paginaId, { id: r.paginaId, titulo: r.titulo, ambito: r.ambito });
      }
    }
    let lista = Array.from(mapa.values());
    if (filtros.ambito) {
      lista = lista.filter((p) => p.ambito === filtros.ambito);
    }
    const repetidos = titulosRepetidos(lista);
    return [
      { value: '', label: 'Todas las páginas' },
      ...lista.map((p) => ({ value: p.id, label: nombrePagina(p.titulo, p.ambito, repetidos) })),
    ];
  }, [registros, filtros.ambito]);

  // Análisis dinámico con debounce: cada vez que cambian los filtros se pregunta al
  // backend cuántas versiones se borrarían. El `setState` sale de esa respuesta, así que
  // no hay estado inicial que lo evite. Ver §9 de 2-convenciones-del-proyecto.md.
  useEffect(() => {
    if (!abierto) return;

    let cancelado = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCargandoAnalisis(true);
    setErrorAnalisis(null);

    const timer = setTimeout(async () => {
      try {
        const data = await analizarDepuracion(filtros);
        if (!cancelado) {
          setAnalisis(data);
          setErrorAnalisis(null);
        }
      } catch (err) {
        if (!cancelado) {
          setErrorAnalisis(mensajeDeErrorApi(err, 'Error al calcular el impacto de la depuración.'));
          setAnalisis(null);
        }
      } finally {
        if (!cancelado) {
          setCargandoAnalisis(false);
        }
      }
    }, 280);

    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [abierto, filtros]);

  // No hay efecto que resetee el estado al abrir: el padre cambia la `key` en cada
  // apertura y este componente se monta de cero, con los `useState` de arriba —que ya
  // son exactamente los valores del reset— y con `fechaMaximaPermitida` recalculada al
  // día de hoy, que el efecto anterior no hacía (su `useMemo` sin dependencias se
  // quedaba con la fecha del primer montaje).
  const { montado, cerrando } = useCierreAnimado(abierto);

  if (!montado || typeof document === 'undefined') return null;

  const handleEjecutar = async () => {
    setEjecutando(true);
    setErrorEjecucion(null);
    try {
      const res = await ejecutarDepuracion(filtros);
      setResultadoExito({
        eliminadas: res.eliminadas,
        bytesLiberados: res.bytesLiberados,
      });
      setTimeout(() => {
        onExito();
      }, 1600);
    } catch (err) {
      setErrorEjecucion(mensajeDeErrorApi(err, 'No se pudo completar la depuración de versiones.'));
      setConfirmando(false);
    } finally {
      setEjecutando(false);
    }
  };

  const totalEncontradas = analisis?.totalVersiones ?? 0;
  const cantidadABorrar = totalEncontradas;
  const repetidosDetalle = titulosRepetidos(analisis?.paginasAfectadas ?? []);

  // Sale por un portal al `<body>`, como `Alert` (crear usuario): dentro de la columna
  // del panel la barra de abajo le quedaba encima y el desenfoque no cubría la página
  // entera. Por debajo de `lg` el fondo deja libre el alto de esa barra: la caja cabe
  // entre el borde de arriba y ella, y lo que no quepa hace scroll dentro.
  return createPortal(
    <div
      className="olo-anim-fondo fixed inset-0 z-50 flex items-center-safe justify-center overflow-y-auto bg-[#0f172a]/40 p-4 pb-[calc(var(--navegacion-mobile-alto)+1rem)] backdrop-blur-sm lg:pb-4"
      data-cerrando={cerrando || undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-depuracion"
    >
      <div className="olo-anim-caja relative flex max-h-[calc(100dvh-2rem-var(--navegacion-mobile-alto))] w-full max-w-2xl flex-col overflow-hidden rounded-[32px] border border-zinc-200 bg-white shadow-2xl lg:max-h-[calc(100dvh-2rem)] dark:border-[#2d3649] dark:bg-[#151d30]">
        {/* Las medidas de todos los modales (`alert.tsx`): esquinas de 32, campos y botones de 44 px. */}
        <FormaDeModal>
        {/* Cabecera */}
        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-6 py-4 dark:border-[#202b42]">
          <h2
            id="titulo-modal-depuracion"
            className="text-xl font-semibold text-[#001631] dark:text-[#e6e8f0]"
          >
            Depurar versiones antiguas
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            disabled={ejecutando}
            aria-label="Cerrar modal"
            className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/5 dark:hover:text-zinc-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenido */}
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {resultadoExito ? (
            <div className="py-8 text-center animate-in zoom-in-95 duration-200">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="mt-4 text-xl font-bold text-zinc-900 dark:text-[#f6f6f6]">
                ¡Depuración completada!
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                Se eliminaron con éxito{' '}
                <strong className="text-zinc-900 dark:text-white">
                  {resultadoExito.eliminadas} versiones archivadas
                </strong>
                , liberando aproximadamente{' '}
                <strong className="text-emerald-600 dark:text-emerald-400">
                  {formatearBytes(resultadoExito.bytesLiberados)}
                </strong>{' '}
                en la base de datos.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Información fija de conservación de respaldo */}
              <MensajeEstado tipo="info" rol="note">
                <strong>Respaldo siempre protegido:</strong> La versión archivada más reciente de cada página
                se conserva siempre de forma automática para asegurar que nunca se pierda el punto de restauración.
              </MensajeEstado>

              {/* Formulario de filtros */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={etiquetaDeModalClass}>
                    Ámbito
                  </label>
                  <CustomSelect
                    ariaLabel="Ámbito"
                    value={filtros.ambito || ''}
                    onChange={(val) =>
                      setFiltros((prev) => ({
                        ...prev,
                        ambito: (val as 'sitio' | 'intranet') || undefined,
                        paginaId: undefined,
                      }))
                    }
                    options={[
                      { value: '', label: 'Todos los ámbitos' },
                      { value: 'sitio', label: 'Sitio web' },
                      { value: 'intranet', label: 'Intranet' },
                    ]}
                  />
                </div>

                <div>
                  <label className={etiquetaDeModalClass}>
                    Página
                  </label>
                  <CustomSelect
                    ariaLabel="Página"
                    value={filtros.paginaId || ''}
                    onChange={(val) =>
                      setFiltros((prev) => ({ ...prev, paginaId: val || undefined }))
                    }
                    options={opcionesPaginas}
                  />
                </div>
              </div>

              {/* Panel de métricas en vivo */}
              <div className="rounded-[18px] border border-[#d0d5dd] bg-white p-4 shadow-sm dark:border-[#2d3649] dark:bg-[#1a243a]">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Database size={16} className="text-zinc-500 dark:text-zinc-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">
                      Impacto estimado en base de datos
                    </span>
                  </div>
                  {cargandoAnalisis && (
                    <span className="flex items-center gap-1.5 text-xs text-brand-interactive">
                      <Loader2 size={12} className="animate-spin" />
                      Calculando…
                    </span>
                  )}
                </div>

                {errorAnalisis ? (
                  <p className="mt-3 text-xs text-red-600 dark:text-red-400">{errorAnalisis}</p>
                ) : (
                  <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-zinc-50 p-2.5 dark:bg-[#131b2e]">
                      <span className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                        Total encontradas
                      </span>
                      <strong className="mt-0.5 block text-lg font-extrabold text-zinc-900 dark:text-white">
                        {totalEncontradas}
                      </strong>
                    </div>

                    <div className="rounded-xl bg-zinc-50 p-2.5 dark:bg-[#131b2e]">
                      <span className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                        Páginas afectadas
                      </span>
                      <strong className="mt-0.5 block text-lg font-extrabold text-zinc-900 dark:text-white">
                        {analisis?.totalPaginas ?? 0}
                      </strong>
                    </div>

                    <div className="rounded-xl bg-red-50 p-2.5 dark:bg-red-950/30">
                      <span className="block text-[11px] font-medium text-red-700 dark:text-red-300">
                        Espacio total
                      </span>
                      <strong className="mt-0.5 block text-lg font-extrabold text-red-600 dark:text-red-400">
                        {formatearBytes(analisis?.bytesEstimados ?? 0)}
                      </strong>
                    </div>
                  </div>
                )}

                {/* Mientras llega el primer análisis se reserva el hueco de la lista (28 px
                    por fila, hasta 4 = `max-h-28`): así la caja abre con su alto y no crece
                    de golpe al cargar. */}
                {!analisis && !errorAnalisis && (
                  <div className="mt-3.5 border-t border-zinc-100 pt-2.5 dark:border-zinc-800/80" aria-hidden="true">
                    <div className="h-4 w-28 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                    <div className="mt-1.5 h-28 animate-pulse rounded-lg bg-zinc-50 dark:bg-[#131b2e]" />
                  </div>
                )}

                {analisis && analisis.paginasAfectadas.length > 0 && (
                  <div className="mt-3.5 border-t border-zinc-100 pt-2.5 dark:border-zinc-800/80">
                    <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                      Detalle por página:
                    </span>
                    <ul className="mt-1.5 max-h-28 divide-y divide-zinc-100 overflow-y-auto text-xs dark:divide-zinc-800">
                      {analisis.paginasAfectadas.map((p) => (
                        <li key={p.paginaId} className="flex items-center justify-between py-1.5">
                          <div className="flex items-center gap-1.5 truncate">
                            <FileText size={13} className="shrink-0 text-zinc-400" />
                            <span className="truncate font-medium text-zinc-800 dark:text-zinc-200">
                              {nombrePagina(p.titulo, p.ambito, repetidosDetalle)}
                            </span>
                          </div>
                          <div className="flex shrink-0 items-center gap-3 text-right text-zinc-600 dark:text-zinc-300">
                            <span>{p.cantidadVersiones} vers.</span>
                            <span className="font-semibold text-red-600 dark:text-red-400">
                              {formatearBytes(p.bytesEstimados)}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {errorEjecucion && (
                <MensajeEstado tipo="error" rol="alert">
                  {errorEjecucion}
                </MensajeEstado>
              )}

              {/* Paso de confirmación de seguridad */}
              {confirmando && (
                <MensajeEstado tipo="advertencia" className="animate-in fade-in duration-150">
                  <p className="font-semibold">
                    ¿Estás seguro de que deseas eliminar permanentemente estas {totalEncontradas} versiones archivadas?
                  </p>
                  <p className="mt-1">
                    Esta acción es irreversible y quedará registrada en la auditoría del sistema con tu
                    usuario y dirección IP. La versión publicada y la versión archivada más reciente nunca se tocarán.
                  </p>
                </MensajeEstado>
              )}
            </div>
          )}
        </div>

        {/* Pie de modal con botones de acción */}
        {!resultadoExito && (
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-zinc-100 bg-zinc-50/60 px-6 py-4 dark:border-[#202b42] dark:bg-[#111726]">
            <button
              type="button"
              onClick={confirmando ? () => setConfirmando(false) : onCerrar}
              disabled={ejecutando}
              className="h-11 rounded-[32px] border border-[#d9d9d9] bg-white px-6 text-base font-medium text-[#001631] transition hover:bg-zinc-50 dark:border-[#2d3649] dark:bg-[#1a233a] dark:text-zinc-200 dark:hover:bg-[#202b42]"
            >
              Cancelar
            </button>

            {!confirmando ? (
              <button
                type="button"
                onClick={() => setConfirmando(true)}
                disabled={
                  cargandoAnalisis ||
                  !analisis ||
                  totalEncontradas === 0 ||
                  Boolean(errorAnalisis)
                }
                className="flex h-11 items-center gap-2 whitespace-nowrap rounded-[32px] bg-red-600 px-6 text-base font-medium text-white shadow-sm transition hover:bg-red-700 active:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <IconoMascara nombre="trash" tamano="h-5 w-5" />
                {cargandoAnalisis
                  ? 'Calculando…'
                  : totalEncontradas > 0
                  ? `Depurar ${totalEncontradas} versiones`
                  : 'Sin versiones para depurar'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleEjecutar}
                disabled={ejecutando}
                className="flex h-11 items-center gap-2 whitespace-nowrap rounded-[32px] bg-red-600 px-6 text-base font-medium text-white shadow-sm transition hover:bg-red-700 active:bg-red-800 disabled:opacity-50"
              >
                {ejecutando ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Eliminando versiones…
                  </>
                ) : (
                  <>
                    <IconoMascara nombre="trash" tamano="h-5 w-5" />
                    Confirmar y eliminar {cantidadABorrar} versiones
                  </>
                )}
              </button>
            )}
          </div>
        )}
        </FormaDeModal>
      </div>
    </div>,
    document.body,
  );
}


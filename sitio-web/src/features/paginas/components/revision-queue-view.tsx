'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { CheckCircle, XCircle, Trash2, ExternalLink } from 'lucide-react';
import { CustomSelect } from '@/shared/ui/molecules/custom-select';
import { DatePicker } from '@/shared/ui/molecules/date-picker';
import { Paginador } from '@/shared/ui/molecules/paginador';
import { useRevisionQueue } from '../hooks/use-revision-queue';
import type { Ambito, PaginaEnRevision } from '../types';

/**
 * Dónde se ve una página que aún no está publicada.
 *
 * Cada aplicación dibuja sus propios bloques, así que el sitio no sabe pintar una
 * página de la intranet: la vista previa se abre en la aplicación a la que
 * pertenece. La sesión es la misma en ambas, así que no vuelve a pedir acceso.
 */
const URL_INTRANET = process.env.NEXT_PUBLIC_INTRANET_URL || 'http://localhost:3001';

function enlaceDeVistaPrevia(pagina: PaginaEnRevision): string {
  return pagina.ambito === 'intranet'
    ? `${URL_INTRANET}/preview/${pagina.slug}`
    : `/admin/preview/${pagina.slug}`;
}

const CLASE_BOTON =
  'h-9 rounded-[16px] border border-[#d0d5dd] px-3.5 text-sm font-medium text-zinc-700 transition hover:border-[#002237]/40 hover:bg-[#002237]/5 hover:text-[#002237] disabled:opacity-60 dark:border-[#2d3649] dark:text-zinc-200 dark:hover:bg-white/5 dark:hover:text-[#f6f6f6] inline-flex items-center gap-1.5';

const CLASE_BOTON_PRIMARIO =
  'h-9 rounded-[16px] bg-brand-interactive px-3.5 text-sm font-semibold text-white transition hover:bg-brand-interactive-hover disabled:cursor-not-allowed disabled:opacity-40 inline-flex items-center gap-1.5';

const CLASE_BOTON_RECHAZAR =
  'h-9 rounded-[16px] border border-red-200 bg-red-50 px-3.5 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-100 disabled:opacity-60 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/40 inline-flex items-center gap-1.5';

const fecha = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
};

const normalizar = (t: string) =>
  t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

/** Misma etiqueta-encima-del-control que Auditoría y Respaldos. */
function Campo({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="flex w-44 flex-col gap-1">
      <span className="text-xs font-medium text-zinc-500">{etiqueta}</span>
      {children}
    </div>
  );
}

const FILTROS_VACIOS = { busqueda: '', ambito: '', autor: '', desde: '', hasta: '' };

export function RevisionQueueView() {
  const { paginas, isLoading, error, aprobar, rechazar, eliminar } = useRevisionQueue();
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  // Nombrado "numeroPagina" y no "pagina": ese nombre ya lo usa cada fila de la
  // tabla para la página-contenido (`PaginaEnRevision`), y las dos cosas conviven
  // en este mismo archivo.
  const [numeroPagina, setNumeroPagina] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(15);

  const cambiarFiltro = (campo: keyof typeof FILTROS_VACIOS, valor: string) => {
    setFiltros((previos) => ({ ...previos, [campo]: valor }));
    setNumeroPagina(1);
  };

  // El autor sale de lo ya cargado, no de un catálogo aparte: esta cola no tiene
  // (todavía) un endpoint propio de usuarios como sí tiene Auditoría.
  const autores = useMemo(
    () => [...new Set(paginas.map((p) => p.autor?.nombre).filter((n): n is string => Boolean(n)))].sort((a, b) => a.localeCompare(b, 'es')),
    [paginas]
  );

  const paginasFiltradas = useMemo(() => {
    const q = normalizar(filtros.busqueda);
    return paginas.filter((p) => {
      if (q && !normalizar(`${p.titulo} ${p.slug}`).includes(q)) return false;
      if (filtros.ambito && p.ambito !== filtros.ambito) return false;
      if (filtros.autor && p.autor?.nombre !== filtros.autor) return false;
      // Comparación de texto sobre `YYYY-MM-DD...`: válida porque la fecha es la
      // parte más significativa al principio del ISO, sin necesidad de parsear.
      if (filtros.desde && p.creadoEn.slice(0, 10) < filtros.desde) return false;
      if (filtros.hasta && p.creadoEn.slice(0, 10) > filtros.hasta) return false;
      return true;
    });
  }, [paginas, filtros]);

  const hayFiltros = Object.values(filtros).some(Boolean);

  const totalPaginas = Math.max(1, Math.ceil(paginasFiltradas.length / itemsPorPagina));
  const paginaActual = Math.min(numeroPagina, totalPaginas);
  const paginasPagina = paginasFiltradas.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const [modalState, setModalState] = useState<{
    tipo: 'rechazar' | 'eliminar' | null;
    pagina: PaginaEnRevision | null;
  }>({ tipo: null, pagina: null });

  function abrirRechazar(pagina: PaginaEnRevision) {
    setModalState({ tipo: 'rechazar', pagina });
  }

  function abrirEliminar(pagina: PaginaEnRevision) {
    setModalState({ tipo: 'eliminar', pagina });
  }

  async function confirmarModal(motivo: string) {
    if (!modalState.pagina || !modalState.tipo) return;
    const { pagina, tipo } = modalState;
    setModalState({ tipo: null, pagina: null });
    setBusySlug(pagina.slug);

    try {
      if (tipo === 'rechazar') {
        await rechazar(pagina.slug, motivo, pagina.ambito);
      } else if (tipo === 'eliminar') {
        await eliminar(pagina.slug, pagina.id, motivo, pagina.ambito);
      }
    } finally {
      setBusySlug(null);
    }
  }

  async function handleAprobar(pagina: PaginaEnRevision) {
    setBusySlug(pagina.slug);
    try {
      await aprobar(pagina.slug, pagina.ambito);
    } finally {
      setBusySlug(null);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="admin-header text-zinc-950 dark:text-[#f6f6f6]">Páginas en revisión</h1>
          <p className="mt-1 text-sm text-zinc-500 max-w-2xl">
            Borradores enviados por editores del sitio y de la intranet, pendientes de aprobación.
          </p>
        </div>
      </div>

      {!isLoading && paginas.length > 0 && (
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <Campo etiqueta="Página">
            <input
              type="search"
              value={filtros.busqueda}
              onChange={(e) => cambiarFiltro('busqueda', e.target.value)}
              placeholder="Título o slug…"
              className="h-11 w-full rounded-[16px] border border-[#d0d5dd] bg-white px-3 text-sm text-zinc-900 placeholder:text-[#8a95ad] focus:border-[#002237] focus:outline-none focus:ring-2 focus:ring-[#002237]/20 dark:border-[#2d3649] dark:bg-[#252f47] dark:text-[#e6e8f0]"
            />
          </Campo>

          <Campo etiqueta="Ámbito">
            <CustomSelect
              ariaLabel="Ámbito"
              value={filtros.ambito}
              onChange={(valor) => cambiarFiltro('ambito', valor)}
              options={[
                { value: '', label: 'Todos' },
                { value: 'sitio', label: 'Sitio web' },
                { value: 'intranet', label: 'Intranet' },
              ]}
            />
          </Campo>

          <Campo etiqueta="Autor">
            <CustomSelect
              ariaLabel="Autor"
              value={filtros.autor}
              onChange={(valor) => cambiarFiltro('autor', valor)}
              options={[{ value: '', label: 'Todos' }, ...autores.map((n) => ({ value: n, label: n }))]}
            />
          </Campo>

          <Campo etiqueta="Enviado desde">
            <DatePicker
              ariaLabel="Enviado desde"
              value={filtros.desde}
              max={filtros.hasta || undefined}
              onChange={(valor) => cambiarFiltro('desde', valor)}
            />
          </Campo>

          <Campo etiqueta="Enviado hasta">
            <DatePicker
              ariaLabel="Enviado hasta"
              value={filtros.hasta}
              min={filtros.desde || undefined}
              onChange={(valor) => cambiarFiltro('hasta', valor)}
            />
          </Campo>

          {hayFiltros && (
            <button
              type="button"
              onClick={() => setFiltros(FILTROS_VACIOS)}
              className="h-11 rounded-[16px] border border-[#d0d5dd] px-4 text-sm font-medium text-zinc-700 transition hover:border-[#002237]/40 hover:bg-[#002237]/5 hover:text-[#002237] dark:border-[#2d3649] dark:text-zinc-200 dark:hover:bg-white/5 dark:hover:text-[#f6f6f6]"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {error ? (
        <p className="text-sm text-red-600">Error: {error}</p>
      ) : isLoading ? (
        <p className="text-sm text-zinc-500">Cargando páginas en revisión…</p>
      ) : paginas.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No hay páginas pendientes de revisión. Cuando los editores envíen borradores, aparecerán aquí para tu aprobación.
        </p>
      ) : paginasFiltradas.length === 0 ? (
        <p className="text-sm text-zinc-500">Ninguna página coincide con los filtros aplicados.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-[#7db828]/30">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-[#131b2f]">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Página</th>
                <th scope="col" className="px-4 py-3 font-medium">Ámbito</th>
                <th scope="col" className="px-4 py-3 font-medium">Autor</th>
                <th scope="col" className="px-4 py-3 font-medium">Enviado el</th>
                <th scope="col" className="px-4 py-3 font-medium text-right">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {paginasPagina.map((pagina) => (
                <tr key={pagina.id} className="bg-white dark:bg-[#0f1626] transition-colors hover:bg-zinc-50/60 dark:hover:bg-[#131b2f]/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900 dark:text-[#f6f6f6]">{pagina.titulo}</p>
                    <p className="text-xs text-zinc-500">/{pagina.slug} · versión {pagina.numeroVersion}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        pagina.ambito === 'intranet'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      }`}
                    >
                      {pagina.ambito === 'intranet' ? 'Intranet' : 'Sitio web'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                    <p className="text-sm">{pagina.autor?.nombre || 'Desconocido'}</p>
                    {pagina.autor?.email && (
                      <p className="text-xs text-zinc-400">{pagina.autor.email}</p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600 dark:text-zinc-300">
                    {fecha(pagina.creadoEn)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={enlaceDeVistaPrevia(pagina)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={CLASE_BOTON}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Ver
                      </a>
                      <button
                        type="button"
                        disabled={busySlug === pagina.slug}
                        onClick={() => handleAprobar(pagina)}
                        className={CLASE_BOTON_PRIMARIO}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Aprobar
                      </button>
                      <button
                        type="button"
                        disabled={busySlug === pagina.slug}
                        onClick={() => abrirRechazar(pagina)}
                        className={CLASE_BOTON_RECHAZAR}
                      >
                        <XCircle className="h-4 w-4" />
                        Rechazar
                      </button>
                      <button
                        type="button"
                        disabled={busySlug === pagina.slug}
                        onClick={() => abrirEliminar(pagina)}
                        title="Descartar esta versión sin publicar"
                        className="h-9 w-9 inline-flex items-center justify-center rounded-[16px] text-zinc-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Paginador
            pagina={paginaActual}
            totalPaginas={totalPaginas}
            onCambiarPagina={setNumeroPagina}
            total={paginasFiltradas.length}
            porPagina={itemsPorPagina}
            onCambiarPorPagina={(n) => {
              setItemsPorPagina(n);
              setNumeroPagina(1);
            }}
            etiqueta="páginas"
            className="px-4"
          />
        </div>
      )}

      <ModalAccionConMotivo
        abierto={modalState.tipo === 'rechazar'}
        titulo={modalState.pagina ? `Rechazar versión ${modalState.pagina.numeroVersion}` : ''}
        descripcion={`Se devolverá el borrador a su autor original (${modalState.pagina?.autor?.nombre || 'desconocido'}) para que lo corrija.`}
        textoAccion="Rechazar"
        colorAccion="red"
        onConfirmar={confirmarModal}
        onCancelar={() => setModalState({ tipo: null, pagina: null })}
      />

      <ModalAccionConMotivo
        abierto={modalState.tipo === 'eliminar'}
        titulo={modalState.pagina ? `Eliminar versión ${modalState.pagina.numeroVersion} de /${modalState.pagina.slug}` : ''}
        descripcion="Se descarta el trabajo sin publicar. Si es la única versión de la página, la próxima edición empezará de nuevo desde la versión 1."
        textoAccion="Eliminar"
        colorAccion="red"
        onConfirmar={confirmarModal}
        onCancelar={() => setModalState({ tipo: null, pagina: null })}
      />
    </div>
  );
}

function ModalAccionConMotivo({
  abierto,
  titulo,
  descripcion,
  textoAccion,
  colorAccion = 'red',
  onConfirmar,
  onCancelar,
  requiereMotivo = true,
}: {
  abierto: boolean;
  titulo: string;
  descripcion: string;
  textoAccion: string;
  colorAccion?: 'red' | 'brand';
  onConfirmar: (motivo: string) => void;
  onCancelar: () => void;
  requiereMotivo?: boolean;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [motivo, setMotivo] = useState('');

  useEffect(() => {
    const el = dialogo.current;
    if (!el) return;
    if (abierto) {
      setMotivo('');
      if (!el.open) el.showModal();
    } else if (el.open) {
      el.close();
    }
  }, [abierto]);

  return (
    <dialog
      ref={dialogo}
      onClose={onCancelar}
      // Usamos `onMouseDown` y no `onClick`: si el usuario selecciona texto
      // dentro del diálogo y suelta el ratón fuera, el clic se contabiliza en
      // el fondo y el diálogo se cerraba en mitad de la selección.
      onMouseDown={(e) => {
        if (e.target === dialogo.current) onCancelar();
      }}
      className="m-auto w-full max-w-md rounded-xl border border-zinc-200 bg-white p-0 text-zinc-900 backdrop:bg-[#0f172a]/50 backdrop:backdrop-blur-sm dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:text-[#f6f6f6]"
    >
      <div className="flex flex-col p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-[#f6f6f6]">
            {titulo}
          </h2>
        </div>

        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{descripcion}</p>

        {requiereMotivo && (
          <div className="mt-4">
            <label
              htmlFor="motivo-accion"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
            >
              Motivo (obligatorio)
            </label>
            <textarea
              id="motivo-accion"
              rows={3}
              className="mt-1 block w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 focus:border-brand-interactive focus:outline-none focus:ring-1 focus:ring-brand-interactive dark:border-zinc-700 dark:bg-[#1a233a] dark:text-white"
              placeholder="Explica la razón…"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              autoFocus
            />
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCancelar}
            className="inline-flex w-full justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-brand-interactive/50 sm:w-auto dark:border-zinc-600 dark:bg-transparent dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirmar(motivo)}
            disabled={requiereMotivo && !motivo.trim()}
            className={`inline-flex w-full justify-center rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${
              colorAccion === 'red'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-brand-interactive hover:bg-brand-interactive-hover'
            }`}
          >
            {textoAccion}
          </button>
        </div>
      </div>
    </dialog>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { CheckCircle, XCircle, Trash2, ExternalLink } from 'lucide-react';
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

export function RevisionQueueView() {
  const { paginas, isLoading, error, aprobar, rechazar, eliminar } = useRevisionQueue();
  const [busySlug, setBusySlug] = useState<string | null>(null);

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

      {error ? (
        <p className="text-sm text-red-600">Error: {error}</p>
      ) : isLoading ? (
        <p className="text-sm text-zinc-500">Cargando páginas en revisión…</p>
      ) : paginas.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No hay páginas pendientes de revisión. Cuando los editores envíen borradores, aparecerán aquí para tu aprobación.
        </p>
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
              {paginas.map((pagina) => (
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
      onClick={(e) => {
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

'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Trash2, ExternalLink } from 'lucide-react';
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
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

const ETIQUETA_AMBITO: Record<Ambito, string> = {
  sitio: 'Sitio web',
  intranet: 'Intranet',
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

  if (isLoading) {
    return <p className="p-6 text-sm text-zinc-500">Cargando páginas en revisión…</p>;
  }

  if (error) {
    return <p className="p-6 text-sm text-red-600">Error: {error}</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col p-6 lg:p-10 min-h-[calc(100vh-8rem)]">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-interactive/10 text-brand-interactive">
              <ClipboardDocumentCheckIcon className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-[#f6f6f6]">
              Páginas en revisión
            </h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Borradores enviados por editores del sitio y de la intranet, pendientes de aprobación.
          </p>
        </div>
      </div>

      {paginas.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-zinc-200 bg-zinc-50/50 px-6 py-16 min-h-[50vh] text-center dark:border-[#2d3649] dark:bg-[#131b2f]/30">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-interactive/10 text-brand-interactive">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 7V0.46C14.9251 0.809335 15.7653 1.35131 16.465 2.05L19.949 5.536C20.6485 6.23488 21.1909 7.07489 21.54 8H15C14.7348 8 14.4804 7.89464 14.2929 7.70711C14.1054 7.51957 14 7.26522 14 7ZM22 10.485V19C21.9984 20.3256 21.4711 21.5964 20.5338 22.5338C19.5964 23.4711 18.3256 23.9984 17 24H7C5.67441 23.9984 4.40356 23.4711 3.46622 22.5338C2.52888 21.5964 2.00159 20.3256 2 19V5C2.00159 3.67441 2.52888 2.40356 3.46622 1.46622C4.40356 0.528882 5.67441 0.00158786 7 0L11.515 0C11.678 0 11.839 0.013 12 0.024V7C12 7.79565 12.3161 8.55871 12.8787 9.12132C13.4413 9.68393 14.2044 10 15 10H21.976C21.987 10.161 22 10.322 22 10.485ZM16.724 14.311C16.5412 14.1191 16.2897 14.0076 16.0247 14.0011C15.7598 13.9945 15.5031 14.0934 15.311 14.276L11.711 17.707C11.6148 17.8038 11.4998 17.8798 11.3731 17.9305C11.2465 17.9811 11.1107 18.0053 10.9744 18.0016C10.838 17.9979 10.7038 17.9662 10.5801 17.9087C10.4564 17.8511 10.3457 17.7689 10.255 17.667L8.666 16.253C8.5679 16.1655 8.45354 16.0983 8.32944 16.055C8.20534 16.0117 8.07393 15.9933 7.94272 16.0009C7.67774 16.016 7.42963 16.1359 7.253 16.334C7.16554 16.4321 7.09826 16.5465 7.055 16.6706C7.01173 16.7947 6.99334 16.9261 7.00086 17.0573C7.01605 17.3223 7.13588 17.5704 7.334 17.747L8.878 19.121C9.43767 19.6808 10.1959 19.9967 10.9875 19.9999C11.7791 20.0031 12.5398 19.6933 13.104 19.138L16.689 15.724C16.8809 15.5412 16.9924 15.2897 16.9989 15.0247C17.0055 14.7598 16.9066 14.5031 16.724 14.311Z" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
            Todo al día
          </h3>
          <p className="max-w-[420px] text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            No hay páginas pendientes de revisión. Cuando los editores envíen borradores, aparecerán aquí para tu aprobación.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {paginas.map((pagina) => (
            <li
              key={pagina.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-[#2d3649] dark:bg-[#131b2f] dark:hover:border-[#3a445c]"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <p className="truncate font-semibold text-zinc-900 dark:text-[#f6f6f6]">
                    {pagina.titulo}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide ${pagina.ambito === 'intranet'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                        : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                      }`}
                  >
                    {ETIQUETA_AMBITO[pagina.ambito] ?? pagina.ambito}
                  </span>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  <span className="font-medium text-zinc-600 dark:text-zinc-300">/{pagina.slug}</span> · versión {pagina.numeroVersion}
                  {pagina.autor?.nombre ? ` · enviado por ${pagina.autor.nombre}` : ''}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <a
                  href={enlaceDeVistaPrevia(pagina)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver
                </a>
                <button
                  type="button"
                  disabled={busySlug === pagina.slug}
                  onClick={() => handleAprobar(pagina)}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60 dark:bg-emerald-600/90 dark:hover:bg-emerald-600"
                >
                  <CheckCircle className="h-4 w-4" />
                  Aprobar
                </button>
                <button
                  type="button"
                  disabled={busySlug === pagina.slug}
                  onClick={() => abrirRechazar(pagina)}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-100 disabled:opacity-60 dark:border-red-900/50 dark:bg-red-900/20 dark:hover:bg-red-900/40"
                >
                  <XCircle className="h-4 w-4" />
                  Rechazar
                </button>
                <div className="ml-1 h-6 w-px bg-zinc-200 dark:bg-zinc-700 hidden sm:block"></div>
                {/* Rechazar devuelve la versión a su autor; eliminar la descarta. */}
                <button
                  type="button"
                  disabled={busySlug === pagina.slug}
                  onClick={() => abrirEliminar(pagina)}
                  title="Descartar esta versión sin publicar"
                  className="flex items-center justify-center rounded-lg p-2 text-zinc-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-60 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modalState.tipo === 'rechazar' && modalState.pagina && (
        <ModalAccionConMotivo
          titulo={`Rechazar versión ${modalState.pagina.numeroVersion}`}
          descripcion={`Se devolverá el borrador a su autor original (${modalState.pagina.autor?.nombre || 'desconocido'}) para que lo corrija.`}
          textoAccion="Rechazar"
          colorAccion="red"
          onConfirmar={confirmarModal}
          onCancelar={() => setModalState({ tipo: null, pagina: null })}
        />
      )}

      {modalState.tipo === 'eliminar' && modalState.pagina && (
        <ModalAccionConMotivo
          titulo={`Eliminar versión ${modalState.pagina.numeroVersion} de /${modalState.pagina.slug}`}
          descripcion="Se descarta el trabajo sin publicar. Si es la única versión de la página, la próxima edición empezará de nuevo desde la versión 1."
          textoAccion="Eliminar"
          colorAccion="red"
          onConfirmar={confirmarModal}
          onCancelar={() => setModalState({ tipo: null, pagina: null })}
        />
      )}
    </div>
  );
}

function ModalAccionConMotivo({
  titulo,
  descripcion,
  textoAccion,
  colorAccion = 'red',
  onConfirmar,
  onCancelar,
  requiereMotivo = true,
}: {
  titulo: string;
  descripcion: string;
  textoAccion: string;
  colorAccion?: 'red' | 'zinc';
  onConfirmar: (motivo: string) => void;
  onCancelar: () => void;
  requiereMotivo?: boolean;
}) {
  const [motivo, setMotivo] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={onCancelar}></div>
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-[#131b2f] border border-zinc-200 dark:border-[#2d3649]">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{titulo}</h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{descripcion}</p>
        {requiereMotivo && (
          <div className="mt-4">
            <label htmlFor="motivo" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Motivo (obligatorio)
            </label>
            <textarea
              id="motivo"
              rows={3}
              className="mt-1 block w-full rounded-xl border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-brand-interactive focus:outline-none focus:ring-1 focus:ring-brand-interactive dark:border-zinc-700 dark:bg-[#1a233a] dark:text-white sm:text-sm"
              placeholder="Explica la razón..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              autoFocus
            />
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirmar(motivo)}
            disabled={requiereMotivo && !motivo.trim()}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50 ${
              colorAccion === 'red' ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-interactive hover:bg-brand-interactive/90'
            }`}
          >
            {textoAccion}
          </button>
        </div>
      </div>
    </div>
  );
}

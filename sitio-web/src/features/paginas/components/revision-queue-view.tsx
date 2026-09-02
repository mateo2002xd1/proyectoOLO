'use client';

import { useState } from 'react';
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

const ETIQUETA_AMBITO: Record<Ambito, string> = {
  sitio: 'Sitio web',
  intranet: 'Intranet',
};

export function RevisionQueueView() {
  const { paginas, isLoading, error, aprobar, rechazar, eliminar } = useRevisionQueue();
  const [busySlug, setBusySlug] = useState<string | null>(null);

  async function handleEliminar(pagina: PaginaEnRevision) {
    const confirmado = window.confirm(
      `¿Eliminar la versión ${pagina.numeroVersion} de /${pagina.slug}?\n\n` +
      'Se descarta el trabajo sin publicar. Si es la única versión de la página, ' +
      'la próxima edición empezará de nuevo desde la versión 1.',
    );
    if (!confirmado) return;

    setBusySlug(pagina.slug);
    try {
      await eliminar(pagina.slug, pagina.id, pagina.ambito);
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

  async function handleRechazar(pagina: PaginaEnRevision) {
    const motivo = window.prompt('Motivo del rechazo:');
    if (!motivo) return;
    setBusySlug(pagina.slug);
    try {
      await rechazar(pagina.slug, motivo, pagina.ambito);
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
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 8.00092H21.54C21.1909 7.0758 20.6485 6.2358 19.949 5.53694L16.465 2.05094C15.7653 1.35227 14.9251 0.81025 14 0.460938V7.00094C14 7.55317 14.4477 8.00092 15 8.00092Z" fill="currentColor"/>
                <path d="M21.976 9.99998H15C13.3431 9.99998 12 8.65683 12 6.99998V0.024C11.839 0.0129844 11.678 0 11.515 0H6.99997C4.23992 0.00332812 2.00328 2.23997 2 5.00002V19C2.00328 21.76 4.23992 23.9967 6.99997 24H17C19.76 23.9967 21.9966 21.76 22 19V10.485C22 10.322 21.987 10.161 21.976 9.99998Z" fill="currentColor"/>
              </svg>
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
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <svg className="h-8 w-8 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
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
                  onClick={() => handleRechazar(pagina)}
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
                  onClick={() => handleEliminar(pagina)}
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
    </div>
  );
}

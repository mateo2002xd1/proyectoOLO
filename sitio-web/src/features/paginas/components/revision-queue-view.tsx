'use client';

import { useState } from 'react';
import { FileCheck2, FileText, CheckCircle, XCircle, Trash2, ExternalLink } from 'lucide-react';
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
              <FileText className="h-5 w-5" />
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
            <FileCheck2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
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

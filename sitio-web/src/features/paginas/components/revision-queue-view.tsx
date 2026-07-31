'use client';

import { useState } from 'react';
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
    : `/preview/${pagina.slug}`;
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
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-[#f6f6f6]">Páginas en revisión</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Borradores enviados por editores del sitio y de la intranet, pendientes de aprobación.
        </p>
      </div>

      {paginas.length === 0 ? (
        <p className="text-sm text-zinc-500">No hay páginas pendientes de revisión.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {paginas.map((pagina) => (
            <li
              key={pagina.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-[#7db828]/30 dark:bg-[#131b2f]"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-zinc-950 dark:text-[#f6f6f6]">
                    {pagina.titulo}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      pagina.ambito === 'intranet'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200'
                        : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    {ETIQUETA_AMBITO[pagina.ambito] ?? pagina.ambito}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  /{pagina.slug} · versión {pagina.numeroVersion}
                  {pagina.autor?.nombre ? ` · enviado por ${pagina.autor.nombre}` : ''}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <a
                  href={enlaceDeVistaPrevia(pagina)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Ver
                </a>
                <button
                  type="button"
                  disabled={busySlug === pagina.slug}
                  onClick={() => handleAprobar(pagina)}
                  className="rounded-lg bg-[#7DB829] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
                >
                  Aprobar
                </button>
                <button
                  type="button"
                  disabled={busySlug === pagina.slug}
                  onClick={() => handleRechazar(pagina)}
                  className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 disabled:opacity-60"
                >
                  Rechazar
                </button>
                {/* Rechazar devuelve la versión a su autor; eliminar la descarta. */}
                <button
                  type="button"
                  disabled={busySlug === pagina.slug}
                  onClick={() => handleEliminar(pagina)}
                  title="Descartar esta versión sin publicar"
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRevisionQueue } from '../hooks/use-revision-queue';

export function RevisionQueueView() {
  const { paginas, isLoading, error, aprobar, rechazar } = useRevisionQueue();
  const [busySlug, setBusySlug] = useState<string | null>(null);

  async function handleAprobar(slug: string) {
    setBusySlug(slug);
    try {
      await aprobar(slug);
    } finally {
      setBusySlug(null);
    }
  }

  async function handleRechazar(slug: string) {
    const motivo = window.prompt('Motivo del rechazo:');
    if (!motivo) return;
    setBusySlug(slug);
    try {
      await rechazar(slug, motivo);
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
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-white">Páginas en revisión</h1>
        <p className="mt-1 text-sm text-zinc-500">Borradores enviados por editores, pendientes de aprobación.</p>
      </div>

      {paginas.length === 0 ? (
        <p className="text-sm text-zinc-500">No hay páginas pendientes de revisión.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {paginas.map((pagina) => (
            <li
              key={pagina.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-zinc-950 dark:text-white">{pagina.titulo}</p>
                <p className="text-xs text-zinc-500">
                  /{pagina.slug} · versión {pagina.numeroVersion}
                  {pagina.autor?.nombre ? ` · enviado por ${pagina.autor.nombre}` : ''}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  disabled={busySlug === pagina.slug}
                  onClick={() => handleAprobar(pagina.slug)}
                  className="rounded-lg bg-[#7DB829] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
                >
                  Aprobar
                </button>
                <button
                  type="button"
                  disabled={busySlug === pagina.slug}
                  onClick={() => handleRechazar(pagina.slug)}
                  className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 disabled:opacity-60"
                >
                  Rechazar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

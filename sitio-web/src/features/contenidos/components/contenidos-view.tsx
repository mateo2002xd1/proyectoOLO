'use client';

import { useContenidos } from '../hooks/use-contenidos';

export function ContenidosView() {
  const { contenidos, loading } = useContenidos();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-[#344054]">Publicaciones</h1>

      {loading && <p className="text-sm text-[#667085]">Cargando publicaciones…</p>}

      {!loading && contenidos.length === 0 && (
        <p className="text-sm text-[#667085]">Todavía no hay publicaciones disponibles.</p>
      )}

      {!loading && contenidos.length > 0 && (
        <ul className="flex flex-col gap-3">
          {contenidos.map((contenido) => (
            <li key={contenido.id} className="rounded-xl border border-[#eaecf0] p-4">
              <p className="font-medium text-[#344054]">{contenido.title}</p>
              {contenido.excerpt && <p className="text-sm text-[#667085]">{contenido.excerpt}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

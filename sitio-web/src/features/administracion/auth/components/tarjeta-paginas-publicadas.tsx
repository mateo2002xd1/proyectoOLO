'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { rutaPublicaDeSlug, type PaginaPublicada, type ResumenPaginasPublicadas } from '@/features/paginas';

/**
 * Cuántas páginas están publicadas, separadas por aplicación y con el detalle a un clic.
 *
 * Antes la tarjeta «Páginas» del panel mostraba un `0` fijo escrito en el código: no
 * consultaba nada. Ahora sale de `GET /api/paginas/publicadas`, que es la única fuente
 * que sabe qué está publicado de verdad (`versionPublicadaId`).
 *
 * Se separa sitio e intranet porque son dos portales distintos con el mismo slug: las
 * dos tienen `/inicio` y `/menu-y-pie`, y un total conjunto no diría a cuál pertenece
 * cada una ni permitiría enlazarlas bien.
 */

/** La URL del portal de la intranet, que corre en otro origen. */
const URL_INTRANET = process.env.NEXT_PUBLIC_INTRANET_URL || 'http://localhost:3001';

/** Flecha de la sección plegable. Gira en vez de cambiar de icono: un solo elemento que animar. */
function Chevron({ abierto }: { abierto: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`size-3 shrink-0 transition-transform duration-200 ${abierto ? 'rotate-90' : ''}`}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

interface GrupoProps {
  etiqueta: string;
  paginas: PaginaPublicada[];
  /** Cómo se llega a cada página. La intranet vive en otro origen y abre en otra pestaña. */
  externo: boolean;
}

function Grupo({ etiqueta, paginas, externo }: GrupoProps) {
  const [abierto, setAbierto] = useState(false);
  const idLista = useId();
  const vacio = paginas.length === 0;

  return (
    <li>
      {/* `aria-expanded` + `aria-controls` es lo que convierte un botón en un desplegable
          para quien navega con lector de pantalla; sin eso solo se oiría «botón». */}
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        disabled={vacio}
        aria-expanded={abierto}
        aria-controls={idLista}
        className="flex w-full items-center justify-between gap-2 rounded py-1 text-left text-xs transition-colors hover:text-zinc-900 disabled:cursor-default disabled:opacity-60 dark:hover:text-white"
      >
        <span className="flex min-w-0 items-center gap-1.5 text-zinc-500 dark:text-[#94a3b8]">
          {!vacio && <Chevron abierto={abierto} />}
          {/* Sin páginas no hay flecha; el hueco la mantiene alineada con el grupo de al lado. */}
          {vacio && <span aria-hidden="true" className="size-3 shrink-0" />}
          <span className="truncate">{etiqueta}</span>
        </span>
        <span className="font-semibold tabular-nums text-zinc-700 dark:text-[#cbd5e1]">
          {paginas.length}
        </span>
      </button>

      {abierto && !vacio && (
        <ul id={idLista} className="mb-1 ml-[0.34rem] space-y-0.5 border-l border-zinc-200 pl-3 dark:border-[#7db828]/25">
          {paginas.map((pagina) => {
            const href = externo
              ? `${URL_INTRANET}${rutaPublicaDeSlug(pagina.slug)}`
              : rutaPublicaDeSlug(pagina.slug);

            const clases =
              'block truncate rounded py-0.5 text-xs text-[#4C7A1C] transition-colors hover:underline dark:text-[#9ED65C]';

            return (
              <li key={pagina.id}>
                {externo ? (
                  // Otro origen: pestaña nueva, y `noopener` porque sin él la página
                  // destino recibe `window.opener` y puede redirigir esta.
                  <a href={href} target="_blank" rel="noopener noreferrer" className={clases} title={pagina.titulo}>
                    {pagina.titulo}
                    <span className="sr-only"> (se abre en otra pestaña)</span>
                  </a>
                ) : (
                  <Link href={href} className={clases} title={pagina.titulo}>
                    {pagina.titulo}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

interface Props {
  resumen: ResumenPaginasPublicadas | null;
  error: string | null;
}

export function TarjetaPaginasPublicadas({ resumen, error }: Props) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-200 ease-out hover:translate-x-1 hover:border-zinc-300 hover:shadow-sm dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:hover:border-[#334155]">
      <p className="text-sm text-zinc-500 dark:text-[#94a3b8]">Páginas publicadas</p>

      {error ? (
        // Un guion, no un cero: cero es un dato y aquí no se pudo leer ninguno.
        <>
          <p className="mt-1 text-2xl font-bold text-zinc-400 dark:text-zinc-600">—</p>
          <p className="mt-2 text-xs text-red-600 dark:text-red-300">{error}</p>
        </>
      ) : (
        <>
          <p className="mt-1 text-2xl font-bold text-zinc-950 dark:text-[#f6f6f6]">
            {resumen?.total ?? 0}
          </p>

          <ul className="mt-3 border-t border-zinc-100 pt-2 dark:border-[#7db828]/20">
            <Grupo etiqueta="Sitio web" paginas={resumen?.sitio ?? []} externo={false} />
            <Grupo etiqueta="Intranet" paginas={resumen?.intranet ?? []} externo />
          </ul>
        </>
      )}
    </div>
  );
}

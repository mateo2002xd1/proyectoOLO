'use client';

interface PaginadorProps {
  paginaActual: number;
  totalPaginas: number;
  onCambiarPagina: (pagina: number) => void;
}

function ChevronIcon({ direccion }: { direccion: 'izquierda' | 'derecha' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path
        d={direccion === 'izquierda' ? 'm12.5 15-5-5 5-5' : 'm7.5 5 5 5-5 5'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Paginador de la tabla de resultados: evita que una consulta sin filtrar
 * (todos los departamentos, toda formación académica) obligue a hacer
 * scroll por decenas de filas.
 *
 * No se muestra si todo cabe en una sola página (lo decide quien lo usa,
 * `ResultadosProgramasSobresalientes`).
 */
export function Paginador({ paginaActual, totalPaginas, onCambiarPagina }: PaginadorProps) {
  return (
    <nav
      aria-label="Paginación de resultados"
      className="mt-4 flex items-center justify-center gap-1.5"
    >
      <button
        type="button"
        onClick={() => onCambiarPagina(paginaActual - 1)}
        disabled={paginaActual === 1}
        aria-label="Página anterior"
        className="flex h-9 w-9 items-center justify-center rounded-full text-[#344054] transition-colors hover:bg-[#f2f4f7] disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronIcon direccion="izquierda" />
      </button>

      {Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map((numero) => (
        <button
          key={numero}
          type="button"
          onClick={() => onCambiarPagina(numero)}
          aria-current={numero === paginaActual ? 'page' : undefined}
          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium tabular-nums transition-colors ${
            numero === paginaActual
              ? 'bg-[#001631] text-white'
              : 'text-[#344054] hover:bg-[#f2f4f7]'
          }`}
        >
          {numero}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onCambiarPagina(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
        aria-label="Página siguiente"
        className="flex h-9 w-9 items-center justify-center rounded-full text-[#344054] transition-colors hover:bg-[#f2f4f7] disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronIcon direccion="derecha" />
      </button>
    </nav>
  );
}

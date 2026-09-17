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

/** Posiciones entre las dos flechas, contando los `…`. */
const POSICIONES = 7;

type Posicion = number | '…';

/**
 * Qué números mostrar: siempre la primera y la última página, la actual con sus
 * vecinas, y `…` en los huecos.
 *
 * Siempre son exactamente `POSICIONES`, estés en la página que estés. Si el número de
 * botones cambiara al avanzar (`1 2 … 112` en la primera, `1 … 4 5 6 … 112` en la
 * quinta), la flecha «siguiente» se correría bajo el cursor y un segundo clic caería
 * en otro botón. Por lo mismo un `…` nunca tapa una sola página: ocuparía el mismo
 * sitio que el número que esconde.
 */
function posicionesVisibles(actual: number, total: number): Posicion[] {
  if (total <= POSICIONES) {
    return Array.from({ length: total }, (_, indice) => indice + 1);
  }
  if (actual <= 4) {
    return [1, 2, 3, 4, 5, '…', total];
  }
  if (actual >= total - 3) {
    return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, '…', actual - 1, actual, actual + 1, '…', total];
}

/**
 * Paginador de la tabla de resultados: evita que una consulta sin filtrar
 * (todos los departamentos, todas las modalidades) obligue a hacer scroll por
 * decenas de filas.
 *
 * Nunca lista todas las páginas: una consulta sin filtros pasa de cien, y listarlas
 * todas sacaba la fila de botones del ancho de la tabla. Con siete posiciones y las
 * dos flechas cabe en un teléfono de 375px (botones de 32px ahí, 36px desde `sm`).
 *
 * No se muestra si todo cabe en una sola página (lo decide quien lo usa,
 * `ResultadosProgramasSobresalientes`).
 */
export function Paginador({ paginaActual, totalPaginas, onCambiarPagina }: PaginadorProps) {
  const claseBoton =
    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium tabular-nums transition-colors sm:h-9 sm:w-9';

  return (
    <nav
      aria-label="Paginación de resultados"
      className="mt-4 flex items-center justify-center gap-1 sm:gap-1.5"
    >
      <button
        type="button"
        onClick={() => onCambiarPagina(paginaActual - 1)}
        disabled={paginaActual === 1}
        aria-label="Página anterior"
        className={`${claseBoton} text-[#344054] hover:bg-[#f2f4f7] disabled:pointer-events-none disabled:opacity-40`}
      >
        <ChevronIcon direccion="izquierda" />
      </button>

      {posicionesVisibles(paginaActual, totalPaginas).map((posicion, indice) =>
        posicion === '…' ? (
          // `aria-hidden`: un lector de pantalla no gana nada oyendo «puntos
          // suspensivos»; ya oye «página 1» y «página 112» a cada lado.
          <span
            key={`hueco-${indice}`}
            aria-hidden="true"
            className={`${claseBoton} text-[#98a2b3] select-none`}
          >
            …
          </span>
        ) : (
          <button
            key={posicion}
            type="button"
            onClick={() => onCambiarPagina(posicion)}
            aria-label={`Página ${posicion}`}
            aria-current={posicion === paginaActual ? 'page' : undefined}
            className={`${claseBoton} ${
              posicion === paginaActual
                ? 'bg-[#001631] text-white'
                : 'text-[#344054] hover:bg-[#f2f4f7]'
            }`}
          >
            {posicion}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onCambiarPagina(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
        aria-label="Página siguiente"
        className={`${claseBoton} text-[#344054] hover:bg-[#f2f4f7] disabled:pointer-events-none disabled:opacity-40`}
      >
        <ChevronIcon direccion="derecha" />
      </button>
    </nav>
  );
}

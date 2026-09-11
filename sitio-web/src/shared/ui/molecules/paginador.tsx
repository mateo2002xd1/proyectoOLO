'use client';

/** Tamaños de página que ofrece el desplegable, en todas las tablas del panel. */
export const OPCIONES_POR_PAGINA = [15, 30, 60, 100] as const;

interface PaginadorProps {
  /** Página actual, en base 1. */
  pagina: number;
  totalPaginas: number;
  onCambiarPagina: (pagina: number) => void;
  /** Total de elementos sin paginar, para el texto "Mostrando X-Y de Z". */
  total: number;
  porPagina: number;
  onCambiarPorPagina: (porPagina: number) => void;
  /** Sustantivo en plural para el texto: "usuarios", "roles", "registros". */
  etiqueta: string;
  opciones?: readonly number[];
  className?: string;
}

/**
 * Con pocas páginas se listan todas (Roles, Usuarios, Actividad Reciente rara vez
 * pasan de 3-4). Auditoría puede acumular cientos: ahí listar cada número volvería
 * la fila un muro de botones, así que a partir de 8 páginas se recorta a un entorno
 * de la actual más primera y última, con `…` en los huecos.
 */
function rangoDePaginas(actual: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const relevantes = new Set([1, 2, total - 1, total, actual - 1, actual, actual + 1]);
  const ordenadas = [...relevantes].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const resultado: (number | '…')[] = [];
  ordenadas.forEach((p, i) => {
    if (i > 0 && p - ordenadas[i - 1] > 1) resultado.push('…');
    resultado.push(p);
  });
  return resultado;
}

/** Paginador con selector de filas por página, reutilizado en Roles, Usuarios,
 *  Actividad Reciente y Auditoría — mismo aspecto en las cuatro tablas. */
export function Paginador({
  pagina,
  totalPaginas,
  onCambiarPagina,
  total,
  porPagina,
  onCambiarPorPagina,
  etiqueta,
  opciones = OPCIONES_POR_PAGINA,
  className = '',
}: PaginadorProps) {
  if (total === 0) return null;

  const desde = (pagina - 1) * porPagina + 1;
  const hasta = Math.min(pagina * porPagina, total);

  return (
    // El padding horizontal no trae valor por defecto: dos clases `px-*` en el
    // mismo elemento compiten por orden de aparición en el CSS generado, no por
    // orden en el atributo `class`, así que un valor por defecto aquí no se deja
    // pisar de forma confiable por `className`. Cada tabla pasa el suyo.
    <div
      className={`flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 py-3 dark:border-zinc-800 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-xs text-zinc-500 dark:text-[#94a3b8]">
          Mostrando {desde}-{hasta} de {total} {etiqueta}
        </span>
        <label className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-[#94a3b8]">
          Filas por página
          <select
            value={porPagina}
            onChange={(e) => onCambiarPorPagina(Number(e.target.value))}
            className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-[#131b2f] dark:text-zinc-200 dark:focus:border-white dark:focus:ring-white"
          >
            {opciones.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      {totalPaginas > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={pagina === 1}
            onClick={() => onCambiarPagina(pagina - 1)}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"
          >
            &lsaquo;
          </button>
          {rangoDePaginas(pagina, totalPaginas).map((p, i) =>
            p === '…' ? (
              <span key={`e${i}`} className="px-1 text-xs text-zinc-400">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onCambiarPagina(p)}
                className={`min-w-[2rem] rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                  p === pagina
                    ? 'bg-brand-interactive text-white'
                    : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                }`}
              >
                {p}
              </button>
            ),
          )}
          <button
            type="button"
            disabled={pagina === totalPaginas}
            onClick={() => onCambiarPagina(pagina + 1)}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"
          >
            &rsaquo;
          </button>
        </div>
      )}
    </div>
  );
}

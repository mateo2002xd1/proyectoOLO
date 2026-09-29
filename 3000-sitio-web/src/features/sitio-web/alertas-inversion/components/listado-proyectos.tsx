'use client';

import type { ProyectoInversionPublico } from '../types';

const formatearCop = (valor: number | null) =>
  valor === null ? '—' : `$${valor.toLocaleString('es-CO')}`;

const formatearFecha = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('es-CO', { dateStyle: 'medium' });

interface ListadoProyectosProps {
  proyectos: ProyectoInversionPublico[];
  total: number;
  pagina: number;
  totalPaginas: number;
  onCambiarPagina: (pagina: number) => void;
}

/** Tabla del listado que acompaña al gráfico — mismo criterio de densidad que el resto del sitio. */
export function ListadoProyectos({ proyectos, total, pagina, totalPaginas, onCambiarPagina }: ListadoProyectosProps) {
  if (proyectos.length === 0) {
    return (
      <p className="rounded-[20px] border border-dashed border-[#d0d5dd] px-4 py-10 text-center text-sm text-[#667085]">
        No hay proyectos para este filtro.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[#667085]">{total.toLocaleString('es-CO')} proyecto(s)</p>
      <div className="overflow-x-auto rounded-[16px] border border-[#eaecf0]">
        <table className="olo-tabla-apilable w-full text-left text-sm">
          <thead className="bg-[#f8f9fa] text-xs uppercase tracking-wide text-[#667085]">
            <tr>
              <th scope="col" className="px-3 py-2 font-medium">Empresa</th>
              <th scope="col" className="px-3 py-2 font-medium">Sector</th>
              <th scope="col" className="px-3 py-2 font-medium">Ubicación</th>
              <th scope="col" className="px-3 py-2 font-medium">Fecha</th>
              <th scope="col" className="px-3 py-2 font-medium">Inversión</th>
              <th scope="col" className="px-3 py-2 font-medium">Fuente</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eaecf0]">
            {proyectos.map((p) => (
              <tr key={p.id}>
                <td data-etiqueta="Empresa" className="px-3 py-3 font-medium text-[#001631]">{p.empresa}</td>
                <td data-etiqueta="Sector" className="px-3 py-3 text-[#344054]">{p.sector}</td>
                <td data-etiqueta="Ubicación" className="px-3 py-3 text-[#344054]">{p.ubicaciones || '—'}</td>
                <td data-etiqueta="Fecha" className="whitespace-nowrap px-3 py-3 text-[#344054]">{formatearFecha(p.fechaAnuncio)}</td>
                <td data-etiqueta="Inversión" className="whitespace-nowrap px-3 py-3 tabular-nums text-[#344054]">
                  {formatearCop(p.inversionCop)}
                </td>
                <td data-etiqueta="Fuente" className="px-3 py-3">
                  <a
                    href={p.fuenteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-interactive underline underline-offset-2"
                  >
                    {p.fuenteMedio ?? 'Ver noticia'}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            disabled={pagina <= 1}
            onClick={() => onCambiarPagina(pagina - 1)}
            className="rounded-md border border-[#d0d5dd] px-3 py-1.5 text-sm text-[#344054] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-[#667085]">Página {pagina} de {totalPaginas}</span>
          <button
            type="button"
            disabled={pagina >= totalPaginas}
            onClick={() => onCambiarPagina(pagina + 1)}
            className="rounded-md border border-[#d0d5dd] px-3 py-1.5 text-sm text-[#344054] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

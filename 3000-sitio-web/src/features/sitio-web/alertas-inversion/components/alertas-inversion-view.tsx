'use client';

import { useAlertasInversion } from '../hooks/use-alertas-inversion';
import { GraficoSectores } from './grafico-sectores';
import { ListadoProyectos } from './listado-proyectos';

/**
 * Panel público "Alertas de inversión": proyectos de inversión anunciados, agrupados
 * por sector económico (CIIU). El gráfico y el listado comparten los mismos filtros
 * (año, sector) — clic en una barra filtra la tabla por ese sector.
 */
export function AlertasInversionView() {
  const { opciones, grafico, listado, anio, seccion, pagina, cargando, error, seleccionarSector, seleccionarAnio, irAPagina } =
    useAlertasInversion();

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[#001631] sm:text-3xl">Alertas de inversión</h1>
        <p className="text-base text-[#475467]">
          Proyectos de inversión, nuevos o de expansión, anunciados en Colombia — agrupados por sector económico.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-[#344054]" htmlFor="filtro-anio">Año</label>
        <select
          id="filtro-anio"
          value={anio}
          onChange={(e) => seleccionarAnio(e.target.value)}
          className="rounded-lg border border-[#d0d5dd] bg-white px-3 py-2 text-sm text-[#344054]"
        >
          <option value="">Todos</option>
          {opciones.anios.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        {seccion && (
          <button
            type="button"
            onClick={() => seleccionarSector(seccion)}
            className="inline-flex items-center gap-1 rounded-full bg-[#7db828]/10 px-3 py-1 text-sm font-medium text-[#4d7a13]"
          >
            Sector: {seccion} · quitar filtro
          </button>
        )}
      </div>

      {error ? (
        <div className="rounded-[20px] border border-[#eaecf0] bg-white py-10 text-center" aria-live="polite">
          <p className="text-sm font-medium text-[#344054]">{error}</p>
        </div>
      ) : cargando ? (
        <div className="rounded-[20px] border border-[#eaecf0] bg-[#f8f9fa] py-16 text-center" aria-live="polite">
          <p className="text-sm text-[#667085]">Cargando datos...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <GraficoSectores datos={grafico} seccionSeleccionada={seccion} onSeleccionar={seleccionarSector} />
          <ListadoProyectos
            proyectos={listado.proyectos}
            total={listado.total}
            pagina={pagina}
            totalPaginas={listado.totalPaginas}
            onCambiarPagina={irAPagina}
          />
        </div>
      )}
    </div>
  );
}

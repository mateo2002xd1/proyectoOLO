'use client';

import { useAlertasInversion } from '../hooks/use-alertas-inversion';
import { GraficoSectores } from './grafico-sectores';
import { ListadoProyectos } from './listado-proyectos';

/** Un filtro del panel: etiqueta + selector con la opción "todos" al inicio. */
function CampoFiltro({
  id,
  etiqueta,
  valor,
  onCambio,
  todos,
  children,
}: {
  id: string;
  etiqueta: string;
  valor: string;
  onCambio: (valor: string) => void;
  todos: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label className="text-sm font-medium text-[#344054]" htmlFor={id}>{etiqueta}</label>
      <select
        id={id}
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        className="max-w-full rounded-lg border border-[#d0d5dd] bg-white px-3 py-2 text-sm text-[#344054]"
      >
        <option value="">{todos}</option>
        {children}
      </select>
    </div>
  );
}

interface AlertasInversionViewProps {
  titulo?: string;
  descripcion?: string;
}

/**
 * Panel público "Alertas de inversión": proyectos de inversión anunciados, agrupados
 * por sector económico (CIIU). El gráfico y el listado comparten los mismos filtros
 * (sector, departamento, año) — clic en una barra filtra la tabla por ese sector.
 *
 * Se monta como el bloque `AlertasInversion` de Puck: el título y la descripción los
 * pone el editor; vacíos, no se pinta su línea.
 */
export function AlertasInversionView({
  titulo = 'Alertas de inversión',
  descripcion = 'Proyectos de inversión, nuevos o de expansión, anunciados en Colombia — agrupados por sector económico.',
}: AlertasInversionViewProps = {}) {
  const { opciones, grafico, listado, anio, departamento, seccion, pagina, cargando, actualizando, error, seleccionarSector, seleccionarDepartamento, seleccionarAnio, irAPagina } =
    useAlertasInversion();

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      {(titulo || descripcion) && (
        <div className="flex flex-col gap-2">
          {titulo && <h1 className="text-2xl font-bold text-[#001631] sm:text-3xl">{titulo}</h1>}
          {descripcion && <p className="text-base text-[#475467]">{descripcion}</p>}
        </div>
      )}

      <div className="flex flex-wrap items-end gap-4">
        <CampoFiltro id="filtro-sector" etiqueta="Sector" valor={seccion} onCambio={seleccionarSector} todos="Todos">
          {opciones.secciones.map((s) => (
            <option key={s.letra} value={s.letra}>{s.letra} · {s.nombre}</option>
          ))}
        </CampoFiltro>
        <CampoFiltro id="filtro-departamento" etiqueta="Departamento" valor={departamento} onCambio={seleccionarDepartamento} todos="Todos">
          {opciones.departamentos.map((d) => (
            <option key={d.codigoDane} value={d.codigoDane}>{d.nombre}</option>
          ))}
        </CampoFiltro>
        <CampoFiltro id="filtro-anio" etiqueta="Año" valor={anio} onCambio={seleccionarAnio} todos="Todos">
          {opciones.anios.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </CampoFiltro>
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
        <div className={`flex flex-col gap-8 transition-opacity ${actualizando ? 'opacity-60' : ''}`} aria-busy={actualizando}>
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

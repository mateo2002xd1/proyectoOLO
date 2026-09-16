'use client';

import { useMemo } from 'react';
import { useProgramasSobresalientes } from '../hooks/use-programas-sobresalientes';
import { FiltrosProgramasSobresalientes } from './filtros-programas-sobresalientes';
import { MapaDepartamentos } from './mapa-departamentos';
import { ResultadosProgramasSobresalientes } from './resultados-programas-sobresalientes';

/**
 * Panel "Programa + sobresalientes SENA".
 *
 * Mapa de Colombia a la izquierda (elige el departamento, y queda fijo al
 * hacer scroll en pantallas grandes) y a la derecha los filtros —Formación
 * Académica, Género y Programa— y la tabla de resultados, todo conectado al
 * mismo estado. Los datos vienen de `GET /api/observatorio/programas-sobresalientes` (la
 * última carga `completado` del Excel de SENA, cargado desde "Actualizaciones"
 * en el panel de administración) — de solo lectura: este componente nunca sube
 * ni modifica nada.
 */
export interface ProgramasSobresalientesViewProps {
  mostrarTitulo?: boolean;
  titulo?: string;
  alineacionTitulo?: 'izquierda' | 'centro' | 'derecha';
  colorTitulo?: string;
  mostrarDescripcion?: boolean;
  descripcion?: string;
  alineacionDescripcion?: 'izquierda' | 'centro' | 'derecha';
  colorDescripcion?: string;
  ocultarEncabezado?: boolean;
}

export function ProgramasSobresalientesView({
  mostrarTitulo = true,
  titulo = 'Programas + sobresalientes SENA',
  alineacionTitulo = 'centro',
  colorTitulo,
  mostrarDescripcion = true,
  descripcion,
  alineacionDescripcion = 'centro',
  colorDescripcion,
  ocultarEncabezado = false,
}: ProgramasSobresalientesViewProps = {}) {
  const {
    filtros,
    cargando,
    error,
    departamentosConDatos,
    nivelesDisponibles,
    sexos,
    programasDisponibles,
    resultados,
    totalResultados,
    pagina,
    totalPaginas,
    irAPagina,
    seleccionarDepartamento,
    seleccionarNivelFormacion,
    seleccionarSexo,
    seleccionarPrograma,
  } = useProgramasSobresalientes();

  const codigosConDatos = useMemo(
    () => new Set(departamentosConDatos.map((d) => d.codigoDane)),
    [departamentosConDatos],
  );

  const departamentoActivo =
    filtros.codigoDane === 'todos'
      ? null
      : (departamentosConDatos.find((d) => d.codigoDane === filtros.codigoDane)?.nombre ?? null);

  const claseAlineacionTitulo =
    alineacionTitulo === 'izquierda'
      ? 'text-left'
      : alineacionTitulo === 'derecha'
      ? 'text-right'
      : 'text-center';

  const claseAlineacionDescripcion =
    alineacionDescripcion === 'izquierda'
      ? 'text-left'
      : alineacionDescripcion === 'derecha'
      ? 'text-right'
      : 'text-center';

  const estiloTitulo = colorTitulo ? { color: colorTitulo } : undefined;
  const estiloDescripcion = colorDescripcion ? { color: colorDescripcion } : undefined;

  const hayCabecera =
    !ocultarEncabezado &&
    ((mostrarTitulo && Boolean(titulo)) || (mostrarDescripcion && Boolean(descripcion)));

  return (
    <div className="mx-auto flex max-w-[1920px] flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      {hayCabecera && (
        <div className="flex flex-col gap-2">
          {mostrarTitulo && titulo && (
            <h1
              className={`text-2xl font-bold sm:text-3xl text-[#001631] ${claseAlineacionTitulo}`}
              style={estiloTitulo}
            >
              {titulo}
            </h1>
          )}
          {mostrarDescripcion && descripcion && (
            <p
              className={`text-base text-[#475467] ${claseAlineacionDescripcion}`}
              style={estiloDescripcion}
            >
              {descripcion}
            </p>
          )}
        </div>
      )}

      {error ? (
        <div className="rounded-[20px] border border-[#eaecf0] bg-white py-10 text-center" aria-live="polite">
          <p className="text-sm font-medium text-[#344054]">{error}</p>
        </div>
      ) : cargando ? (
        <div className="rounded-[20px] border border-[#eaecf0] bg-[#f8f9fa] py-16 text-center" aria-live="polite">
          <p className="text-sm text-[#667085]">Cargando datos de formación...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 2xl:flex-row 2xl:items-start">
          <div className="2xl:sticky 2xl:top-[104px] 2xl:w-[440px] 2xl:flex-shrink-0">
            <MapaDepartamentos
              codigosConDatos={codigosConDatos}
              codigoSeleccionado={filtros.codigoDane}
              onSeleccionar={seleccionarDepartamento}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <FiltrosProgramasSobresalientes
              filtros={filtros}
              nivelesDisponibles={nivelesDisponibles}
              sexos={sexos}
              programasDisponibles={programasDisponibles}
              onSeleccionarNivelFormacion={seleccionarNivelFormacion}
              onSeleccionarSexo={seleccionarSexo}
              onSeleccionarPrograma={seleccionarPrograma}
            />

            <ResultadosProgramasSobresalientes
              resultados={resultados}
              totalResultados={totalResultados}
              departamentoActivo={departamentoActivo}
              pagina={pagina}
              totalPaginas={totalPaginas}
              onCambiarPagina={irAPagina}
            />
          </div>
        </div>
      )}
    </div>
  );
}

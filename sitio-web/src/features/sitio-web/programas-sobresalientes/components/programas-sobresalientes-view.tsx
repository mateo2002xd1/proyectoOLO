'use client';

import { useMemo } from 'react';
import { useProgramasSobresalientes } from '../hooks/use-programas-sobresalientes';
import { FiltrosProgramasSobresalientes } from './filtros-programas-sobresalientes';
import { MapaDepartamentos } from './mapa-departamentos';
import { ResultadosProgramasSobresalientes } from './resultados-programas-sobresalientes';

/**
 * Panel "Programas + sobresalientes SENA".
 *
 * Mapa de Colombia (elige el departamento), y debajo los filtros —Centro,
 * Formación Académica, Género y Programa— y la tabla de resultados, todo
 * conectado al mismo estado. Es solo de frontend (ver
 * `lib/programas-sobresalientes-temporal.ts`): no hay base de datos ni
 * llamada a la API detrás; simula el esquema estrella de `formacion_indicadores`.
 */
export function ProgramasSobresalientesView() {
  const {
    filtros,
    departamentosConDatos,
    centrosDisponibles,
    nivelesDisponibles,
    sexos,
    programasDisponibles,
    resultados,
    totalResultados,
    pagina,
    totalPaginas,
    irAPagina,
    seleccionarDepartamento,
    seleccionarCentro,
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

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#001631] sm:text-3xl">Programas + sobresalientes SENA</h1>
      </div>

      <MapaDepartamentos
        codigosConDatos={codigosConDatos}
        codigoSeleccionado={filtros.codigoDane}
        onSeleccionar={seleccionarDepartamento}
      />

      <FiltrosProgramasSobresalientes
        filtros={filtros}
        centrosDisponibles={centrosDisponibles}
        nivelesDisponibles={nivelesDisponibles}
        sexos={sexos}
        programasDisponibles={programasDisponibles}
        onSeleccionarCentro={seleccionarCentro}
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
  );
}

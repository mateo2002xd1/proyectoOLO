'use client';

import { CustomSelect } from '@/shared/ui/molecules/custom-select';
import type { FiltrosFormacion } from '../types';

/** Etiquetas de presentación para el `CHECK` de sexo del esquema real. */
const ETIQUETA_SEXO: Record<string, string> = { M: 'Masculino', F: 'Femenino' };

interface FiltrosProgramasSobresalientesProps {
  filtros: FiltrosFormacion;
  nivelesDisponibles: string[];
  sexos: string[];
  programasDisponibles: string[];
  onSeleccionarNivelFormacion: (nivelFormacion: string) => void;
  onSeleccionarSexo: (sexo: string) => void;
  onSeleccionarPrograma: (programa: string) => void;
}

/**
 * Barra de filtros de consulta: Modalidad + Género + Programa.
 *
 * «Modalidad» filtra por `nivelFormacion` (la columna "Nivel de Formación" del
 * Excel). Se llama igual que la columna de la tabla de resultados para que quien
 * filtra reconozca en la tabla lo que eligió.
 *
 * El departamento no tiene select propio: se elige directamente en el mapa
 * (`MapaDepartamentos`), que comparte el mismo estado de filtros. Sin filtro de
 * Centro a propósito (decisión de sesión) — el centro se sigue mostrando en la
 * tabla de resultados, pero dejó de ser un criterio de búsqueda.
 */
export function FiltrosProgramasSobresalientes({
  filtros,
  nivelesDisponibles,
  sexos,
  programasDisponibles,
  onSeleccionarNivelFormacion,
  onSeleccionarSexo,
  onSeleccionarPrograma,
}: FiltrosProgramasSobresalientesProps) {
  const opcionesNivel = [
    { value: 'todos', label: 'Modalidad' },
    ...nivelesDisponibles.map((nivel) => ({ value: nivel, label: nivel })),
  ];

  const opcionesSexo = [
    { value: 'todos', label: 'Género' },
    ...sexos.map((sexo) => ({ value: sexo, label: ETIQUETA_SEXO[sexo] ?? sexo })),
  ];

  const opcionesPrograma = [
    { value: 'todos', label: 'Programa' },
    ...programasDisponibles.map((programa) => ({ value: programa, label: programa })),
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
      <CustomSelect
        value={filtros.nivelFormacion}
        onChange={onSeleccionarNivelFormacion}
        options={opcionesNivel}
        ariaLabel="Filtrar por modalidad"
        className="sm:w-56"
      />

      <CustomSelect
        value={filtros.sexo}
        onChange={onSeleccionarSexo}
        options={opcionesSexo}
        ariaLabel="Filtrar por género"
        className="sm:w-44"
      />

      <CustomSelect
        value={filtros.programa}
        onChange={onSeleccionarPrograma}
        options={opcionesPrograma}
        ariaLabel="Filtrar por programa"
        className="sm:w-64"
      />
    </div>
  );
}

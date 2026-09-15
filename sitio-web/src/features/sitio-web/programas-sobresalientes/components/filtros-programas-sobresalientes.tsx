'use client';

import { CustomSelect } from '@/shared/ui/molecules/custom-select';
import type { FiltrosFormacion } from '../types';

/** Etiquetas de presentación para el `ENUM` de sexo del esquema real. */
const ETIQUETA_SEXO: Record<string, string> = { M: 'Masculino', F: 'Femenino' };

interface FiltrosProgramasSobresalientesProps {
  filtros: FiltrosFormacion;
  centrosDisponibles: string[];
  nivelesDisponibles: string[];
  sexos: string[];
  programasDisponibles: string[];
  onSeleccionarCentro: (centro: string) => void;
  onSeleccionarNivelFormacion: (nivelFormacion: string) => void;
  onSeleccionarSexo: (sexo: string) => void;
  onSeleccionarPrograma: (programa: string) => void;
}

/**
 * Barra de filtros de consulta: Centro + Formación Académica + Género + Programa.
 *
 * El departamento no tiene select propio: se elige directamente en el mapa
 * (`MapaDepartamentos`), que comparte el mismo estado de filtros. Sin tarjeta
 * de fondo: los controles quedan sueltos sobre el fondo de la página, cada
 * uno con su propio borde.
 */
export function FiltrosProgramasSobresalientes({
  filtros,
  centrosDisponibles,
  nivelesDisponibles,
  sexos,
  programasDisponibles,
  onSeleccionarCentro,
  onSeleccionarNivelFormacion,
  onSeleccionarSexo,
  onSeleccionarPrograma,
}: FiltrosProgramasSobresalientesProps) {
  const opcionesCentro = [
    { value: 'todos', label: 'Centro' },
    ...centrosDisponibles.map((centro) => ({ value: centro, label: centro })),
  ];

  const opcionesNivel = [
    { value: 'todos', label: 'Formación Académica' },
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
        value={filtros.centro}
        onChange={onSeleccionarCentro}
        options={opcionesCentro}
        ariaLabel="Filtrar por centro"
        className="sm:w-64"
      />

      <CustomSelect
        value={filtros.nivelFormacion}
        onChange={onSeleccionarNivelFormacion}
        options={opcionesNivel}
        ariaLabel="Filtrar por formación académica"
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

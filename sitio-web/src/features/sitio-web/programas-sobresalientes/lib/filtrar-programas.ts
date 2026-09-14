import type { DepartamentoFormacion, FiltrosFormacion, RegistroConDepartamento } from '../types';

/** Aplana el fixture por departamento en filas de registro + su departamento. */
export function aplanarProgramas(porDepartamento: DepartamentoFormacion[]): RegistroConDepartamento[] {
  return porDepartamento.flatMap((departamento) =>
    departamento.registros.map((registro) => ({
      ...registro,
      codigoDane: departamento.codigoDane,
      departamento: departamento.nombre,
    })),
  );
}

/**
 * Filtra los registros por departamento (elegido en el mapa), centro, nivel
 * de formación, sexo y programa. Todos los criterios se combinan con AND;
 * cada uno compara igualdad exacta contra la dimensión correspondiente.
 */
export function filtrarProgramas(
  registros: RegistroConDepartamento[],
  filtros: FiltrosFormacion,
): RegistroConDepartamento[] {
  return registros.filter((registro) => {
    if (filtros.codigoDane !== 'todos' && registro.codigoDane !== filtros.codigoDane) return false;
    if (filtros.centro !== 'todos' && registro.centro !== filtros.centro) return false;
    if (filtros.nivelFormacion !== 'todos' && registro.nivelFormacion !== filtros.nivelFormacion) return false;
    if (filtros.sexo !== 'todos' && registro.sexo !== filtros.sexo) return false;
    if (filtros.programa !== 'todos' && registro.programa !== filtros.programa) return false;
    return true;
  });
}

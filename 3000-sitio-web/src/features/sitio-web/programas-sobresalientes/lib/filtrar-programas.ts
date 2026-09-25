import type { FiltrosFormacion, RegistroConDepartamento } from '../types';

/**
 * Filtra los registros por departamento (elegido en el mapa), nivel de
 * formación, sexo y programa. Todos los criterios se combinan con AND; cada uno
 * compara igualdad exacta contra la dimensión correspondiente.
 *
 * Sin filtro de Centro a propósito (decisión de sesión) — el centro se sigue
 * mostrando en la tabla de resultados, pero dejó de ser un criterio de búsqueda.
 */
export function filtrarProgramas(
  registros: RegistroConDepartamento[],
  filtros: FiltrosFormacion,
): RegistroConDepartamento[] {
  return registros.filter((registro) => {
    if (filtros.codigoDane !== 'todos' && registro.codigoDane !== filtros.codigoDane) return false;
    if (filtros.nivelFormacion !== 'todos' && registro.nivelFormacion !== filtros.nivelFormacion) return false;
    if (filtros.sexo !== 'todos' && registro.sexo !== filtros.sexo) return false;
    if (filtros.programa !== 'todos' && registro.programa !== filtros.programa) return false;
    return true;
  });
}

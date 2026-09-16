/**
 * Punto de entrada público del módulo programas-sobresalientes.
 *
 * Regla de oro §0.3: un módulo de dominio no importa archivos internos de
 * otro módulo. Todo lo que otros módulos necesiten de aquí se exporta desde
 * este archivo.
 */

// Components
export { ProgramasSobresalientesView } from './components/programas-sobresalientes-view';
export { MapaDepartamentos } from './components/mapa-departamentos';
export { FiltrosProgramasSobresalientes } from './components/filtros-programas-sobresalientes';
export { ResultadosProgramasSobresalientes } from './components/resultados-programas-sobresalientes';
export { Paginador } from './components/paginador';

// Hooks
export { useProgramasSobresalientes } from './hooks/use-programas-sobresalientes';

// Types
export type {
  DepartamentoConDatos,
  FiltrosFormacion,
  NivelFormacion,
  RegistroConDepartamento,
  RegistroFormacion,
  Sexo,
} from './types';

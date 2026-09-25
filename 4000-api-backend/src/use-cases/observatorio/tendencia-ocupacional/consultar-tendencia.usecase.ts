import { DepartamentosRepository } from '../../../repositories/departamentos.repository';
import {
  TendenciaOcupacionalRepository as Repo,
  type FiltrosBuscador,
} from '../../../repositories/tendencia-ocupacional.repository';

/** Lo que alimenta los desplegables del buscador. Todo sale de la base, nada fijo en el front. */
export interface OpcionesTendencia {
  /** Solo años con al menos un corte publicado, del más reciente al más antiguo. */
  anios: number[];
  /** Año al que corresponde `disponible` en `periodos` (el pedido o, si no, el más reciente). */
  anio: number | null;
  periodos: { codigo: string; nombre: string; disponible: boolean }[];
  niveles: { codigo: string; etiqueta: string; nombre: string; descripcion: string | null }[];
  /** "Nacional" primero (valor `nacional`), luego los 33 por nombre con su código DANE. */
  departamentos: { valor: string; nombre: string }[];
  /** En su orden (1–4 de la especificación); `codigo` es lo que filtra el buscador. */
  criterios: { codigo: string; nombre: string }[];
}

export interface RegistroTendencia {
  codigo: string;
  nombre: string;
  nivelCodigo: string;
  /** Mismo texto que la opción del filtro "Nivel Ocupacional". */
  nivelEtiqueta: string;
  inscritos: number;
  vacantes: number;
  percentilInscritos: number | null;
  percentilVacantes: number | null;
  /** Código del criterio (`ALTA_OFERTA_ALTA_DEMANDA`…). */
  criterio: string;
}

export interface ResultadoTendencia {
  registros: RegistroTendencia[];
  total: number;
  pagina: number;
  porPagina: number;
  totalPaginas: number;
  /** Suma de todas las filas que cumplen los filtros, no solo de la página. */
  totales: { inscritos: number; vacantes: number };
  /** Códigos DANE con resultados para estos filtros: los departamentos que se pintan en el mapa. */
  departamentosConResultados: string[];
}

/**
 * Opciones de los filtros. Público, sin sesión.
 *
 * @param anio año para marcar qué periodos tienen datos; si no llega, el más reciente.
 */
export async function consultarOpcionesTendencia(anio?: number): Promise<OpcionesTendencia> {
  const [anios, niveles, departamentos, criterios] = await Promise.all([
    Repo.aniosPublicados(),
    Repo.niveles(),
    DepartamentosRepository.listar(),
    Repo.criterios(),
  ]);
  // Sin año pedido, el más reciente que no sea futuro: con proyecciones publicadas (2040)
  // quien llega al sitio ve primero los datos de hoy. Si solo hay años futuros, el más
  // cercano. `anios` viene del más reciente al más antiguo.
  const anioActual = new Date().getFullYear();
  const anioEfectivo = anio ?? anios.find((a) => a <= anioActual) ?? anios[anios.length - 1] ?? null;

  return {
    anios,
    anio: anioEfectivo,
    periodos: await Repo.periodosConDisponibilidad(anioEfectivo),
    niveles,
    departamentos: [
      { valor: 'nacional', nombre: 'Nacional' },
      ...departamentos.map((d) => ({ valor: d.codigo_dane, nombre: d.nombre })),
    ],
    criterios,
  };
}

/**
 * Buscador de tendencia ocupacional. Público, sin sesión, y solo sobre cortes publicados:
 * un corte en borrador no llega al sitio (convención 10 de la guía).
 *
 * Los filtros se aplican en SQL y la paginación también; los totales se calculan sobre
 * todas las filas que cumplen los filtros.
 */
export async function consultarTendencia(
  filtros: FiltrosBuscador,
  pagina: number,
  porPagina: number
): Promise<ResultadoTendencia> {
  const [resultado, departamentosConResultados] = await Promise.all([
    Repo.buscar(filtros, porPagina, (pagina - 1) * porPagina),
    Repo.departamentosConResultados(filtros),
  ]);

  return {
    registros: resultado.filas.map((f) => ({
      codigo: f.ocupacion_codigo,
      nombre: f.ocupacion_nombre,
      nivelCodigo: f.nivel_codigo,
      nivelEtiqueta: f.nivel_etiqueta,
      inscritos: Number(f.inscritos),
      vacantes: Number(f.vacantes),
      percentilInscritos: f.percentil_inscritos,
      percentilVacantes: f.percentil_vacantes,
      criterio: f.criterio_codigo,
    })),
    total: resultado.total,
    pagina,
    porPagina,
    totalPaginas: Math.max(1, Math.ceil(resultado.total / porPagina)),
    totales: { inscritos: resultado.totalInscritos, vacantes: resultado.totalVacantes },
    departamentosConResultados,
  };
}

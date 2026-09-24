import type { TipoTendenciaOcupacional } from '../types';

/**
 * Títulos oficiales según el cuadrante de tendencias ocupacionales:
 */
export const TITULOS_TENDENCIA: Record<TipoTendenciaOcupacional, string> = {
  'mas-menos':
    'Ocupaciones más solicitadas por los empresarios y menos registradas por personas que buscan empleo',
  'mas-mas':
    'Ocupaciones más solicitadas por los empresarios y más registradas por personas que buscan empleo',
  'menos-menos':
    'Ocupaciones menos solicitadas por los empresarios y menos registradas por personas que buscan empleo',
  'menos-mas':
    'Ocupaciones menos solicitadas por los empresarios y más registradas por personas que buscan empleo',
};

/**
 * Cuadrante del bloque → criterio de la base (`criterios_ocupacionales.id`), que es lo
 * que filtra la consulta: cada bloque del sitio muestra un solo criterio.
 *
 * El nombre del cuadrante va primero por empresarios (vacantes) y luego por quienes
 * buscan empleo (inscritos); el criterio se define con el percentil 80 de cada uno:
 *   1  inscritos > 80 % y vacantes > 80 %    → más / más
 *   2  inscritos > 80 % y vacantes <= 80 %   → menos solicitadas / más registradas
 *   3  vacantes > 80 % e inscritos <= 80 %   → más solicitadas / menos registradas
 *   4  los dos <= 80 %                        → menos / menos
 */
export const CRITERIO_POR_TIPO: Record<TipoTendenciaOcupacional, number> = {
  'mas-mas': 1,
  'menos-mas': 2,
  'mas-menos': 3,
  'menos-menos': 4,
};

/**
 * Subtítulos recomendados por cuadrante:
 */
export const SUBTITULOS_TENDENCIA: Record<TipoTendenciaOcupacional, string> = {
  'mas-menos': 'Tendencias ocupacionales: Alta demanda empresarial / Baja oferta de postulantes (Más / Menos)',
  'mas-mas': 'Tendencias ocupacionales: Alta demanda empresarial / Alta oferta de postulantes (Más / Más)',
  'menos-menos': 'Tendencias ocupacionales: Baja demanda empresarial / Baja oferta de postulantes (Menos / Menos)',
  'menos-mas': 'Tendencias ocupacionales: Baja demanda empresarial / Alta oferta de postulantes (Menos / Más)',
};

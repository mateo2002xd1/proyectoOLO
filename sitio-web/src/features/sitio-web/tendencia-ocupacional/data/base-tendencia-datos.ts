import type { CodigoCriterio, TipoTendenciaOcupacional } from '../types';

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
 * Cuadrante del bloque → criterio de la base (`criterios_ocupacionales.codigo`), que es
 * lo que filtra la consulta: cada bloque del sitio muestra un solo criterio.
 *
 * El nombre del cuadrante va primero por empresarios (vacantes) y luego por quienes
 * buscan empleo (inscritos); el criterio se define con el percentil 80 de cada uno:
 *   ALTA_OFERTA_ALTA_DEMANDA  inscritos > 80 % y vacantes > 80 %    → más / más
 *   ALTA_OFERTA_BAJA_DEMANDA  inscritos > 80 % y vacantes <= 80 %   → menos solicitadas / más registradas
 *   BAJA_OFERTA_ALTA_DEMANDA  vacantes > 80 % e inscritos <= 80 %   → más solicitadas / menos registradas
 *   BAJA_OFERTA_BAJA_DEMANDA  los dos <= 80 %                        → menos / menos
 */
export const CRITERIO_POR_TIPO: Record<TipoTendenciaOcupacional, CodigoCriterio> = {
  'mas-mas': 'ALTA_OFERTA_ALTA_DEMANDA',
  'menos-mas': 'ALTA_OFERTA_BAJA_DEMANDA',
  'mas-menos': 'BAJA_OFERTA_ALTA_DEMANDA',
  'menos-menos': 'BAJA_OFERTA_BAJA_DEMANDA',
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

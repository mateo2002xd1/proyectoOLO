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
 * Subtítulos recomendados por cuadrante:
 */
export const SUBTITULOS_TENDENCIA: Record<TipoTendenciaOcupacional, string> = {
  'mas-menos': 'Tendencias ocupacionales: Alta demanda empresarial / Baja oferta de postulantes (Más / Menos)',
  'mas-mas': 'Tendencias ocupacionales: Alta demanda empresarial / Alta oferta de postulantes (Más / Más)',
  'menos-menos': 'Tendencias ocupacionales: Baja demanda empresarial / Baja oferta de postulantes (Menos / Menos)',
  'menos-mas': 'Tendencias ocupacionales: Baja demanda empresarial / Alta oferta de postulantes (Menos / Más)',
};

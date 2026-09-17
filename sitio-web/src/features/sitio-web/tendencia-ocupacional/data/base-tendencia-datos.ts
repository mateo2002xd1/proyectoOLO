import type { RegistroTendenciaOcupacional, TipoTendenciaOcupacional } from '../types';

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

/**
 * Definiciones de los niveles ocupacionales extraídas de:
 * api-backend/uploads/cargas-datos/base-tendencia-1.xlsx
 */
export const DEFINICIONES_NIVELES_OCUPACIONALES = [
  {
    codigo: '0 Dirección y gerencia',
    titulo: '0 Dirección y gerencia',
    descripcion:
      'Ocupaciones orientadas a la planeación, dirección, control y toma de decisiones estratégicas en organizaciones públicas y privadas.',
  },
  {
    codigo: 'Nivel 1 (A)',
    titulo: 'Nivel 1 (A)',
    descripcion:
      'Las funciones de estas ocupaciones suelen ser muy variadas y complejas, su desempeño exige un alto grado de autonomía, responsabilidad por el trabajo de otros y ocasionalmente por la asignación de recursos.',
  },
  {
    codigo: 'Nivel 2 (B)',
    titulo: 'Nivel 2 (B)',
    descripcion:
      'Las funciones de las ocupaciones de este nivel son por lo general muy variadas, demandan responsabilidad de supervisión, un apreciable grado de autonomía y juicio evaluativo.',
  },
  {
    codigo: 'Nivel 3,4 (C)',
    titulo: 'Nivel 3,4 (C)',
    descripcion:
      'Las funciones de estas ocupaciones combinan actividades físicas e intelectuales, en algunos casos variadas y complejas, con algún nivel de autonomía para su desempeño.',
  },
  {
    codigo: 'Nivel 6 (D)',
    titulo: 'Nivel 6 (D)',
    descripcion:
      'Las funciones de estas ocupaciones son sencillas y repetitivas y se desempeñan en actividades fundamentalmente de carácter físico, con alto nivel de subordinación.',
  },
];

/**
 * Datos quemados tomados directamente de:
 * api-backend/uploads/cargas-datos/base-tendencia-1.xlsx
 */
export const DATOS_TENDENCIA_BASE: RegistroTendenciaOcupacional[] = [
  {
    id: 'ten-1',
    departamento: 'Antioquia',
    nivelOcupacional:
      'Nivel 6 (D): Las funciones de estas ocupaciones son sencillas y repetitivas y se desempeñan en actividades fundamentalmente de carácter físico, con alto nivel de subordinación.',
    nivelCodigo: 'Nivel 6 (D)',
    codigoCno: '6632',
    nombreOcupacion: 'Aseadores Especializados y Fumigadores',
    totalInscritos: 3712,
    totalVacantes: 11626,
    anio: 2026,
    periodo: 'Primer trimestre',
  },
  {
    id: 'ten-2',
    departamento: 'Antioquia',
    nivelOcupacional:
      'Nivel 3,4 (C): Las funciones de estas ocupaciones combinan actividades físicas e intelectuales, en algunos casos variadas y complejas, con algún nivel de autonomía para su desempeño.',
    nivelCodigo: 'Nivel 3,4 (C)',
    codigoCno: '8471',
    nombreOcupacion: 'Conductores de Vehículos Pesados',
    totalInscritos: 568,
    totalVacantes: 4592,
    anio: 2026,
    periodo: 'Tercer trimestre',
  },
  {
    id: 'ten-3',
    departamento: 'Antioquia',
    nivelOcupacional:
      'Nivel 3,4 (C): Las funciones de estas ocupaciones combinan actividades físicas e intelectuales, en algunos casos variadas y complejas, con algún nivel de autonomía para su desempeño.',
    nivelCodigo: 'Nivel 3,4 (C)',
    codigoCno: '7312',
    nombreOcupacion: 'Operarios de Apoyo y Servicios en Perforación de Petróleo y Gas',
    totalInscritos: 344,
    totalVacantes: 3902,
    anio: 2026,
    periodo: 'Primer trimestre',
  },
  {
    id: 'ten-4',
    departamento: 'Antioquia',
    nivelOcupacional:
      'Nivel 3,4 (C): Las funciones de estas ocupaciones combinan actividades físicas e intelectuales, en algunos casos variadas y complejas, con algún nivel de autonomía para su desempeño.',
    nivelCodigo: 'Nivel 3,4 (C)',
    codigoCno: '8411',
    nombreOcupacion: 'Instaladores Residenciales y Comerciales',
    totalInscritos: 447,
    totalVacantes: 2944,
    anio: 2026,
    periodo: 'Segundo trimestre',
  },
  {
    id: 'ten-5',
    departamento: 'Antioquia',
    nivelOcupacional:
      'Nivel 3,4 (C): Las funciones de estas ocupaciones combinan actividades físicas e intelectuales, en algunos casos variadas y complejas, con algún nivel de autonomía para su desempeño.',
    nivelCodigo: 'Nivel 3,4 (C)',
    codigoCno: '8371',
    nombreOcupacion: 'Mecánicos Industriales',
    totalInscritos: 499,
    totalVacantes: 2912,
    anio: 2026,
    periodo: 'Segundo trimestre',
  },
  {
    id: 'ten-6',
    departamento: 'Atlántico',
    nivelOcupacional:
      'Nivel 1 (A): Las funciones de estas ocupaciones suelen ser muy variadas y complejas, su desempeño exige un alto grado de autonomía, responsabilidad por el trabajo de otros y ocasionalmente por la asignación de recursos.',
    nivelCodigo: 'Nivel 1 (A)',
    codigoCno: '4121',
    nombreOcupacion: 'Profesores de Educación Superior',
    totalInscritos: 541,
    totalVacantes: 2896,
    anio: 2025,
    periodo: 'Primer trimestre',
  },
  {
    id: 'ten-7',
    departamento: 'Atlántico',
    nivelOcupacional:
      'Nivel 2 (B): Las funciones de las ocupaciones de este nivel son por lo general muy variadas, demandan responsabilidad de supervisión, un apreciable grado de autonomía y juicio evaluativo.',
    nivelCodigo: 'Nivel 2 (B)',
    codigoCno: '6232',
    nombreOcupacion: 'Agentes de Bienes Raíces',
    totalInscritos: 66,
    totalVacantes: 2193,
    anio: 2025,
    periodo: 'Tercer trimestre',
  },
  {
    id: 'ten-8',
    departamento: 'Atlántico',
    nivelOcupacional:
      'Nivel 2 (B): Las funciones de las ocupaciones de este nivel son por lo general muy variadas, demandan responsabilidad de supervisión, un apreciable grado de autonomía y juicio evaluativo.',
    nivelCodigo: 'Nivel 2 (B)',
    codigoCno: '8218',
    nombreOcupacion: 'Contratistas y Supervisores de Construcción y Otras Ocupaciones de Instalación y Reparación',
    totalInscritos: 461,
    totalVacantes: 2082,
    anio: 2025,
    periodo: 'Primer semestre',
  },
  {
    id: 'ten-9',
    departamento: 'Bolívar',
    nivelOcupacional:
      'Nivel 2 (B): Las funciones de las ocupaciones de este nivel son por lo general muy variadas, demandan responsabilidad de supervisión, un apreciable grado de autonomía y juicio evaluativo.',
    nivelCodigo: 'Nivel 2 (B)',
    codigoCno: '2262',
    nombreOcupacion: 'Inspectores de Sanidad, Seguridad y Salud Ocupacional',
    totalInscritos: 556,
    totalVacantes: 1950,
    anio: 2025,
    periodo: 'Cuarto trimestre',
  },
  {
    id: 'ten-10',
    departamento: 'Casanare',
    nivelOcupacional:
      'Nivel 1 (A): Las funciones de estas ocupaciones suelen ser muy variadas y complejas, su desempeño exige un alto grado de autonomía, responsabilidad por el trabajo de otros y ocasionalmente por la asignación de recursos.',
    nivelCodigo: 'Nivel 1 (A)',
    codigoCno: '3151',
    nombreOcupacion: 'Enfermeros',
    totalInscritos: 720,
    totalVacantes: 1826,
    anio: 2025,
    periodo: 'Cuarto trimestre',
  },
  {
    id: 'ten-11',
    departamento: 'Atlántico',
    nivelOcupacional: '0 Dirección y gerencia',
    nivelCodigo: '0 Dirección y gerencia',
    codigoCno: '0112',
    nombreOcupacion: 'Gerentes de Recursos Humanos',
    totalInscritos: 109,
    totalVacantes: 417,
    anio: 2024,
    periodo: 'Anual',
  },
  {
    id: 'ten-12',
    departamento: 'Atlántico',
    nivelOcupacional: '0 Dirección y gerencia',
    nivelCodigo: '0 Dirección y gerencia',
    codigoCno: '0213',
    nombreOcupacion: 'Gerentes de Sistemas de Información y Procesamiento de Datos',
    totalInscritos: 74,
    totalVacantes: 335,
    anio: 2023,
    periodo: 'Segundo semestre',
  },
  {
    id: 'ten-13',
    departamento: 'Atlántico',
    nivelOcupacional: '0 Dirección y gerencia',
    nivelCodigo: '0 Dirección y gerencia',
    codigoCno: '0811',
    nombreOcupacion: 'Gerentes de Construcción',
    totalInscritos: 78,
    totalVacantes: 234,
    anio: 2022,
    periodo: 'Primer semestre',
  },
];

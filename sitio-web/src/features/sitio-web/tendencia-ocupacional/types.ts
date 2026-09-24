/** Una ocupación en el resultado del buscador (un criterio, un corte, un ámbito). */
export interface RegistroTendenciaOcupacional {
  codigo: string;
  nombre: string;
  nivelCodigo: string;
  /** Mismo texto que la opción del filtro "Nivel Ocupacional": "Nivel 3,4 (C)". */
  nivelEtiqueta: string;
  inscritos: number;
  vacantes: number;
  percentilInscritos: number | null;
  percentilVacantes: number | null;
  criterio: CodigoCriterio;
}

/** `criterios_ocupacionales.codigo`: lo que filtra el buscador (el id es un UUID interno). */
export type CodigoCriterio =
  | 'ALTA_OFERTA_ALTA_DEMANDA'
  | 'ALTA_OFERTA_BAJA_DEMANDA'
  | 'BAJA_OFERTA_ALTA_DEMANDA'
  | 'BAJA_OFERTA_BAJA_DEMANDA';

/** Respuesta de `GET /api/observatorio/tendencia-ocupacional`. */
export interface ResultadoTendenciaOcupacional {
  registros: RegistroTendenciaOcupacional[];
  total: number;
  pagina: number;
  porPagina: number;
  totalPaginas: number;
  /** Suma de todas las filas que cumplen los filtros, no solo de la página. */
  totales: { inscritos: number; vacantes: number };
  /** Códigos DANE con resultados para los filtros (sin el de departamento): colorean el mapa. */
  departamentosConResultados: string[];
}

export interface PeriodoTendencia {
  codigo: string;
  nombre: string;
  /** Si hay un corte publicado para el año de las opciones. */
  disponible: boolean;
}

export interface NivelOcupacional {
  codigo: string;
  etiqueta: string;
  nombre: string;
  descripcion: string | null;
}

/** Respuesta de `GET /api/observatorio/tendencia-ocupacional/opciones`. */
export interface OpcionesTendenciaOcupacional {
  /** Solo años con datos publicados, del más reciente al más antiguo. */
  anios: number[];
  /** Año al que corresponde `disponible` de los periodos. */
  anio: number | null;
  periodos: PeriodoTendencia[];
  niveles: NivelOcupacional[];
  /** "Nacional" primero (valor `nacional`); luego los 33 con su código DANE como valor. */
  departamentos: { valor: string; nombre: string }[];
  criterios: { codigo: CodigoCriterio; nombre: string }[];
}

export interface DefinicionNivel {
  codigo: string;
  titulo: string;
  descripcion: string;
}

export interface FiltrosTendencia {
  /** `nacional` o el código DANE del departamento. */
  departamento: string;
  anio: string;
  /** Código del periodo: T1..T4, S1, S2 o ANUAL. */
  periodo: string;
  /** Código del nivel; vacío = todos. */
  nivelOcupacional: string;
  /** Las ocupaciones con 0 inscritos y 0 vacantes se ocultan salvo que se pida. */
  incluirSinRegistros: boolean;
}

/**
 * Cuadrante del bloque en Puck. El valor va guardado dentro del JSON publicado de cada
 * página, así que no se renombra: se traduce a `criterio` con `CRITERIO_POR_TIPO`.
 */
export type TipoTendenciaOcupacional =
  | 'mas-menos'
  | 'mas-mas'
  | 'menos-menos'
  | 'menos-mas';

export interface TendenciaOcupacionalViewProps {
  tipoTendencia?: TipoTendenciaOcupacional;
  mostrarDefiniciones?: boolean;
  mostrarTotales?: boolean;
  mostrarBannerDepartamento?: boolean;
  modoSeleccionDepartamento?: 'lista' | 'mapa';
  tituloBanner?: string;
  subtituloBanner?: string;
  descripcionBanner?: string;
  colorBanner?: string;
  mostrarTitulo?: boolean;
  titulo?: string;
  alineacionTitulo?: 'izquierda' | 'centro' | 'derecha';
  colorTitulo?: string;
  mostrarSubtitulo?: boolean;
  subtitulo?: string;
  alineacionSubtitulo?: 'izquierda' | 'centro' | 'derecha';
  colorSubtitulo?: string;
  mostrarDescripcion?: boolean;
  descripcion?: string;
  alineacionDescripcion?: 'izquierda' | 'centro' | 'derecha';
  colorDescripcion?: string;
  ocultarEncabezado?: boolean;
}

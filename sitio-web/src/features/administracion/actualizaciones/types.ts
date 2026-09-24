/** Contratos de la sección "Actualizaciones" (antes "Soporte", sin uso real). */

export type EstadoCargaDatos = 'procesando' | 'completado' | 'error';

/** Una carga de Excel registrada en `cargas_datos`. */
export interface CargaDatos {
  id: string;
  modulo: string;
  archivoId: string | null;
  estado: EstadoCargaDatos;
  /** 0-100. 0-60 es leer el Excel, 60-100 es escribirlo en la base. */
  progreso: number;
  filasProcesadas: number;
  filasTotales: number | null;
  mensaje: string | null;
  subidoPor: string | null;
  creadoEn: string;
  completadoEn: string | null;
}

// ---------------------------------------------------------------------------
// Criterios de clasificación de resultados (tendencia ocupacional / percentiles)
// ---------------------------------------------------------------------------

export type EstadoCeldaTendencia = 'pendiente' | 'procesando' | 'borrador' | 'publicado' | 'fallido';
export type EstadoCorteTendencia = 'borrador' | 'publicado';

/** Una celda año × periodo de `GET /api/observatorio/tendencia-ocupacional/estado`. */
export interface CeldaTendencia {
  anio: number;
  periodoCodigo: string;
  periodoNombre: string;
  estadoCelda: EstadoCeldaTendencia;
  corteId: string | null;
  publicadoEn: string | null;
  cargaId: string | null;
  /** Estado del último intento: si falló un reemplazo, la celda conserva sus datos. */
  cargaEstado: EstadoCargaDatos | null;
  archivoNombre: string | null;
  finalizadoEn: string | null;
  validacionesConAdvertencia: number;
}

/** Resultado de una validación (V1–V9, LECTURA, CONFLICTO; V10 en cargas viejas) en el reporte de una carga. */
export interface HallazgoCarga {
  codigo: string;
  descripcion: string;
  total: number;
  muestra: Record<string, unknown>[];
}

export interface ReporteCargaTendencia {
  errores: HallazgoCarga[];
  advertencias: HallazgoCarga[];
}

/** Una carga de percentiles en el historial: qué archivo, en qué celda, quién y cómo terminó. */
export interface CargaTendencia {
  id: string;
  estado: EstadoCargaDatos;
  progreso: number;
  filasProcesadas: number;
  filasTotales: number | null;
  mensaje: string | null;
  creadoEn: string;
  completadoEn: string | null;
  archivoNombre: string | null;
  subidoPorNombre: string | null;
  anio: number;
  periodoCodigo: string;
  periodoNombre: string;
  reemplazar: boolean;
  corteId: string | null;
  /** Estado de hoy del corte que dejó esta carga. */
  corteEstado: EstadoCorteTendencia | null;
  cortePublicadoEn: string | null;
  /** Es la carga cuyos datos tiene hoy el corte; las anteriores de la celda quedaron reemplazadas. */
  vigente: boolean;
  filasNacional: number | null;
  filasDepartamental: number | null;
  reporte: ReporteCargaTendencia;
}

export interface HistorialTendencia {
  cargas: CargaTendencia[];
  total: number;
  pagina: number;
  porPagina: number;
  totalPaginas: number;
}

/** Respuesta de `DELETE /api/observatorio/tendencia-ocupacional/cargas/:id`. */
export interface CargaTendenciaEliminada {
  /** Año y periodo que perdieron sus datos (la carga era la vigente); `null` si no cambiaron. */
  datosEliminados: { anio: number; periodo: string; estabaPublicado: boolean } | null;
  /** `false` si el Excel se conservó porque otra carga usa el mismo archivo. */
  archivoEliminado: boolean;
}

export interface FiltroHistorialTendencia {
  /** Vacío = todos. */
  anio: string;
  /** Código del periodo; vacío = todos. */
  periodo: string;
}

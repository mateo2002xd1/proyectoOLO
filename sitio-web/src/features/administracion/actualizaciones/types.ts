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

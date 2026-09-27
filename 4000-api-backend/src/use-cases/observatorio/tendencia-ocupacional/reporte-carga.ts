import type { Hallazgo } from '../../../repositories/tendencia-ocupacional.repository';

/**
 * Qué verifica cada validación. Los códigos V1–V9 son los de la carga en
 * `TendenciaOcupacionalRepository.carga`; `LECTURA` agrupa
 * los errores por fila que se detectan al leer el Excel, antes de tocar la base, y
 * `CONFLICTO` es una celda que ya tenía datos cuando la carga iba a guardar.
 *
 * V10 (el mismo contenido ya cargado en otra celda) se retiró: los datos pueden repetirse
 * entre periodos. Las cargas viejas que lo reportaron lo siguen mostrando, porque cada
 * hallazgo guarda su descripción en el reporte.
 */
export const VALIDACIONES = {
  LECTURA: 'Errores de lectura del archivo',
  V1: 'Departamento no reconocido',
  V2: 'El N.C. no coincide con el código de la ocupación o no existe en el catálogo',
  V3: 'Un mismo código de ocupación con más de un nombre en el archivo',
  V4: 'Filas repetidas (misma hoja, departamento y código)',
  V5: 'El nacional no es la suma de los departamentos, o las hojas no traen las mismas ocupaciones',
  V6: 'Percentiles distintos a los recalculados con la metodología (se guarda el del Excel)',
  V7: 'La «X» del Excel no coincide con la fórmula del 80 % (manda la fórmula)',
  V8: 'Ocupaciones con un nombre distinto al del catálogo',
  V9: 'Departamentos que no traen todas las ocupaciones',
  CONFLICTO: 'El año y periodo ya tiene datos',
} as const;

/**
 * Una celda con datos no admite otra carga: para cambiar el archivo se elimina primero la
 * carga vigente desde el historial. Lo dicen igual la subida (409) y el worker (CONFLICTO).
 */
export const mensajeCeldaOcupada = (anio: number, periodoNombre: string, estado: 'borrador' | 'publicado') =>
  `${anio} · ${periodoNombre} ya tiene datos ${estado === 'publicado' ? 'publicados' : 'en borrador'}. ` +
  'Para subir otro archivo, elimine primero su carga desde el historial.';

export type CodigoValidacion = keyof typeof VALIDACIONES;

export interface HallazgoReporte extends Hallazgo {
  codigo: CodigoValidacion;
  descripcion: string;
}

/** Lo que se guarda en `cargas_datos_ocupacionales.reporte`. */
export interface ReporteCarga {
  errores: HallazgoReporte[];
  advertencias: HallazgoReporte[];
}

/** Arma un hallazgo del reporte de carga con la descripción fija de su código de validación. */
export const hallazgoReporte = (codigo: CodigoValidacion, hallazgo: Hallazgo): HallazgoReporte => ({
  codigo,
  descripcion: VALIDACIONES[codigo],
  ...hallazgo,
});

/** Los que tienen al menos una fila, en el orden de las validaciones. */
export const conHallazgos = (resultados: Partial<Record<CodigoValidacion, Hallazgo>>): HallazgoReporte[] =>
  (Object.entries(resultados) as [CodigoValidacion, Hallazgo][])
    .filter(([, hallazgo]) => hallazgo.total > 0)
    .map(([codigo, hallazgo]) => hallazgoReporte(codigo, hallazgo));

/**
 * La carga no pasó una validación bloqueante. Lleva el reporte completo, que el worker
 * guarda en la bitácora para que el administrador vea qué filas corregir.
 */
export class ErrorDeCargaTendencia extends Error {
  constructor(public reporte: ReporteCarga) {
    super(resumirErrores(reporte.errores));
  }
}

/** Una línea para `cargas_datos.mensaje`; el detalle fila por fila queda en el reporte. */
function resumirErrores(errores: HallazgoReporte[]): string {
  const [primero] = errores;
  if (!primero) return 'La carga falló.';

  // Un solo error con mensaje propio (lectura, celda ocupada) se muestra tal cual.
  const detalle = primero.muestra[0]?.mensaje;
  if (errores.length === 1 && typeof detalle === 'string') {
    return primero.total > 1 ? `${detalle} (y ${primero.total - 1} más)` : detalle;
  }

  // Sin «No se cargó:» ni «el detalle está en el reporte»: en el panel ya lo dicen el flag
  // «Con errores» y el enlace «Ver reporte» junto a este texto.
  return `${errores.map((e) => `${e.codigo} · ${e.descripcion} (${e.total})`).join('; ')}.`;
}

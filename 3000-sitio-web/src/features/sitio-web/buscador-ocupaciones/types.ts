/**
 * Contratos del buscador de ocupaciones (RF-09).
 *
 * El catálogo lo sirve la API pública de consulta CNO/CUOC
 * (`API_PUBLICA_CONSULTA.md`), pero la UI no consume su respuesta tal cual: la
 * traducción se hace una sola vez, en `lib/consulta-cno.ts`, para que las vistas
 * no dependan de cómo nombre esa API sus campos. Si la API cambia, cambia ese
 * archivo y no cambia nada de aquí hacia arriba.
 */

/** Clasificación a la que pertenece una ocupación: 4 dígitos es CNO, 5 es CUOC. */
export type TipoClasificacion = 'CNO' | 'CUOC';

/** Una ocupación citada desde otra: relacionada o correlativa. */
export interface OcupacionRelacionada {
  codigo: string;
  nombre: string;
}

/** Fila de la tabla de resultados (vista 1): ocupación a la izquierda, denominaciones a la derecha. */
export interface ResultadoOcupacion {
  tipo: TipoClasificacion;
  /** Texto, no número: puede llevar ceros a la izquierda (`0211`). */
  codigoOcupacion: string;
  nombreOcupacion: string;
  /** Nombres de todas las denominaciones de la ocupación. */
  denominaciones: string[];
  /**
   * Subconjunto de `denominaciones` que coincide con el término buscado.
   *
   * Se envía aparte y no resuelto en el cliente porque la coincidencia se
   * calcula sobre el texto normalizado (sin tildes ni mayúsculas) y ese
   * normalizado vive en el servidor: repetirlo en la vista duplicaría la regla.
   */
  denominacionesCoincidentes: string[];
}

/** Detalle completo de una ocupación (vista 2). */
export interface DetalleOcupacion {
  tipo: TipoClasificacion;
  codigoOcupacion: string;
  nombreOcupacion: string;
  /** Vacío cuando la API la entrega como `null`. */
  descripcion: string;

  // Ubicación en la estructura
  /** Vacío cuando la API la entrega como `null`. */
  areaDesempeno: string;
  /** Vacío cuando la API la entrega como `null`. */
  nivelCualificacion: string;
  /** La API no lo entrega: se deja vacío a propósito. */
  areaOcupacional: string[];
  /** La API no lo entrega: se deja vacío a propósito. */
  campoOcupacional: string[];

  // Ampliar información de la ocupación
  funciones: string[];
  /** La API lo entrega siempre vacío por ahora. */
  normasAsociadas: string[];
  denominaciones: string[];
  ocupacionesRelacionadas: OcupacionRelacionada[];
  habilidades: string[];
  conocimientos: string[];
  /** Equivalentes en la clasificación contraria: si la ficha es CNO, vienen CUOC, y al revés. */
  correlativa: {
    tipo: TipoClasificacion;
    ocupaciones: OcupacionRelacionada[];
  };
}

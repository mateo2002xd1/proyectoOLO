/**
 * Contratos del buscador de ocupaciones (RF-09).
 *
 * Los nombres viajan en `camelCase` aunque las tablas de origen usen los
 * identificadores del archivo maestro de la CNO (`cod_ocupacion_cno`,
 * `descr_denominacion_cno`, …): la traducción se hace una sola vez, en
 * `lib/catalogo-cno-temporal.ts`, para que la UI no dependa de cómo esté
 * escrita la columna en el Excel de origen. Cuando el catálogo pase a la base
 * de datos real, cambia el origen y no cambia nada de aquí hacia arriba.
 */

/** Una ocupación relacionada: `cod_ocup_relacionada_cno` + `nombre_ocup_relacionada_cno`. */
export interface OcupacionRelacionada {
  codigo: string;
  nombre: string;
}

/** Fila de la tabla de resultados (vista 1): ocupación a la izquierda, denominaciones a la derecha. */
export interface ResultadoOcupacion {
  /** `ocupaciones.cod_ocupacion_cno` */
  codigoOcupacion: string;
  /** `ocupaciones.nomb_ocupacion_cno` */
  nombreOcupacion: string;
  /** `denominaciones.descr_denominacion_cno` de todas las asociadas al código de la ocupación. */
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
  /** `ocupaciones.cod_ocupacion_cno` */
  codigoOcupacion: string;
  /** `ocupaciones.nomb_ocupacion_cno` */
  nombreOcupacion: string;
  /** `ocupaciones.desc_ocupacion_cno` */
  descripcion: string;

  // Ubicación en la estructura
  /** `area_desempeno.nom_desempeno_cno`, unida por `ocupaciones.cod_desempe_cno`. */
  areaDesempeno: string;
  /** `nivel_cualificacion.descrip_nivel_cualificacion_cno`, unida por `ocupaciones.cod_cualificacion_cno`. */
  nivelCualificacion: string;
  /** Sin tabla de origen en el archivo maestro: se entrega vacío a propósito. */
  areaOcupacional: string[];
  /** Sin tabla de origen en el archivo maestro: se entrega vacío a propósito. */
  campoOcupacional: string[];

  // Ampliar información de la ocupación
  /** `funciones_cno.desc_funcion_cno` */
  funciones: string[];
  /** Sin tabla de origen en el archivo maestro: se entrega vacío a propósito. */
  normasAsociadas: string[];
  /** `denominaciones.descr_denominacion_cno` */
  denominaciones: string[];
  /** `relacionada_cno`: código + nombre de la ocupación relacionada. */
  ocupacionesRelacionadas: OcupacionRelacionada[];
  /** `habilidades_cno.nombre_habilidad_cno` */
  habilidades: string[];
  /** `conocimientos_cno.nom_conocimiento_cno` */
  conocimientos: string[];
  /** Sin tabla de origen en el archivo maestro: se entrega vacío a propósito. */
  correlativaCuoc: string[];
}

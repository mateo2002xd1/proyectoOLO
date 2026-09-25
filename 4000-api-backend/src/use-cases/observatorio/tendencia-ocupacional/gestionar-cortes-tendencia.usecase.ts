import { TendenciaOcupacionalRepository as Repo } from '../../../repositories/tendencia-ocupacional.repository';

/**
 * Lo que usa el panel de "Actualizaciones" para la tendencia ocupacional: la matriz de
 * estado, el historial de cargas y la publicación. Solo con sesión y permiso.
 */

/** Matriz año × periodo (de 2012, o el primer año cargado, al actual o el último cargado), con el estado de cada celda. */
export async function consultarEstadoCargasTendencia() {
  const filas = await Repo.estadoMatriz();
  return filas.map((f) => ({
    anio: Number(f.anio),
    periodoCodigo: f.periodo_codigo as string,
    periodoNombre: f.periodo_nombre as string,
    estadoCelda: f.estado_celda as 'pendiente' | 'procesando' | 'borrador' | 'publicado' | 'fallido',
    corteId: f.corte_id as string | null,
    publicadoEn: f.publicado_en as Date | null,
    cargaId: f.carga_id as string | null,
    /** Estado del último intento: si falló un reemplazo, la celda conserva su estado pero se avisa. */
    cargaEstado: f.carga_estado as 'procesando' | 'completado' | 'error' | null,
    archivoNombre: f.archivo_nombre as string | null,
    finalizadoEn: f.finalizado_en as Date | null,
    validacionesConAdvertencia: Number(f.validaciones_con_advertencia),
  }));
}

const aCarga = (f: Record<string, unknown>) => ({
  id: f.id as string,
  estado: f.estado as 'procesando' | 'completado' | 'error',
  progreso: Number(f.progreso),
  filasProcesadas: Number(f.filas_procesadas),
  filasTotales: f.filas_totales === null ? null : Number(f.filas_totales),
  mensaje: f.mensaje as string | null,
  creadoEn: f.creado_en as Date,
  completadoEn: f.completado_en as Date | null,
  archivoNombre: f.archivo_nombre as string | null,
  /** `null` si la subió la cuenta maestra local o un usuario ya borrado. */
  subidoPorNombre: f.subido_por_nombre as string | null,
  anio: Number(f.anio),
  periodoCodigo: f.periodo_codigo as string,
  periodoNombre: f.periodo_nombre as string,
  reemplazar: Boolean(f.reemplazar),
  corteId: f.corte_id as string | null,
  /** Estado de hoy del corte que dejó esta carga (no el que tenía al cargarse). */
  corteEstado: f.corte_estado as 'borrador' | 'publicado' | null,
  cortePublicadoEn: f.corte_publicado_en as Date | null,
  /** La carga cuyos datos tiene hoy el corte; las anteriores de la celda quedaron reemplazadas. */
  vigente: Boolean(f.vigente),
  filasNacional: f.filas_nacional === null ? null : Number(f.filas_nacional),
  filasDepartamental: f.filas_departamental === null ? null : Number(f.filas_departamental),
  reporte: f.reporte,
});

/**
 * Historial de cargas, de la más reciente a la más antigua: la trazabilidad de cada año
 * y periodo. Una carga se quita con `eliminarCargaTendencia`.
 */
export async function listarCargasTendencia(filtro: {
  anio?: number;
  periodo?: string;
  pagina: number;
  porPagina: number;
}) {
  const { filas, total } = await Repo.listarCargas({
    anio: filtro.anio,
    periodo: filtro.periodo,
    limite: filtro.porPagina,
    desplazamiento: (filtro.pagina - 1) * filtro.porPagina,
  });
  return {
    cargas: filas.map(aCarga),
    total,
    pagina: filtro.pagina,
    porPagina: filtro.porPagina,
    totalPaginas: Math.max(1, Math.ceil(total / filtro.porPagina)),
  };
}

/** Una carga con su reporte de validaciones, o `null` si no existe o es de otro módulo. */
export async function obtenerCargaTendencia(cargaId: string) {
  const { filas } = await Repo.listarCargas({ cargaId, limite: 1, desplazamiento: 0 });
  return filas[0] ? aCarga(filas[0]) : null;
}

/**
 * Publica en bloque los cortes en borrador; los que ya estaban publicados o no existen
 * se ignoran. Devuelve los que cambiaron.
 */
export async function publicarCortesTendencia(corteIds: string[]) {
  const publicados = await Repo.publicarCortes(corteIds);
  return publicados.map((c) => ({ id: c.id, anio: Number(c.anio), periodoCodigo: c.periodo_codigo }));
}

/**
 * Devuelve un corte publicado a borrador: deja de verse en el sitio, sus datos se conservan.
 * @throws {Error} 409 si el corte no existe o no está publicado.
 */
export async function despublicarCorteTendencia(corteId: string): Promise<void> {
  const cambio = await Repo.despublicarCorte(corteId);
  if (!cambio) {
    throw Object.assign(new Error('El corte no existe o no está publicado.'), { status: 409 });
  }
}

import { QueryTypes, Transaction } from 'sequelize';
import sequelize from '../config/database';

/**
 * Única capa que toca SQL para la tendencia ocupacional (percentiles).
 *
 * El SQL es el de `criterios/002_carga_y_validaciones.sql` con los nombres de tabla del
 * proyecto (migración 033). Se escribe a mano y no con modelos Sequelize porque casi
 * todo son operaciones de conjunto —tabla temporal, validaciones agregadas, `INSERT …
 * SELECT`— que un ORM haría fila por fila.
 */

export type Hoja = 'NAC' | 'DEP';

/** Una fila del Excel lista para la tabla temporal `stg_ocupacional`. */
export interface FilaStaging {
  filaExcel: number;
  hoja: Hoja;
  departamentoTxt: string | null;
  /** `null` en NAC; en DEP, `null` significa "no se pudo resolver" y lo detecta V1. */
  departamentoId: string | null;
  codigo: string;
  nombre: string;
  codigoNcExcel: number;
  inscritos: number;
  vacantes: number;
  pctInscritos: number | null;
  pctVacantes: number | null;
  /** 1..4 según la columna "X" del Excel; `null` si no traía valor (solo para V7). */
  criterioExcel: number | null;
}

/** Resultado de una validación: cuántas filas la incumplen y unas cuantas de muestra. */
export interface Hallazgo {
  total: number;
  muestra: Record<string, unknown>[];
}

export interface CorteDeCelda {
  id: number;
  estado: 'borrador' | 'publicado';
}

export interface PeriodoCatalogo {
  id: number;
  codigo: string;
  nombre: string;
  orden: number;
}

export interface FiltrosBuscador {
  anio: number;
  periodo: string;
  /** `'nacional'` o el código DANE de dos dígitos. */
  departamento: string;
  criterioId?: number;
  nivel?: string;
  q?: string;
  incluirSinRegistros: boolean;
}

export interface FilaBuscador {
  ocupacion_codigo: string;
  ocupacion_nombre: string;
  nivel_codigo: string;
  nivel_etiqueta: string;
  inscritos: number;
  vacantes: number;
  percentil_inscritos: number | null;
  percentil_vacantes: number | null;
  criterio_id: number;
}

/** `cargas_datos.modulo` de este módulo (el de programas es `programa_sobresalientes`). */
export const MODULO_CARGA = 'tendencia_ocupacional';

/** Filas de muestra que se guardan por validación en el reporte. */
const MUESTRA = 20;

/** Filas por `INSERT` en la tabla temporal: 12 arreglos de este largo por consulta. */
const LOTE_STAGING = 5000;

/**
 * Llave del candado por celda (año × periodo), con `:anio` y `:periodoId` como texto. La
 * comparten la carga, que lo espera, y el borrado, que no espera: así nunca corren a la vez
 * sobre la misma celda.
 */
const CANDADO_CELDA = "hashtext('corte_ocupacional:' || :anio || ':' || :periodoId)";

/**
 * La carga puso los datos que el corte tiene hoy: es la completada más reciente de su
 * celda y el corte sigue en pie. Las anteriores de la celda quedaron reemplazadas. Usa los
 * alias `cd` (`cargas_datos`) y `co` (`cargas_datos_ocupacionales`).
 */
const ES_VIGENTE = `(cd.estado = 'completado' AND co.corte_id IS NOT NULL AND NOT EXISTS (
                   SELECT 1
                     FROM cargas_datos cd2
                     JOIN cargas_datos_ocupacionales co2 ON co2.carga_id = cd2.id
                    WHERE co2.anio = co.anio AND co2.periodo_id = co.periodo_id
                      AND cd2.estado = 'completado'
                      AND (cd2.completado_en > cd.completado_en
                           OR (cd2.completado_en = cd.completado_en AND cd2.id > cd.id))))`;

const seleccionar = <T extends object>(
  sql: string,
  replacements: Record<string, unknown> = {},
  transaction?: Transaction
) => sequelize.query<T>(sql, { replacements, type: QueryTypes.SELECT, transaction });

/**
 * Ejecuta una validación que devuelve las filas culpables y la reduce a total + muestra.
 * La consulta tiene que exponer `count(*) OVER () AS total` y no llevar `LIMIT`.
 */
async function hallazgo(
  transaction: Transaction,
  sql: string,
  replacements: Record<string, unknown> = {}
): Promise<Hallazgo> {
  const filas = await seleccionar<Record<string, unknown> & { total: string | number }>(
    `${sql}\nLIMIT ${MUESTRA}`,
    replacements,
    transaction
  );
  return {
    total: filas.length ? Number(filas[0].total) : 0,
    muestra: filas.map(({ total: _total, ...resto }) => resto),
  };
}

/** Escapa `%`, `_` y `\` para usar un texto del usuario dentro de un `ILIKE`. */
const escaparLike = (texto: string) => texto.replace(/[\\%_]/g, (c) => `\\${c}`);

/** Filtro del buscador. Se arma según lo que llegue para que el planificador use los índices. */
function construirFiltro(filtros: FiltrosBuscador, { conDepartamento }: { conDepartamento: boolean }) {
  const condiciones = ["corte_estado = 'publicado'", 'anio = :anio', 'periodo_codigo = :periodo'];
  const replacements: Record<string, unknown> = { anio: filtros.anio, periodo: filtros.periodo };

  if (!conDepartamento) {
    condiciones.push('NOT es_nacional');
  } else if (filtros.departamento === 'nacional') {
    condiciones.push('es_nacional');
  } else {
    condiciones.push('codigo_dane = :departamento');
    replacements.departamento = filtros.departamento;
  }

  if (filtros.criterioId !== undefined) {
    condiciones.push('criterio_id = :criterioId');
    replacements.criterioId = filtros.criterioId;
  }
  if (filtros.nivel) {
    condiciones.push('nivel_codigo = :nivel');
    replacements.nivel = filtros.nivel;
  }
  if (filtros.q) {
    condiciones.push('(ocupacion_nombre ILIKE :patron OR ocupacion_codigo = :q)');
    replacements.patron = `%${escaparLike(filtros.q)}%`;
    replacements.q = filtros.q;
  }
  if (!filtros.incluirSinRegistros) {
    condiciones.push('NOT sin_registros');
  }

  return { where: condiciones.join('\n   AND '), replacements };
}

export const TendenciaOcupacionalRepository = {
  // ---------------------------------------------------------------------------
  // Catálogos y opciones de los filtros
  // ---------------------------------------------------------------------------

  async obtenerPeriodo(codigo: string): Promise<PeriodoCatalogo | null> {
    const filas = await seleccionar<PeriodoCatalogo>(
      'SELECT id, codigo, nombre, orden FROM periodos WHERE codigo = :codigo',
      { codigo }
    );
    return filas[0] ?? null;
  },

  /** Solo años con al menos un corte publicado, del más reciente al más antiguo. */
  async aniosPublicados(): Promise<number[]> {
    const filas = await seleccionar<{ anio: number }>(
      "SELECT DISTINCT anio FROM cortes_ocupacionales WHERE estado = 'publicado' ORDER BY anio DESC"
    );
    return filas.map((f) => Number(f.anio));
  },

  /** Los siete periodos en su orden, marcando cuáles tienen corte publicado ese año. */
  periodosConDisponibilidad: (anio: number | null) =>
    seleccionar<{ codigo: string; nombre: string; disponible: boolean }>(
      `SELECT p.codigo, p.nombre,
              EXISTS (SELECT 1 FROM cortes_ocupacionales c
                       WHERE c.periodo_id = p.id AND c.anio = :anio AND c.estado = 'publicado') AS disponible
         FROM periodos p
        ORDER BY p.orden`,
      { anio }
    ),

  niveles: () =>
    seleccionar<{ codigo: string; etiqueta: string; nombre: string; descripcion: string | null }>(
      'SELECT codigo, etiqueta, nombre, descripcion FROM niveles_ocupacionales ORDER BY orden'
    ),

  criterios: () =>
    seleccionar<{ id: number; codigo: string; nombre: string }>(
      'SELECT id, codigo, nombre FROM criterios_ocupacionales ORDER BY orden'
    ),

  // ---------------------------------------------------------------------------
  // Buscador público (solo cortes publicados)
  // ---------------------------------------------------------------------------

  async buscar(filtros: FiltrosBuscador, limite: number, desplazamiento: number) {
    const { where, replacements } = construirFiltro(filtros, { conDepartamento: true });

    const [filas, [resumen]] = await Promise.all([
      seleccionar<FilaBuscador>(
        `SELECT ocupacion_codigo, ocupacion_nombre, nivel_codigo, nivel_etiqueta,
                inscritos, vacantes, percentil_inscritos, percentil_vacantes, criterio_id
           FROM v_buscador_ocupacional
          WHERE ${where}
          ORDER BY criterio_id, percentil_vacantes DESC NULLS LAST,
                   percentil_inscritos DESC NULLS LAST, ocupacion_codigo
          LIMIT :limite OFFSET :desplazamiento`,
        { ...replacements, limite, desplazamiento }
      ),
      seleccionar<{ total: string; inscritos: string | null; vacantes: string | null }>(
        `SELECT count(*) AS total, sum(inscritos) AS inscritos, sum(vacantes) AS vacantes
           FROM v_buscador_ocupacional
          WHERE ${where}`,
        replacements
      ),
    ]);

    return {
      filas,
      total: Number(resumen.total),
      totalInscritos: Number(resumen.inscritos ?? 0),
      totalVacantes: Number(resumen.vacantes ?? 0),
    };
  },

  /** Códigos DANE con al menos un resultado para los mismos filtros, sin el de departamento: colorea el mapa. */
  async departamentosConResultados(filtros: FiltrosBuscador): Promise<string[]> {
    const { where, replacements } = construirFiltro(filtros, { conDepartamento: false });
    const filas = await seleccionar<{ codigo_dane: string }>(
      `SELECT DISTINCT codigo_dane FROM v_buscador_ocupacional WHERE ${where} ORDER BY codigo_dane`,
      replacements
    );
    return filas.map((f) => f.codigo_dane);
  },

  // ---------------------------------------------------------------------------
  // Panel de Actualizaciones: estado, publicación e historial
  // ---------------------------------------------------------------------------

  estadoMatriz: () =>
    seleccionar<Record<string, unknown>>(
      `SELECT anio, periodo_codigo, periodo_nombre, corte_id, corte_estado, publicado_en,
              estado_celda, carga_id, carga_estado, archivo_nombre, finalizado_en,
              validaciones_con_advertencia
         FROM v_estado_cargas_ocupacional
        ORDER BY anio DESC, periodo_orden`
    ),

  async obtenerCorteDeCelda(anio: number, periodoId: number, transaction?: Transaction): Promise<CorteDeCelda | null> {
    const filas = await seleccionar<CorteDeCelda>(
      'SELECT id, estado FROM cortes_ocupacionales WHERE anio = :anio AND periodo_id = :periodoId',
      { anio, periodoId },
      transaction
    );
    return filas[0] ?? null;
  },

  /** ¿Hay una carga en curso para la celda? (en cola, leyendo o guardando). */
  async hayCargaEnCurso(anio: number, periodoId: number): Promise<boolean> {
    const filas = await seleccionar<{ id: string }>(
      `SELECT cd.id
         FROM cargas_datos cd
         JOIN cargas_datos_ocupacionales co ON co.carga_id = cd.id
        WHERE cd.modulo = :modulo AND cd.estado = 'procesando'
          AND co.anio = :anio AND co.periodo_id = :periodoId
        LIMIT 1`,
      { modulo: MODULO_CARGA, anio, periodoId }
    );
    return filas.length > 0;
  },

  /** Publica los que estén en borrador; los demás ids se ignoran (ya publicados o inexistentes). */
  publicarCortes: (corteIds: number[]) =>
    seleccionar<{ id: number; anio: number; periodo_codigo: string }>(
      `UPDATE cortes_ocupacionales c
          SET estado = 'publicado', publicado_en = now(), updated_at = now()
         FROM periodos p
        WHERE p.id = c.periodo_id
          AND c.id IN (:corteIds)
          AND c.estado = 'borrador'
       RETURNING c.id, c.anio, p.codigo AS periodo_codigo`,
      { corteIds }
    ),

  async despublicarCorte(corteId: number): Promise<boolean> {
    const filas = await seleccionar<{ id: number }>(
      `UPDATE cortes_ocupacionales
          SET estado = 'borrador', publicado_en = NULL, updated_at = now()
        WHERE id = :corteId AND estado = 'publicado'
       RETURNING id`,
      { corteId }
    );
    return filas.length > 0;
  },

  /**
   * Abre la carga en `cargas_datos` (lo común a "Actualizaciones") y su detalle en
   * `cargas_datos_ocupacionales`, juntos: una fila sin la otra sería una carga que el
   * worker no sabe procesar y que se quedaría en «procesando» para siempre.
   *
   * `cargas_datos_ocupacionales.reemplazar` queda en su `false` por defecto: una celda con
   * datos ya no admite otra carga (se elimina la anterior primero), y la columna solo
   * describe cargas viejas.
   */
  crearCarga: (datos: { archivoId: string; subidoPor: string | null; anio: number; periodoId: number }) =>
    sequelize.transaction(async (transaction) => {
      const [carga] = await seleccionar<{ id: string }>(
        `INSERT INTO cargas_datos (modulo, archivo_id, subido_por, estado)
         VALUES (:modulo, :archivoId, :subidoPor, 'procesando')
         RETURNING id`,
        { modulo: MODULO_CARGA, archivoId: datos.archivoId, subidoPor: datos.subidoPor },
        transaction
      );
      await sequelize.query(
        `INSERT INTO cargas_datos_ocupacionales (carga_id, anio, periodo_id)
         VALUES (:cargaId, :anio, :periodoId)`,
        {
          replacements: { cargaId: carga.id, anio: datos.anio, periodoId: datos.periodoId },
          transaction,
        }
      );
      return carga.id;
    }),

  async obtenerDetalleCarga(cargaId: string) {
    const filas = await seleccionar<{
      anio: number;
      periodo_id: number;
      periodo_codigo: string;
      periodo_nombre: string;
      periodo_orden: number;
    }>(
      `SELECT co.anio, co.periodo_id, p.codigo AS periodo_codigo, p.nombre AS periodo_nombre,
              p.orden AS periodo_orden
         FROM cargas_datos_ocupacionales co
         JOIN periodos p ON p.id = co.periodo_id
        WHERE co.carga_id = :cargaId`,
      { cargaId }
    );
    return filas[0] ?? null;
  },

  /**
   * Historial de cargas: la trazabilidad de cada año y periodo. Une lo común de
   * `cargas_datos` con lo propio del módulo, quién subió el archivo y cómo está hoy el
   * corte. Con `cargaId`, una sola.
   *
   * `vigente`: ver `ES_VIGENTE`.
   */
  async listarCargas(filtro: {
    anio?: number;
    periodo?: string;
    cargaId?: string;
    limite: number;
    desplazamiento: number;
  }) {
    const condiciones = [`cd.modulo = '${MODULO_CARGA}'`];
    const replacements: Record<string, unknown> = { limite: filtro.limite, desplazamiento: filtro.desplazamiento };
    if (filtro.cargaId) {
      condiciones.push('cd.id = :cargaId');
      replacements.cargaId = filtro.cargaId;
    }
    if (filtro.anio !== undefined) {
      condiciones.push('co.anio = :anio');
      replacements.anio = filtro.anio;
    }
    if (filtro.periodo) {
      condiciones.push('p.codigo = :periodo');
      replacements.periodo = filtro.periodo;
    }
    const where = condiciones.join(' AND ');
    const desde = `FROM cargas_datos cd
         JOIN cargas_datos_ocupacionales co ON co.carga_id = cd.id
         JOIN periodos p ON p.id = co.periodo_id`;

    const [filas, [conteo]] = await Promise.all([
      seleccionar<Record<string, unknown>>(
        `SELECT cd.id, cd.estado, cd.progreso, cd.filas_procesadas, cd.filas_totales, cd.mensaje,
                cd.creado_en, cd.completado_en, ar.nombre_original AS archivo_nombre,
                NULLIF(concat_ws(' ', u.nombre, u.apellidos), '') AS subido_por_nombre,
                co.anio, p.codigo AS periodo_codigo, p.nombre AS periodo_nombre, co.reemplazar,
                co.corte_id, c.estado AS corte_estado, c.publicado_en AS corte_publicado_en,
                co.filas_nacional, co.filas_departamental, co.reporte,
                ${ES_VIGENTE} AS vigente
           ${desde}
           LEFT JOIN archivos ar ON ar.id = cd.archivo_id
           LEFT JOIN usuarios u ON u.id = cd.subido_por
           LEFT JOIN cortes_ocupacionales c ON c.id = co.corte_id
          WHERE ${where}
          ORDER BY cd.creado_en DESC, cd.id DESC
          LIMIT :limite OFFSET :desplazamiento`,
        replacements
      ),
      seleccionar<{ total: string }>(`SELECT count(*) AS total ${desde} WHERE ${where}`, replacements),
    ]);

    return { filas, total: Number(conteo.total) };
  },

  /** Cierre de una carga que falló. Fuera de la transacción: tiene que sobrevivir al rollback. */
  cerrarCargaFallida: (cargaId: string, mensaje: string, reporte: object) =>
    sequelize.transaction(async (transaction) => {
      await sequelize.query(
        `UPDATE cargas_datos SET estado = 'error', mensaje = :mensaje, completado_en = now() WHERE id = :cargaId`,
        { replacements: { cargaId, mensaje }, transaction }
      );
      await sequelize.query(
        'UPDATE cargas_datos_ocupacionales SET reporte = CAST(:reporte AS jsonb) WHERE carga_id = :cargaId',
        { replacements: { cargaId, reporte: JSON.stringify(reporte) }, transaction }
      );
    }),

  // ---------------------------------------------------------------------------
  // Eliminar una carga del historial (ver eliminar-carga-tendencia.usecase)
  // ---------------------------------------------------------------------------

  eliminacion: {
    /** La carga con su celda y si es la vigente; `null` si no existe o es de otro módulo. */
    async detalle(transaction: Transaction, cargaId: string) {
      const filas = await seleccionar<{
        anio: number;
        periodo_id: number;
        periodo_nombre: string;
        archivo_id: string | null;
        corte_id: number | null;
        corte_estado: 'borrador' | 'publicado' | null;
        vigente: boolean;
      }>(
        `SELECT co.anio, co.periodo_id, p.nombre AS periodo_nombre, cd.archivo_id,
                co.corte_id, c.estado AS corte_estado, ${ES_VIGENTE} AS vigente
           FROM cargas_datos cd
           JOIN cargas_datos_ocupacionales co ON co.carga_id = cd.id
           JOIN periodos p ON p.id = co.periodo_id
           LEFT JOIN cortes_ocupacionales c ON c.id = co.corte_id
          WHERE cd.id = :cargaId AND cd.modulo = :modulo`,
        { cargaId, modulo: MODULO_CARGA },
        transaction
      );
      return filas[0] ?? null;
    },

    /** El candado de la celda, sin esperar: `false` si una carga está guardando en ella. */
    async intentarBloquearCelda(transaction: Transaction, anio: number, periodoId: number): Promise<boolean> {
      const [fila] = await seleccionar<{ bloqueada: boolean }>(
        `SELECT pg_try_advisory_xact_lock(${CANDADO_CELDA}) AS bloqueada`,
        { anio: String(anio), periodoId: String(periodoId) },
        transaction
      );
      return fila.bloqueada;
    },

    /** El corte y sus indicadores (CASCADE); las cargas de la celda quedan con `corte_id` NULL. */
    eliminarCorte: (transaction: Transaction, corteId: number) =>
      sequelize.query('DELETE FROM cortes_ocupacionales WHERE id = :corteId', {
        replacements: { corteId },
        transaction,
      }),

    /** La carga; su fila de `cargas_datos_ocupacionales` se va en CASCADE. */
    eliminarCarga: (transaction: Transaction, cargaId: string) =>
      sequelize.query('DELETE FROM cargas_datos WHERE id = :cargaId', {
        replacements: { cargaId },
        transaction,
      }),
  },

  // ---------------------------------------------------------------------------
  // Carga (todo dentro de UNA transacción; ver importar-percentiles-excel.usecase)
  // ---------------------------------------------------------------------------

  carga: {
    /** Paso 0: dos cargas del mismo corte no corren a la vez. */
    bloquearCelda: (transaction: Transaction, anio: number, periodoId: number) =>
      sequelize.query(`SELECT pg_advisory_xact_lock(${CANDADO_CELDA})`, {
        replacements: { anio: String(anio), periodoId: String(periodoId) },
        transaction,
      }),

    /**
     * El Excel se lee antes de tomar el candado, y en ese rato la carga se puede eliminar
     * del historial. Con el candado ya tomado, el borrado no puede estar a medias.
     */
    async sigueExistiendo(transaction: Transaction, cargaId: string): Promise<boolean> {
      const filas = await seleccionar<{ id: string }>(
        'SELECT id FROM cargas_datos WHERE id = :cargaId',
        { cargaId },
        transaction
      );
      return filas.length > 0;
    },

    /** Paso 1: tabla temporal; vive solo durante la transacción. */
    crearStaging: (transaction: Transaction) =>
      sequelize.query(
        `CREATE TEMP TABLE stg_ocupacional (
           fila_excel        INTEGER  NOT NULL,
           hoja              CHAR(3)  NOT NULL CHECK (hoja IN ('NAC','DEP')),
           departamento_txt  TEXT,
           departamento_id   UUID,
           codigo            CHAR(4)  NOT NULL,
           nombre            TEXT     NOT NULL,
           codigo_nc_excel   SMALLINT NOT NULL,
           inscritos         INTEGER  NOT NULL,
           vacantes          INTEGER  NOT NULL,
           pct_inscritos     DOUBLE PRECISION,
           pct_vacantes      DOUBLE PRECISION,
           criterio_excel    SMALLINT
         ) ON COMMIT DROP`,
        { transaction }
      ),

    /**
     * Inserta por lotes con `unnest` sobre doce arreglos: una consulta por lote en vez
     * de una por fila, que con la base en la nube es la diferencia entre segundos y minutos.
     */
    async insertarStaging(
      transaction: Transaction,
      filas: FilaStaging[],
      onLote?: (insertadas: number) => void
    ): Promise<void> {
      for (let inicio = 0; inicio < filas.length; inicio += LOTE_STAGING) {
        const lote = filas.slice(inicio, inicio + LOTE_STAGING);
        await sequelize.query(
          `INSERT INTO stg_ocupacional
                 (fila_excel, hoja, departamento_txt, departamento_id, codigo, nombre, codigo_nc_excel,
                  inscritos, vacantes, pct_inscritos, pct_vacantes, criterio_excel)
           SELECT * FROM unnest($1::int[], $2::text[], $3::text[], $4::uuid[], $5::text[], $6::text[],
                                $7::smallint[], $8::int[], $9::int[], $10::float8[], $11::float8[],
                                $12::smallint[])`,
          {
            bind: [
              lote.map((f) => f.filaExcel),
              lote.map((f) => f.hoja),
              lote.map((f) => f.departamentoTxt),
              lote.map((f) => f.departamentoId),
              lote.map((f) => f.codigo),
              lote.map((f) => f.nombre),
              lote.map((f) => f.codigoNcExcel),
              lote.map((f) => f.inscritos),
              lote.map((f) => f.vacantes),
              lote.map((f) => f.pctInscritos),
              lote.map((f) => f.pctVacantes),
              lote.map((f) => f.criterioExcel),
            ],
            transaction,
          }
        );
        onLote?.(Math.min(inicio + LOTE_STAGING, filas.length));
      }
    },

    /** V1–V5: cualquiera con filas aborta la carga. */
    validacionesBloqueantes: async (transaction: Transaction) => ({
      V1: await hallazgo(
        transaction,
        `SELECT fila_excel, departamento_txt, count(*) OVER () AS total
           FROM stg_ocupacional
          WHERE hoja = 'DEP' AND departamento_id IS NULL
          ORDER BY fila_excel`
      ),
      V2: await hallazgo(
        transaction,
        `SELECT s.fila_excel, s.hoja, s.codigo, s.codigo_nc_excel,
                CASE WHEN substr(s.codigo, 1, 1) = '0' THEN 0
                     ELSE CAST(substr(s.codigo, 2, 1) AS smallint) END AS codigo_nc_derivado,
                count(*) OVER () AS total
           FROM stg_ocupacional s
           LEFT JOIN niveles_cualificacion nc ON nc.codigo_nc = s.codigo_nc_excel
          WHERE nc.codigo_nc IS NULL
             OR s.codigo_nc_excel <> CASE WHEN substr(s.codigo, 1, 1) = '0' THEN 0
                                          ELSE CAST(substr(s.codigo, 2, 1) AS smallint) END
          ORDER BY s.hoja DESC, s.fila_excel`
      ),
      V3: await hallazgo(
        transaction,
        `SELECT codigo, array_agg(DISTINCT nombre) AS nombres, count(*) OVER () AS total
           FROM stg_ocupacional
          GROUP BY codigo
         HAVING COUNT(DISTINCT nombre) > 1
          ORDER BY codigo`
      ),
      V4: await hallazgo(
        transaction,
        `SELECT hoja, departamento_txt, codigo, array_agg(fila_excel ORDER BY fila_excel) AS filas,
                count(*) OVER () AS total
           FROM stg_ocupacional
          GROUP BY hoja, departamento_id, departamento_txt, codigo
         HAVING COUNT(*) > 1
          ORDER BY hoja DESC, codigo`
      ),
      V5: await hallazgo(
        transaction,
        `WITH nac AS (
           SELECT codigo, inscritos, vacantes FROM stg_ocupacional WHERE hoja = 'NAC'
         ), dep AS (
           SELECT codigo, SUM(inscritos) AS inscritos, SUM(vacantes) AS vacantes
             FROM stg_ocupacional WHERE hoja = 'DEP' GROUP BY codigo
         )
         SELECT COALESCE(nac.codigo, dep.codigo) AS codigo,
                nac.inscritos AS ins_nacional, dep.inscritos AS ins_suma_dptos,
                nac.vacantes  AS vac_nacional, dep.vacantes  AS vac_suma_dptos,
                count(*) OVER () AS total
           FROM nac FULL JOIN dep ON dep.codigo = nac.codigo
          WHERE nac.codigo IS NULL OR dep.codigo IS NULL
             OR nac.inscritos <> dep.inscritos OR nac.vacantes <> dep.vacantes
          ORDER BY 1`
      ),
    }),

    /** V6–V9: se guardan en el reporte, no abortan. */
    validacionesDeAdvertencia: async (transaction: Transaction) => ({
      // Recalcula los percentiles con la metodología detectada: dentro de (ámbito, nivel
      // 0/A/B/C/D), solo ocupaciones con valor >= 10, orden por valor y luego código,
      // percentil = posición / total del grupo.
      V6: await hallazgo(
        transaction,
        `WITH s AS (
           SELECT st.*, nc.nivel_ocupacional_id AS nivel_id
             FROM stg_ocupacional st
             JOIN niveles_cualificacion nc ON nc.codigo_nc = st.codigo_nc_excel
         ), calc AS (
           SELECT fila_excel, hoja, departamento_txt, codigo, pct_inscritos, pct_vacantes,
                  CASE WHEN inscritos >= 10 THEN
                    CAST(ROW_NUMBER() OVER (PARTITION BY hoja, departamento_id, nivel_id, inscritos >= 10
                                            ORDER BY inscritos, codigo) AS float8)
                    / COUNT(*) OVER (PARTITION BY hoja, departamento_id, nivel_id, inscritos >= 10)
                  END AS pct_ins_calc,
                  CASE WHEN vacantes >= 10 THEN
                    CAST(ROW_NUMBER() OVER (PARTITION BY hoja, departamento_id, nivel_id, vacantes >= 10
                                            ORDER BY vacantes, codigo) AS float8)
                    / COUNT(*) OVER (PARTITION BY hoja, departamento_id, nivel_id, vacantes >= 10)
                  END AS pct_vac_calc
             FROM s
         )
         SELECT fila_excel, hoja, departamento_txt, codigo,
                pct_inscritos, pct_ins_calc, pct_vacantes, pct_vac_calc,
                count(*) OVER () AS total
           FROM calc
          WHERE (pct_inscritos IS NULL) <> (pct_ins_calc IS NULL)
             OR abs(pct_inscritos - pct_ins_calc) > 1e-9
             OR (pct_vacantes IS NULL) <> (pct_vac_calc IS NULL)
             OR abs(pct_vacantes - pct_vac_calc) > 1e-9
          ORDER BY hoja DESC, fila_excel`
      ),
      V7: await hallazgo(
        transaction,
        `WITH f AS (
           SELECT fila_excel, hoja, departamento_txt, codigo, criterio_excel,
                  CASE WHEN COALESCE(pct_inscritos, 0) > 0.8 AND COALESCE(pct_vacantes, 0) > 0.8 THEN 1
                       WHEN COALESCE(pct_inscritos, 0) > 0.8 THEN 2
                       WHEN COALESCE(pct_vacantes, 0)  > 0.8 THEN 3
                       ELSE 4 END AS criterio_formula
             FROM stg_ocupacional
            WHERE criterio_excel IS NOT NULL
         )
         SELECT *, count(*) OVER () AS total
           FROM f
          WHERE criterio_excel <> criterio_formula
          ORDER BY hoja DESC, fila_excel`
      ),
      V8: await hallazgo(
        transaction,
        // El conteo va fuera del DISTINCT: dentro contaría cada código una vez por hoja
        // y departamento (34 veces).
        `SELECT cambios.*, count(*) OVER () AS total
           FROM (SELECT DISTINCT s.codigo, o.nombre AS nombre_actual, s.nombre AS nombre_nuevo
                   FROM stg_ocupacional s
                   JOIN ocupaciones o ON o.codigo = s.codigo
                  WHERE o.nombre <> s.nombre) cambios
          ORDER BY cambios.codigo`
      ),
      V9: await hallazgo(
        transaction,
        `SELECT departamento_txt, COUNT(*) AS ocupaciones,
                (SELECT COUNT(*) FROM stg_ocupacional WHERE hoja = 'NAC') AS esperadas,
                count(*) OVER () AS total
           FROM stg_ocupacional
          WHERE hoja = 'DEP'
          GROUP BY departamento_id, departamento_txt
         HAVING COUNT(*) <> (SELECT COUNT(*) FROM stg_ocupacional WHERE hoja = 'NAC')
          ORDER BY departamento_txt`
      ),
    }),

    /** H: md5 del contenido numérico (sin nombres), en orden estable. */
    async calcularHuella(transaction: Transaction): Promise<string> {
      const [fila] = await seleccionar<{ huella: string }>(
        `SELECT md5(string_agg(
                  concat_ws('|', hoja, COALESCE(CAST(departamento_id AS text), ''), codigo,
                            inscritos, vacantes,
                            COALESCE(CAST(pct_inscritos AS text), ''), COALESCE(CAST(pct_vacantes AS text), '')),
                  E'\\n' ORDER BY hoja, departamento_id NULLS FIRST, codigo)) AS huella
           FROM stg_ocupacional`,
        {},
        transaction
      );
      return fila.huella;
    },

    /**
     * 3.1 Upsert del catálogo de ocupaciones. El nombre solo lo reemplaza un corte igual
     * o más reciente que el que lo fijó, así que el orden de carga no altera el resultado.
     */
    upsertOcupaciones: (transaction: Transaction, anio: number, periodoId: number) =>
      sequelize.query(
        `INSERT INTO ocupaciones (codigo, nombre, nombre_vigencia)
         SELECT DISTINCT s.codigo, s.nombre, CAST(:anio AS int) * 10 + p.orden
           FROM stg_ocupacional s
          CROSS JOIN periodos p
          WHERE p.id = :periodoId
         ON CONFLICT (codigo) DO UPDATE
            SET nombre = EXCLUDED.nombre,
                nombre_vigencia = EXCLUDED.nombre_vigencia,
                updated_at = now()
          WHERE EXCLUDED.nombre_vigencia >= ocupaciones.nombre_vigencia
            AND (ocupaciones.nombre IS DISTINCT FROM EXCLUDED.nombre
                 OR ocupaciones.nombre_vigencia <> EXCLUDED.nombre_vigencia)`,
        { replacements: { anio, periodoId }, transaction }
      ),

    /**
     * 3.2 Crea el corte, en borrador, con su huella. Sin `ON CONFLICT`: la celda se
     * comprobó vacía con el candado tomado, y una celda con datos no se recarga.
     */
    async crearCorte(transaction: Transaction, anio: number, periodoId: number, huella: string): Promise<number> {
      const [corte] = await seleccionar<{ id: number }>(
        `INSERT INTO cortes_ocupacionales (anio, periodo_id, huella_datos)
         VALUES (:anio, :periodoId, :huella)
         RETURNING id`,
        { anio, periodoId, huella },
        transaction
      );
      return corte.id;
    },

    /** 3.3 Los hechos del corte, desde la tabla temporal. */
    async guardarIndicadores(transaction: Transaction, corteId: number) {
      await sequelize.query(
        `INSERT INTO indicadores_ocupacionales
               (corte_id, departamento_id, ocupacion_id, inscritos, vacantes,
                percentil_inscritos, percentil_vacantes)
         SELECT :corteId, s.departamento_id, o.id, s.inscritos, s.vacantes, s.pct_inscritos, s.pct_vacantes
           FROM stg_ocupacional s
           JOIN ocupaciones o ON o.codigo = s.codigo`,
        { replacements: { corteId }, transaction }
      );
    },

    /** 3.4 Cierre de la carga, dentro de la misma transacción que los datos. */
    async cerrarCompletada(
      transaction: Transaction,
      datos: {
        cargaId: string;
        corteId: number;
        filasNacional: number;
        filasDepartamental: number;
        reporte: object;
        mensaje: string;
      }
    ) {
      const filas = datos.filasNacional + datos.filasDepartamental;
      await sequelize.query(
        `UPDATE cargas_datos_ocupacionales
            SET corte_id = :corteId, filas_nacional = :filasNacional,
                filas_departamental = :filasDepartamental, reporte = CAST(:reporte AS jsonb)
          WHERE carga_id = :cargaId`,
        {
          replacements: {
            cargaId: datos.cargaId,
            corteId: datos.corteId,
            filasNacional: datos.filasNacional,
            filasDepartamental: datos.filasDepartamental,
            reporte: JSON.stringify(datos.reporte),
          },
          transaction,
        }
      );
      await sequelize.query(
        `UPDATE cargas_datos
            SET estado = 'completado', progreso = 100, filas_procesadas = :filas, filas_totales = :filas,
                mensaje = :mensaje, completado_en = now()
          WHERE id = :cargaId`,
        { replacements: { cargaId: datos.cargaId, filas, mensaje: datos.mensaje }, transaction }
      );
    },
  },
};

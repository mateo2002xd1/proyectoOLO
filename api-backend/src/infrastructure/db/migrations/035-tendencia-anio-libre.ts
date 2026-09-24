import { QueryInterface } from 'sequelize';

export const nombre = '035-tendencia-anio-libre';

/**
 * El año de un corte de tendencia ocupacional deja de tener rango de negocio.
 *
 * La 033 puso `CHECK (anio BETWEEN 2012 AND 2100)` en `cortes_ocupacionales` y en
 * `cargas_datos_ocupacionales`, y el panel solo ofrecía 2012..año actual. El usuario pidió
 * elegir libremente el año de cada archivo —años anteriores a 2012 y proyecciones de
 * muchos años hacia adelante—, así que la única regla que queda es que sea un año de
 * cuatro cifras.
 *
 * Los CHECK viejos se quitan **por definición**, no por nombre (el que les puso Postgres
 * es accidental; mismo criterio que la 008).
 *
 * La matriz `v_estado_cargas_ocupacional` iba de 2012 al mayor entre el año actual y el
 * último corte: un 2005 no se veía, ni un año futuro cuya carga seguía en curso o falló
 * (sin corte todavía). Ahora va del menor al mayor año con corte **o carga**, y siempre
 * cubre de 2012 al año actual para que el panel tenga los siete periodos aunque no haya
 * nada cargado.
 */

const TABLAS = ['cortes_ocupacionales', 'cargas_datos_ocupacionales'];

/** Quita los CHECK de la columna `anio` de las dos tablas, sin importar su nombre. */
const QUITAR_CHECKS_DE_ANIO = `
  DO $$
  DECLARE r record;
  BEGIN
    FOR r IN
      SELECT conrelid::regclass AS tabla, conname
        FROM pg_constraint
       WHERE contype = 'c'
         AND conrelid IN (${TABLAS.map((t) => `'${t}'::regclass`).join(', ')})
         AND pg_get_constraintdef(oid) ~ '\\manio\\M'
    LOOP
      EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', r.tabla, r.conname);
    END LOOP;
  END $$;
`;

const checksDeAnio = (desde: number, hasta: number) =>
  TABLAS.map(
    (t) => `ALTER TABLE ${t} ADD CONSTRAINT ck_${t}_anio CHECK (anio BETWEEN ${desde} AND ${hasta});`
  ).join('\n');

/** La matriz de la 033, con los años que se le pasen. El resto no cambia. */
const vistaEstado = (anios: string) => `
  CREATE OR REPLACE VIEW v_estado_cargas_ocupacional AS
  WITH anios AS (
    ${anios}
  ), ultima_carga AS (
    SELECT DISTINCT ON (co.anio, co.periodo_id)
           co.anio, co.periodo_id,
           cd.id              AS carga_id,
           cd.estado          AS carga_estado,
           ar.nombre_original AS archivo_nombre,
           cd.completado_en   AS finalizado_en,
           co.reporte
      FROM cargas_datos_ocupacionales co
      JOIN cargas_datos cd ON cd.id = co.carga_id
      LEFT JOIN archivos ar ON ar.id = cd.archivo_id
     ORDER BY co.anio, co.periodo_id, cd.creado_en DESC, cd.id DESC
  )
  SELECT a.anio,
         p.id      AS periodo_id,
         p.codigo  AS periodo_codigo,
         p.nombre  AS periodo_nombre,
         p.orden   AS periodo_orden,
         c.id      AS corte_id,
         c.estado  AS corte_estado,
         c.publicado_en,
         u.carga_id,
         u.carga_estado,
         u.archivo_nombre,
         u.finalizado_en,
         COALESCE(jsonb_array_length(u.reporte -> 'advertencias'), 0) AS validaciones_con_advertencia,
         CASE
           WHEN c.id IS NOT NULL               THEN c.estado
           WHEN u.carga_estado = 'error'       THEN 'fallido'
           WHEN u.carga_estado = 'procesando'  THEN 'procesando'
           ELSE 'pendiente'
         END AS estado_celda
    FROM anios a
   CROSS JOIN periodos p
    LEFT JOIN cortes_ocupacionales c ON c.anio = a.anio AND c.periodo_id = p.id
    LEFT JOIN ultima_carga         u ON u.anio = a.anio AND u.periodo_id = p.id;
`;

// LEAST/GREATEST ignoran los NULL: sin cargas, queda 2012..año actual.
const ANIOS_LIBRES = `
    SELECT generate_series(
             LEAST(2012,
                   (SELECT MIN(anio) FROM cortes_ocupacionales),
                   (SELECT MIN(anio) FROM cargas_datos_ocupacionales)),
             GREATEST(EXTRACT(YEAR FROM now())::int,
                      (SELECT MAX(anio) FROM cortes_ocupacionales),
                      (SELECT MAX(anio) FROM cargas_datos_ocupacionales))
           )::smallint AS anio`;

const ANIOS_033 = `
    SELECT generate_series(
             2012,
             GREATEST(EXTRACT(YEAR FROM now())::int,
                      COALESCE((SELECT MAX(anio) FROM cortes_ocupacionales), 2012))
           )::smallint AS anio`;

/**
 * En su propia transacción, como la 032: el runner no le pasa la suya a `up`/`down`, y a
 * medio camino la tabla quedaría sin el CHECK viejo y sin el nuevo.
 */
const enUnaTransaccion = (queryInterface: QueryInterface, sentencias: string[]) =>
  queryInterface.sequelize.transaction(async (transaction) => {
    for (const sentencia of sentencias) await queryInterface.sequelize.query(sentencia, { transaction });
  });

export async function up(queryInterface: QueryInterface): Promise<void> {
  await enUnaTransaccion(queryInterface, [QUITAR_CHECKS_DE_ANIO, checksDeAnio(1000, 9999), vistaEstado(ANIOS_LIBRES)]);
}

/** Falla sin tocar nada si ya hay cortes o cargas fuera de 2012–2100: habría que eliminarlos antes. */
export async function down(queryInterface: QueryInterface): Promise<void> {
  await enUnaTransaccion(queryInterface, [QUITAR_CHECKS_DE_ANIO, checksDeAnio(2012, 2100), vistaEstado(ANIOS_033)]);
}

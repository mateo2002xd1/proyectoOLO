import { QueryInterface } from 'sequelize';

export const nombre = '037-tendencia-ocupacional-claves-uuid';

/**
 * Las tablas de la tendencia ocupacional pasan a UUID en toda clave primaria (D3 de
 * `11-base-de-datos.md`), como el resto del esquema.
 *
 * La 033 las creó con `SMALLINT` e `INTEGER`/`BIGINT` de identidad: 1, 2, 3… Un id
 * secuencial se adivina —`/cortes/7/despublicar` invita a probar el 8— y dice cuántas filas
 * hay. Se convierten **en su sitio**, conservando los datos: cada fila recibe un UUID y cada
 * clave foránea se resuelve por el id viejo antes de soltarlo.
 *
 * Dos columnas generadas no pueden apuntar a un UUID, porque una expresión generada solo
 * ve su propia fila. Apuntan a la clave natural del catálogo, que es `UNIQUE`:
 *
 * - `indicadores_ocupacionales.criterio_id` (1–4) pasa a `criterio_codigo`, con la misma
 *   fórmula del 80 % (I17) y FK a `criterios_ocupacionales.codigo`.
 * - `ocupaciones.codigo_nc` sigue apuntando a `niveles_cualificacion.codigo_nc`, que deja
 *   de ser la clave primaria y queda `UNIQUE`.
 *
 * Las restricciones que se recrean llevan nombre propio (lección de la 008). Las vistas
 * dependen de casi todas las columnas que cambian: se borran al principio y se recrean al
 * final, iguales salvo por el criterio, que ahora se expone por código y orden.
 *
 * En su propia transacción, como la 032 y la 035: a medio camino las tablas quedarían sin
 * clave primaria.
 */

/** Quita las FK de `tabla` sobre `columna`, sin importar su nombre (el de la 033 es accidental). */
const quitarFks = (tabla: string, columna: string) => `
  DO $$
  DECLARE r record;
  BEGIN
    FOR r IN
      SELECT con.conname
        FROM pg_constraint con
        JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY (con.conkey)
       WHERE con.contype = 'f'
         AND con.conrelid = '${tabla}'::regclass
         AND att.attname = '${columna}'
    LOOP
      EXECUTE format('ALTER TABLE ${tabla} DROP CONSTRAINT %I', r.conname);
    END LOOP;
  END $$;
`;

/** Quita la clave primaria de `tabla`, sin importar su nombre. */
const quitarPk = (tabla: string) => `
  DO $$
  DECLARE r record;
  BEGIN
    FOR r IN SELECT conname FROM pg_constraint WHERE contype = 'p' AND conrelid = '${tabla}'::regclass
    LOOP
      EXECUTE format('ALTER TABLE ${tabla} DROP CONSTRAINT %I', r.conname);
    END LOOP;
  END $$;
`;

const BORRAR_VISTAS = `
  DROP VIEW IF EXISTS v_estado_cargas_ocupacional;
  DROP VIEW IF EXISTS v_buscador_ocupacional;
`;

/**
 * Los índices que caen con las columnas viejas de `indicadores_ocupacionales` y de las
 * tablas de cortes y cargas. Iguales a los de la 033 salvo por la columna del criterio.
 */
const indices = (criterio: 'criterio_codigo' | 'criterio_id') => `
  ALTER TABLE cortes_ocupacionales
    ADD CONSTRAINT uq_cortes_ocupacionales_anio_periodo UNIQUE (anio, periodo_id);

  CREATE INDEX idx_cargas_datos_ocupacionales_celda
    ON cargas_datos_ocupacionales (anio, periodo_id);

  CREATE UNIQUE INDEX uq_indicadores_ocupacionales_nacional
    ON indicadores_ocupacionales (corte_id, ocupacion_id)
    WHERE departamento_id IS NULL;
  CREATE UNIQUE INDEX uq_indicadores_ocupacionales_departamental
    ON indicadores_ocupacionales (corte_id, departamento_id, ocupacion_id)
    WHERE departamento_id IS NOT NULL;
  CREATE INDEX idx_indicadores_ocupacionales_busqueda
    ON indicadores_ocupacionales (corte_id, departamento_id, ${criterio});
  CREATE INDEX idx_indicadores_ocupacionales_ocupacion
    ON indicadores_ocupacionales (ocupacion_id, corte_id);
`;

/** La fórmula de las columnas "X" de la 033; `valores` son lo que da en cada caso. */
const formulaCriterio = (valores: [string, string, string, string]) => `
  CASE
    WHEN COALESCE(percentil_inscritos, 0) > 0.8
     AND COALESCE(percentil_vacantes,  0) > 0.8 THEN ${valores[0]}
    WHEN COALESCE(percentil_inscritos, 0) > 0.8 THEN ${valores[1]}
    WHEN COALESCE(percentil_vacantes,  0) > 0.8 THEN ${valores[2]}
    ELSE ${valores[3]}
  END`;

/**
 * El buscador de la 033. Con UUID el criterio se expone por `criterio_codigo` y
 * `criterio_orden` (el 1–4 de la especificación, que es el que ordena los resultados).
 */
const VISTA_BUSCADOR_UUID = `
  CREATE VIEW v_buscador_ocupacional AS
  SELECT
      i.id,
      c.id                           AS corte_id,
      c.anio,
      p.id                           AS periodo_id,
      p.codigo                       AS periodo_codigo,
      p.nombre                       AS periodo_nombre,
      c.estado                       AS corte_estado,
      i.departamento_id,
      d.codigo_dane,
      COALESCE(d.nombre, 'Nacional') AS departamento_nombre,
      (i.departamento_id IS NULL)    AS es_nacional,
      o.id                           AS ocupacion_id,
      o.codigo                       AS ocupacion_codigo,
      o.nombre                       AS ocupacion_nombre,
      o.codigo_nc,
      n.id                           AS nivel_ocupacional_id,
      n.codigo                       AS nivel_codigo,
      n.etiqueta                     AS nivel_etiqueta,
      n.nombre                       AS nivel_nombre,
      i.inscritos,
      i.vacantes,
      i.percentil_inscritos,
      i.percentil_vacantes,
      cr.codigo                      AS criterio_codigo,
      cr.nombre                      AS criterio_nombre,
      cr.orden                       AS criterio_orden,
      (i.inscritos = 0 AND i.vacantes = 0) AS sin_registros
  FROM indicadores_ocupacionales i
  JOIN cortes_ocupacionales      c  ON c.id  = i.corte_id
  JOIN periodos                  p  ON p.id  = c.periodo_id
  JOIN ocupaciones               o  ON o.id  = i.ocupacion_id
  JOIN niveles_cualificacion     nc ON nc.codigo_nc = o.codigo_nc
  JOIN niveles_ocupacionales     n  ON n.id  = nc.nivel_ocupacional_id
  JOIN criterios_ocupacionales   cr ON cr.codigo = i.criterio_codigo
  LEFT JOIN departamentos        d  ON d.id  = i.departamento_id;
`;

/** El buscador tal como lo dejó la 033, para el `down`. */
const VISTA_BUSCADOR_033 = `
  CREATE VIEW v_buscador_ocupacional AS
  SELECT
      i.id,
      c.id                           AS corte_id,
      c.anio,
      p.id                           AS periodo_id,
      p.codigo                       AS periodo_codigo,
      p.nombre                       AS periodo_nombre,
      c.estado                       AS corte_estado,
      i.departamento_id,
      d.codigo_dane,
      COALESCE(d.nombre, 'Nacional') AS departamento_nombre,
      (i.departamento_id IS NULL)    AS es_nacional,
      o.id                           AS ocupacion_id,
      o.codigo                       AS ocupacion_codigo,
      o.nombre                       AS ocupacion_nombre,
      o.codigo_nc,
      n.id                           AS nivel_ocupacional_id,
      n.codigo                       AS nivel_codigo,
      n.etiqueta                     AS nivel_etiqueta,
      n.nombre                       AS nivel_nombre,
      i.inscritos,
      i.vacantes,
      i.percentil_inscritos,
      i.percentil_vacantes,
      cr.id                          AS criterio_id,
      cr.codigo                      AS criterio_codigo,
      cr.nombre                      AS criterio_nombre,
      (i.inscritos = 0 AND i.vacantes = 0) AS sin_registros
  FROM indicadores_ocupacionales i
  JOIN cortes_ocupacionales      c  ON c.id  = i.corte_id
  JOIN periodos                  p  ON p.id  = c.periodo_id
  JOIN ocupaciones               o  ON o.id  = i.ocupacion_id
  JOIN niveles_cualificacion     nc ON nc.codigo_nc = o.codigo_nc
  JOIN niveles_ocupacionales     n  ON n.id  = nc.nivel_ocupacional_id
  JOIN criterios_ocupacionales   cr ON cr.id = i.criterio_id
  LEFT JOIN departamentos        d  ON d.id  = i.departamento_id;
`;

/** La matriz de la 035, sin cambios: se recrea porque sus columnas cambian de tipo. */
const VISTA_ESTADO = `
  CREATE VIEW v_estado_cargas_ocupacional AS
  WITH anios AS (
    SELECT generate_series(
             LEAST(2012,
                   (SELECT MIN(anio) FROM cortes_ocupacionales),
                   (SELECT MIN(anio) FROM cargas_datos_ocupacionales)),
             GREATEST(EXTRACT(YEAR FROM now())::int,
                      (SELECT MAX(anio) FROM cortes_ocupacionales),
                      (SELECT MAX(anio) FROM cargas_datos_ocupacionales))
           )::smallint AS anio
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

const UP = [
  BORRAR_VISTAS,

  // 1. Un UUID por fila. Un DEFAULT volátil reescribe la tabla y da uno distinto a cada fila.
  `ALTER TABLE niveles_ocupacionales     ADD COLUMN id_nuevo UUID NOT NULL DEFAULT gen_random_uuid();
   ALTER TABLE niveles_cualificacion     ADD COLUMN id_nuevo UUID NOT NULL DEFAULT gen_random_uuid();
   ALTER TABLE criterios_ocupacionales   ADD COLUMN id_nuevo UUID NOT NULL DEFAULT gen_random_uuid();
   ALTER TABLE periodos                  ADD COLUMN id_nuevo UUID NOT NULL DEFAULT gen_random_uuid();
   ALTER TABLE ocupaciones               ADD COLUMN id_nuevo UUID NOT NULL DEFAULT gen_random_uuid();
   ALTER TABLE cortes_ocupacionales      ADD COLUMN id_nuevo UUID NOT NULL DEFAULT gen_random_uuid();
   ALTER TABLE indicadores_ocupacionales ADD COLUMN id_nuevo UUID NOT NULL DEFAULT gen_random_uuid();`,

  // 2. Cada FK gana su columna UUID, resuelta por el id viejo mientras todavía existe.
  `ALTER TABLE niveles_cualificacion ADD COLUMN nivel_ocupacional_nuevo UUID;
   UPDATE niveles_cualificacion nc
      SET nivel_ocupacional_nuevo = n.id_nuevo
     FROM niveles_ocupacionales n
    WHERE n.id = nc.nivel_ocupacional_id;

   ALTER TABLE cortes_ocupacionales ADD COLUMN periodo_nuevo UUID;
   UPDATE cortes_ocupacionales c
      SET periodo_nuevo = p.id_nuevo
     FROM periodos p
    WHERE p.id = c.periodo_id;

   ALTER TABLE cargas_datos_ocupacionales ADD COLUMN periodo_nuevo UUID, ADD COLUMN corte_nuevo UUID;
   UPDATE cargas_datos_ocupacionales co
      SET periodo_nuevo = p.id_nuevo
     FROM periodos p
    WHERE p.id = co.periodo_id;
   UPDATE cargas_datos_ocupacionales co
      SET corte_nuevo = c.id_nuevo
     FROM cortes_ocupacionales c
    WHERE c.id = co.corte_id;

   ALTER TABLE indicadores_ocupacionales ADD COLUMN corte_nuevo UUID, ADD COLUMN ocupacion_nuevo UUID;
   UPDATE indicadores_ocupacionales i
      SET corte_nuevo = c.id_nuevo, ocupacion_nuevo = o.id_nuevo
     FROM cortes_ocupacionales c, ocupaciones o
    WHERE c.id = i.corte_id AND o.id = i.ocupacion_id;`,

  // 3. Fuera lo viejo, de los hijos a los padres. Con cada columna caen sus FK, índices y
  //    UNIQUE; se recrean en el paso 5. La FK de `ocupaciones.codigo_nc` depende de la PK
  //    de `niveles_cualificacion`: se quita antes y vuelve contra el UNIQUE.
  `ALTER TABLE indicadores_ocupacionales
     DROP COLUMN criterio_id, DROP COLUMN corte_id, DROP COLUMN ocupacion_id, DROP COLUMN id;
   ALTER TABLE cargas_datos_ocupacionales DROP COLUMN periodo_id, DROP COLUMN corte_id;
   ALTER TABLE cortes_ocupacionales DROP COLUMN periodo_id, DROP COLUMN id;`,
  quitarFks('ocupaciones', 'codigo_nc'),
  quitarPk('niveles_cualificacion'),
  `ALTER TABLE ocupaciones             DROP COLUMN id;
   ALTER TABLE niveles_cualificacion   DROP COLUMN nivel_ocupacional_id;
   ALTER TABLE niveles_ocupacionales   DROP COLUMN id;
   ALTER TABLE criterios_ocupacionales DROP COLUMN id;
   ALTER TABLE periodos                DROP COLUMN id;`,

  // 4. Las columnas nuevas toman el nombre de las viejas y sus claves primarias.
  `ALTER TABLE niveles_ocupacionales     RENAME COLUMN id_nuevo TO id;
   ALTER TABLE niveles_cualificacion     RENAME COLUMN id_nuevo TO id;
   ALTER TABLE criterios_ocupacionales   RENAME COLUMN id_nuevo TO id;
   ALTER TABLE periodos                  RENAME COLUMN id_nuevo TO id;
   ALTER TABLE ocupaciones               RENAME COLUMN id_nuevo TO id;
   ALTER TABLE cortes_ocupacionales      RENAME COLUMN id_nuevo TO id;
   ALTER TABLE indicadores_ocupacionales RENAME COLUMN id_nuevo TO id;

   ALTER TABLE niveles_ocupacionales     ADD CONSTRAINT niveles_ocupacionales_pkey     PRIMARY KEY (id);
   ALTER TABLE niveles_cualificacion     ADD CONSTRAINT niveles_cualificacion_pkey     PRIMARY KEY (id);
   ALTER TABLE criterios_ocupacionales   ADD CONSTRAINT criterios_ocupacionales_pkey   PRIMARY KEY (id);
   ALTER TABLE periodos                  ADD CONSTRAINT periodos_pkey                  PRIMARY KEY (id);
   ALTER TABLE ocupaciones               ADD CONSTRAINT ocupaciones_pkey               PRIMARY KEY (id);
   ALTER TABLE cortes_ocupacionales      ADD CONSTRAINT cortes_ocupacionales_pkey      PRIMARY KEY (id);
   ALTER TABLE indicadores_ocupacionales ADD CONSTRAINT indicadores_ocupacionales_pkey PRIMARY KEY (id);

   ALTER TABLE niveles_cualificacion RENAME COLUMN nivel_ocupacional_nuevo TO nivel_ocupacional_id;
   ALTER TABLE cortes_ocupacionales RENAME COLUMN periodo_nuevo TO periodo_id;
   ALTER TABLE cargas_datos_ocupacionales RENAME COLUMN periodo_nuevo TO periodo_id;
   ALTER TABLE cargas_datos_ocupacionales RENAME COLUMN corte_nuevo TO corte_id;
   ALTER TABLE indicadores_ocupacionales RENAME COLUMN corte_nuevo TO corte_id;
   ALTER TABLE indicadores_ocupacionales RENAME COLUMN ocupacion_nuevo TO ocupacion_id;`,

  // 5. Obligatoriedad, FK con nombre, el criterio generado y los índices.
  `ALTER TABLE niveles_cualificacion
     ALTER COLUMN nivel_ocupacional_id SET NOT NULL,
     ADD CONSTRAINT uq_niveles_cualificacion_codigo_nc UNIQUE (codigo_nc),
     ADD CONSTRAINT fk_niveles_cualificacion_nivel_ocupacional
       FOREIGN KEY (nivel_ocupacional_id) REFERENCES niveles_ocupacionales (id);

   ALTER TABLE ocupaciones
     ADD CONSTRAINT fk_ocupaciones_codigo_nc
       FOREIGN KEY (codigo_nc) REFERENCES niveles_cualificacion (codigo_nc);

   ALTER TABLE cortes_ocupacionales
     ALTER COLUMN periodo_id SET NOT NULL,
     ADD CONSTRAINT fk_cortes_ocupacionales_periodo
       FOREIGN KEY (periodo_id) REFERENCES periodos (id);

   ALTER TABLE cargas_datos_ocupacionales
     ALTER COLUMN periodo_id SET NOT NULL,
     ADD CONSTRAINT fk_cargas_datos_ocupacionales_periodo
       FOREIGN KEY (periodo_id) REFERENCES periodos (id),
     ADD CONSTRAINT fk_cargas_datos_ocupacionales_corte
       FOREIGN KEY (corte_id) REFERENCES cortes_ocupacionales (id) ON DELETE SET NULL;

   ALTER TABLE indicadores_ocupacionales
     ALTER COLUMN corte_id SET NOT NULL,
     ALTER COLUMN ocupacion_id SET NOT NULL,
     ADD CONSTRAINT fk_indicadores_ocupacionales_corte
       FOREIGN KEY (corte_id) REFERENCES cortes_ocupacionales (id) ON DELETE CASCADE,
     ADD CONSTRAINT fk_indicadores_ocupacionales_ocupacion
       FOREIGN KEY (ocupacion_id) REFERENCES ocupaciones (id),
     ADD COLUMN criterio_codigo VARCHAR(40) GENERATED ALWAYS AS (${formulaCriterio([
       "'ALTA_OFERTA_ALTA_DEMANDA'",
       "'ALTA_OFERTA_BAJA_DEMANDA'",
       "'BAJA_OFERTA_ALTA_DEMANDA'",
       "'BAJA_OFERTA_BAJA_DEMANDA'",
     ])}) STORED,
     ADD CONSTRAINT fk_indicadores_ocupacionales_criterio
       FOREIGN KEY (criterio_codigo) REFERENCES criterios_ocupacionales (codigo);`,
  indices('criterio_codigo'),

  VISTA_BUSCADOR_UUID,
  VISTA_ESTADO,
];

/**
 * De vuelta a los enteros de la 033. Los catálogos recuperan sus ids de siempre: en la
 * semilla `id` era igual a `orden` (y `niveles_cualificacion` vuelve a su `codigo_nc`).
 * Cortes, ocupaciones e indicadores reciben ids nuevos, en orden de creación o de código,
 * y la identidad sigue desde el mayor.
 */
const DOWN = [
  BORRAR_VISTAS,

  `ALTER TABLE niveles_ocupacionales     ADD COLUMN id_viejo SMALLINT;
   ALTER TABLE criterios_ocupacionales   ADD COLUMN id_viejo SMALLINT;
   ALTER TABLE periodos                  ADD COLUMN id_viejo SMALLINT;
   ALTER TABLE ocupaciones               ADD COLUMN id_viejo INTEGER;
   ALTER TABLE cortes_ocupacionales      ADD COLUMN id_viejo INTEGER;
   ALTER TABLE indicadores_ocupacionales ADD COLUMN id_viejo BIGINT;

   UPDATE niveles_ocupacionales   SET id_viejo = orden;
   UPDATE criterios_ocupacionales SET id_viejo = orden;
   UPDATE periodos                SET id_viejo = orden;
   UPDATE ocupaciones o SET id_viejo = n.fila
     FROM (SELECT id, row_number() OVER (ORDER BY codigo) AS fila FROM ocupaciones) n
    WHERE n.id = o.id;
   UPDATE cortes_ocupacionales c SET id_viejo = n.fila
     FROM (SELECT id, row_number() OVER (ORDER BY created_at, anio, periodo_id) AS fila
             FROM cortes_ocupacionales) n
    WHERE n.id = c.id;
   UPDATE indicadores_ocupacionales i SET id_viejo = n.fila
     FROM (SELECT i2.id,
                  row_number() OVER (ORDER BY c.id_viejo, i2.departamento_id NULLS FIRST, o.codigo) AS fila
             FROM indicadores_ocupacionales i2
             JOIN cortes_ocupacionales c ON c.id = i2.corte_id
             JOIN ocupaciones o ON o.id = i2.ocupacion_id) n
    WHERE n.id = i.id;`,

  `ALTER TABLE niveles_cualificacion ADD COLUMN nivel_ocupacional_viejo SMALLINT;
   UPDATE niveles_cualificacion nc SET nivel_ocupacional_viejo = n.id_viejo
     FROM niveles_ocupacionales n WHERE n.id = nc.nivel_ocupacional_id;

   ALTER TABLE cortes_ocupacionales ADD COLUMN periodo_viejo SMALLINT;
   UPDATE cortes_ocupacionales c SET periodo_viejo = p.id_viejo
     FROM periodos p WHERE p.id = c.periodo_id;

   ALTER TABLE cargas_datos_ocupacionales ADD COLUMN periodo_viejo SMALLINT, ADD COLUMN corte_viejo INTEGER;
   UPDATE cargas_datos_ocupacionales co SET periodo_viejo = p.id_viejo
     FROM periodos p WHERE p.id = co.periodo_id;
   UPDATE cargas_datos_ocupacionales co SET corte_viejo = c.id_viejo
     FROM cortes_ocupacionales c WHERE c.id = co.corte_id;

   ALTER TABLE indicadores_ocupacionales ADD COLUMN corte_viejo INTEGER, ADD COLUMN ocupacion_viejo INTEGER;
   UPDATE indicadores_ocupacionales i SET corte_viejo = c.id_viejo, ocupacion_viejo = o.id_viejo
     FROM cortes_ocupacionales c, ocupaciones o
    WHERE c.id = i.corte_id AND o.id = i.ocupacion_id;`,

  `ALTER TABLE indicadores_ocupacionales
     DROP COLUMN criterio_codigo, DROP COLUMN corte_id, DROP COLUMN ocupacion_id, DROP COLUMN id;
   ALTER TABLE cargas_datos_ocupacionales DROP COLUMN periodo_id, DROP COLUMN corte_id;
   ALTER TABLE cortes_ocupacionales DROP COLUMN periodo_id, DROP COLUMN id;
   ALTER TABLE ocupaciones DROP CONSTRAINT fk_ocupaciones_codigo_nc, DROP COLUMN id;
   ALTER TABLE niveles_cualificacion
     DROP CONSTRAINT uq_niveles_cualificacion_codigo_nc, DROP COLUMN nivel_ocupacional_id, DROP COLUMN id;
   ALTER TABLE niveles_ocupacionales   DROP COLUMN id;
   ALTER TABLE criterios_ocupacionales DROP COLUMN id;
   ALTER TABLE periodos                DROP COLUMN id;`,

  `ALTER TABLE niveles_ocupacionales     RENAME COLUMN id_viejo TO id;
   ALTER TABLE criterios_ocupacionales   RENAME COLUMN id_viejo TO id;
   ALTER TABLE periodos                  RENAME COLUMN id_viejo TO id;
   ALTER TABLE ocupaciones               RENAME COLUMN id_viejo TO id;
   ALTER TABLE cortes_ocupacionales      RENAME COLUMN id_viejo TO id;
   ALTER TABLE indicadores_ocupacionales RENAME COLUMN id_viejo TO id;
   ALTER TABLE niveles_cualificacion RENAME COLUMN nivel_ocupacional_viejo TO nivel_ocupacional_id;
   ALTER TABLE cortes_ocupacionales RENAME COLUMN periodo_viejo TO periodo_id;
   ALTER TABLE cargas_datos_ocupacionales RENAME COLUMN periodo_viejo TO periodo_id;
   ALTER TABLE cargas_datos_ocupacionales RENAME COLUMN corte_viejo TO corte_id;
   ALTER TABLE indicadores_ocupacionales RENAME COLUMN corte_viejo TO corte_id;
   ALTER TABLE indicadores_ocupacionales RENAME COLUMN ocupacion_viejo TO ocupacion_id;

   ALTER TABLE niveles_ocupacionales   ALTER COLUMN id SET NOT NULL, ADD PRIMARY KEY (id);
   ALTER TABLE criterios_ocupacionales ALTER COLUMN id SET NOT NULL, ADD PRIMARY KEY (id);
   ALTER TABLE periodos                ALTER COLUMN id SET NOT NULL, ADD PRIMARY KEY (id);
   ALTER TABLE niveles_cualificacion   ADD PRIMARY KEY (codigo_nc);

   ALTER TABLE ocupaciones               ALTER COLUMN id SET NOT NULL, ADD PRIMARY KEY (id),
     ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY;
   ALTER TABLE cortes_ocupacionales      ALTER COLUMN id SET NOT NULL, ADD PRIMARY KEY (id),
     ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY;
   ALTER TABLE indicadores_ocupacionales ALTER COLUMN id SET NOT NULL, ADD PRIMARY KEY (id),
     ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY;
   SELECT setval(pg_get_serial_sequence('ocupaciones', 'id'),
                 COALESCE((SELECT max(id) FROM ocupaciones), 0) + 1, false);
   SELECT setval(pg_get_serial_sequence('cortes_ocupacionales', 'id'),
                 COALESCE((SELECT max(id) FROM cortes_ocupacionales), 0) + 1, false);
   SELECT setval(pg_get_serial_sequence('indicadores_ocupacionales', 'id'),
                 COALESCE((SELECT max(id) FROM indicadores_ocupacionales), 0) + 1, false);`,

  `ALTER TABLE niveles_cualificacion
     ALTER COLUMN nivel_ocupacional_id SET NOT NULL,
     ADD FOREIGN KEY (nivel_ocupacional_id) REFERENCES niveles_ocupacionales (id);
   ALTER TABLE ocupaciones ADD FOREIGN KEY (codigo_nc) REFERENCES niveles_cualificacion (codigo_nc);
   ALTER TABLE cortes_ocupacionales
     ALTER COLUMN periodo_id SET NOT NULL,
     ADD FOREIGN KEY (periodo_id) REFERENCES periodos (id);
   ALTER TABLE cargas_datos_ocupacionales
     ALTER COLUMN periodo_id SET NOT NULL,
     ADD FOREIGN KEY (periodo_id) REFERENCES periodos (id),
     ADD FOREIGN KEY (corte_id) REFERENCES cortes_ocupacionales (id) ON DELETE SET NULL;
   ALTER TABLE indicadores_ocupacionales
     ALTER COLUMN corte_id SET NOT NULL,
     ALTER COLUMN ocupacion_id SET NOT NULL,
     ADD FOREIGN KEY (corte_id) REFERENCES cortes_ocupacionales (id) ON DELETE CASCADE,
     ADD FOREIGN KEY (ocupacion_id) REFERENCES ocupaciones (id),
     ADD COLUMN criterio_id SMALLINT GENERATED ALWAYS AS (${formulaCriterio(['1', '2', '3', '4'])}) STORED
       REFERENCES criterios_ocupacionales (id);`,
  indices('criterio_id'),

  VISTA_BUSCADOR_033,
  VISTA_ESTADO,
];

const enUnaTransaccion = (queryInterface: QueryInterface, sentencias: string[]) =>
  queryInterface.sequelize.transaction(async (transaction) => {
    for (const sentencia of sentencias) await queryInterface.sequelize.query(sentencia, { transaction });
  });

export async function up(queryInterface: QueryInterface): Promise<void> {
  await enUnaTransaccion(queryInterface, UP);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await enUnaTransaccion(queryInterface, DOWN);
}

import { QueryInterface } from 'sequelize';

export const nombre = '033-tendencia-ocupacional';

/**
 * Percentiles ocupacionales (inscritos vs. vacantes): lo que alimenta el bloque
 * "Tendencia Ocupacional" del sitio. Este DDL es el de
 * `criterios/001_percentiles_ocupacionales.sql` con tres ajustes al proyecto:
 *
 * - **Tablas en plural** (convención de `2-convenciones-del-proyecto.md`):
 *   `nivel_ocupacional` → `niveles_ocupacionales`, `nivel_ocupacional_codigo` →
 *   `niveles_cualificacion`, `ocupacion_indicador` → `indicadores_ocupacionales`, etc.
 * - **Departamentos**: se usa el catálogo único `departamentos` (UUID) depurado en 032,
 *   no una tabla propia. `departamento_id NULL` sigue significando "Nacional".
 * - **Bitácora de cargas**: en vez de `carga_excel_ocupacional` se reutiliza
 *   `cargas_datos` (la de "Programa + Sobresalientes", con `archivos` para el Excel), y
 *   lo propio de este módulo —año, periodo, corte, reporte de validaciones— va en
 *   `cargas_datos_ocupacionales`, una fila por carga.
 *
 * El criterio NO se guarda desde el Excel: es una columna generada con la misma fórmula
 * del 80 % que usan las cuatro columnas "X", así que nunca puede contradecir a los
 * percentiles. `DOUBLE PRECISION` a propósito: 51 filas del archivo real están
 * exactamente en 0,8 y la comparación tiene que dar lo mismo que en Excel.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(`
    -- ---------------------------------------------------------------------------
    -- Catálogos (semillas; no cambian con la carga)
    -- ---------------------------------------------------------------------------

    -- Filtro "Nivel Ocupacional" y, sobre todo, la partición con la que se calcularon
    -- los percentiles (0, A, B, C, D).
    CREATE TABLE niveles_ocupacionales (
      id           SMALLINT     PRIMARY KEY,
      codigo       CHAR(1)      NOT NULL UNIQUE,
      etiqueta     VARCHAR(40)  NOT NULL UNIQUE,
      nombre       VARCHAR(80)  NOT NULL,
      descripcion  TEXT,
      orden        SMALLINT     NOT NULL
    );

    -- Dígito N.C. (nivel de cualificación) del Excel → nivel ocupacional. 3 y 4 son C.
    CREATE TABLE niveles_cualificacion (
      codigo_nc             SMALLINT PRIMARY KEY,
      nivel_ocupacional_id  SMALLINT NOT NULL REFERENCES niveles_ocupacionales(id)
    );

    -- Las cuatro columnas "X" del Excel colapsadas en un catálogo.
    CREATE TABLE criterios_ocupacionales (
      id      SMALLINT     PRIMARY KEY,
      codigo  VARCHAR(40)  NOT NULL UNIQUE,
      nombre  VARCHAR(200) NOT NULL,
      regla   VARCHAR(120) NOT NULL,
      orden   SMALLINT     NOT NULL
    );

    -- El Excel no trae periodo: lo elige el administrador al cargar.
    CREATE TABLE periodos (
      id      SMALLINT    PRIMARY KEY,
      codigo  VARCHAR(10) NOT NULL UNIQUE,
      nombre  VARCHAR(40) NOT NULL,
      orden   SMALLINT    NOT NULL
    );

    -- Catálogo CNO, alimentado por el Excel (upsert). El N.C. se deriva del código.
    CREATE TABLE ocupaciones (
      id               INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      codigo           CHAR(4)      NOT NULL UNIQUE CHECK (codigo ~ '^[0-9]{4}$'),
      nombre           VARCHAR(255) NOT NULL,
      codigo_nc        SMALLINT     GENERATED ALWAYS AS (
                         CASE WHEN substr(codigo, 1, 1) = '0' THEN 0
                              ELSE substr(codigo, 2, 1)::smallint END
                       ) STORED
                       REFERENCES niveles_cualificacion(codigo_nc),
      -- anio * 10 + periodos.orden del corte que fijó el nombre: solo lo cambia un
      -- corte igual o más reciente, sin importar el orden en que se carguen.
      nombre_vigencia  INTEGER      NOT NULL DEFAULT 0,
      created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
      updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
    );
    CREATE INDEX idx_ocupaciones_codigo_nc ON ocupaciones (codigo_nc);

    -- ---------------------------------------------------------------------------
    -- Cortes (año × periodo) y bitácora de cargas
    -- ---------------------------------------------------------------------------

    CREATE TABLE cortes_ocupacionales (
      id            INTEGER     GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      anio          SMALLINT    NOT NULL CHECK (anio BETWEEN 2012 AND 2100),
      periodo_id    SMALLINT    NOT NULL REFERENCES periodos(id),
      estado        VARCHAR(12) NOT NULL DEFAULT 'borrador'
                    CHECK (estado IN ('borrador', 'publicado')),
      publicado_en  TIMESTAMPTZ,
      -- md5 del contenido numérico. La 034 le quitó el UNIQUE: el contenido se puede repetir.
      huella_datos  CHAR(32),
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT uq_cortes_ocupacionales_anio_periodo UNIQUE (anio, periodo_id),
      CONSTRAINT uq_cortes_ocupacionales_huella UNIQUE (huella_datos)
    );

    -- Lo propio de una carga de percentiles; lo común (archivo, quién, estado,
    -- progreso) sigue en cargas_datos, con modulo = 'tendencia_ocupacional'.
    CREATE TABLE cargas_datos_ocupacionales (
      carga_id             UUID        PRIMARY KEY REFERENCES cargas_datos(id) ON DELETE CASCADE,
      anio                 SMALLINT    NOT NULL CHECK (anio BETWEEN 2012 AND 2100),
      periodo_id           SMALLINT    NOT NULL REFERENCES periodos(id),
      reemplazar           BOOLEAN     NOT NULL DEFAULT false,
      corte_id             INTEGER     REFERENCES cortes_ocupacionales(id) ON DELETE SET NULL,
      filas_nacional       INTEGER,
      filas_departamental  INTEGER,
      reporte              JSONB       NOT NULL DEFAULT '{"errores":[],"advertencias":[]}'
    );
    CREATE INDEX idx_cargas_datos_ocupacionales_celda
      ON cargas_datos_ocupacionales (anio, periodo_id);

    -- ---------------------------------------------------------------------------
    -- Hechos: corte × ámbito × ocupación. departamento_id NULL = hoja nacional.
    -- ---------------------------------------------------------------------------

    CREATE TABLE indicadores_ocupacionales (
      id                   BIGINT   GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      corte_id             INTEGER  NOT NULL REFERENCES cortes_ocupacionales(id) ON DELETE CASCADE,
      departamento_id      UUID     REFERENCES departamentos(id) ON DELETE RESTRICT,
      ocupacion_id         INTEGER  NOT NULL REFERENCES ocupaciones(id),
      inscritos            INTEGER  NOT NULL DEFAULT 0 CHECK (inscritos >= 0),
      vacantes             INTEGER  NOT NULL DEFAULT 0 CHECK (vacantes  >= 0),
      -- Tal como los publica el Excel (NULL = celda vacía, menos de 10 registros).
      percentil_inscritos  DOUBLE PRECISION
                           CHECK (percentil_inscritos > 0 AND percentil_inscritos <= 1),
      percentil_vacantes   DOUBLE PRECISION
                           CHECK (percentil_vacantes  > 0 AND percentil_vacantes  <= 1),
      -- La fórmula de las columnas "X". Celda vacía = 0, igual que Excel.
      criterio_id          SMALLINT GENERATED ALWAYS AS (
                             CASE
                               WHEN COALESCE(percentil_inscritos, 0) > 0.8
                                AND COALESCE(percentil_vacantes,  0) > 0.8 THEN 1
                               WHEN COALESCE(percentil_inscritos, 0) > 0.8 THEN 2
                               WHEN COALESCE(percentil_vacantes,  0) > 0.8 THEN 3
                               ELSE 4
                             END
                           ) STORED
                           REFERENCES criterios_ocupacionales(id)
    );

    -- Unicidad del grano: dos índices parciales porque el nacional lleva NULL.
    CREATE UNIQUE INDEX uq_indicadores_ocupacionales_nacional
      ON indicadores_ocupacionales (corte_id, ocupacion_id)
      WHERE departamento_id IS NULL;
    CREATE UNIQUE INDEX uq_indicadores_ocupacionales_departamental
      ON indicadores_ocupacionales (corte_id, departamento_id, ocupacion_id)
      WHERE departamento_id IS NOT NULL;

    -- La consulta del buscador: corte + ámbito + criterio.
    CREATE INDEX idx_indicadores_ocupacionales_busqueda
      ON indicadores_ocupacionales (corte_id, departamento_id, criterio_id);
    -- Serie histórica de una ocupación y soporte de la FK.
    CREATE INDEX idx_indicadores_ocupacionales_ocupacion
      ON indicadores_ocupacionales (ocupacion_id, corte_id);

    -- ---------------------------------------------------------------------------
    -- Semillas
    -- ---------------------------------------------------------------------------

    INSERT INTO niveles_ocupacionales (id, codigo, etiqueta, nombre, descripcion, orden) VALUES
     (1, '0', '0 Dirección y gerencia', 'Dirección y Gerencia', NULL, 1),
     (2, 'A', 'Nivel 1 (A)', 'Profesional',
      'Las funciones de estas ocupaciones suelen ser muy variadas y complejas, su desempeño exige un alto grado de autonomía, responsabilidad por el trabajo de otros y ocasionalmente por la asignación de recursos.', 2),
     (3, 'B', 'Nivel 2 (B)', 'Técnicos Profesionales y Tecnólogos',
      'Las funciones de las ocupaciones de este nivel son por lo general muy variadas, demandan responsabilidad de supervisión, un apreciable grado de autonomía y juicio evaluativo.', 3),
     (4, 'C', 'Nivel 3,4 (C)', 'Oficios Calificados',
      'Las funciones de estas ocupaciones combinan actividades físicas e intelectuales, en algunos casos variadas y complejas, con algún nivel de autonomía para su desempeño.', 4),
     (5, 'D', 'Nivel 6 (D)', 'Oficios Elementales',
      'Las funciones de estas ocupaciones son sencillas y repetitivas y se desempeñan en actividades fundamentalmente de carácter físico, con alto nivel de subordinación.', 5);

    INSERT INTO niveles_cualificacion (codigo_nc, nivel_ocupacional_id) VALUES
     (0, 1), (1, 2), (2, 3), (3, 4), (4, 4), (6, 5);

    INSERT INTO criterios_ocupacionales (id, codigo, nombre, regla, orden) VALUES
     (1, 'ALTA_OFERTA_ALTA_DEMANDA',
         'Ocupaciones más solicitadas por los empresarios y personas que buscan empleo',
         'percentil_inscritos > 0.8 AND percentil_vacantes > 0.8', 1),
     (2, 'ALTA_OFERTA_BAJA_DEMANDA',
         'Ocupaciones más registradas por las personas que buscan empleo y menos solicitadas por los empresarios',
         'percentil_inscritos > 0.8 AND percentil_vacantes <= 0.8', 2),
     (3, 'BAJA_OFERTA_ALTA_DEMANDA',
         'Ocupaciones más solicitadas por los empresarios y menos registradas por las personas que buscan empleo',
         'percentil_vacantes > 0.8 AND percentil_inscritos <= 0.8', 3),
     (4, 'BAJA_OFERTA_BAJA_DEMANDA',
         'Ocupaciones menos solicitadas por los empresarios y personas que buscan empleo',
         'percentil_inscritos <= 0.8 AND percentil_vacantes <= 0.8', 4);

    INSERT INTO periodos (id, codigo, nombre, orden) VALUES
     (1, 'T1', 'Primer trimestre', 1), (2, 'T2', 'Segundo trimestre', 2),
     (3, 'T3', 'Tercer trimestre', 3), (4, 'T4', 'Cuarto trimestre', 4),
     (5, 'S1', 'Primer semestre', 5),  (6, 'S2', 'Segundo semestre', 6),
     (7, 'ANUAL', 'Anual', 7);

    -- ---------------------------------------------------------------------------
    -- Vista del buscador: lo único que consulta el repositorio público.
    -- ---------------------------------------------------------------------------

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

    -- ---------------------------------------------------------------------------
    -- Matriz año (2012..año actual) × periodo para el panel de Actualizaciones.
    -- estado_celda: pendiente | procesando | borrador | publicado | fallido
    -- ---------------------------------------------------------------------------

    CREATE VIEW v_estado_cargas_ocupacional AS
    WITH anios AS (
      SELECT generate_series(
               2012,
               GREATEST(EXTRACT(YEAR FROM now())::int,
                        COALESCE((SELECT MAX(anio) FROM cortes_ocupacionales), 2012))
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
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(`
    DROP VIEW IF EXISTS v_estado_cargas_ocupacional;
    DROP VIEW IF EXISTS v_buscador_ocupacional;
    DROP TABLE IF EXISTS indicadores_ocupacionales;
    DROP TABLE IF EXISTS cargas_datos_ocupacionales;
    DROP TABLE IF EXISTS cortes_ocupacionales;
    DROP TABLE IF EXISTS ocupaciones;
    DROP TABLE IF EXISTS periodos;
    DROP TABLE IF EXISTS criterios_ocupacionales;
    DROP TABLE IF EXISTS niveles_cualificacion;
    DROP TABLE IF EXISTS niveles_ocupacionales;
    DELETE FROM cargas_datos WHERE modulo = 'tendencia_ocupacional';
  `);
}

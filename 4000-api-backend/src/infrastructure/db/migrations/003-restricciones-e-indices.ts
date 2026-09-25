import { QueryInterface } from 'sequelize';

export const nombre = '003-restricciones-e-indices';

/**
 * Declara en el esquema las invariantes de `11-base-de-datos.md` §5 y crea los
 * índices de la bitácora (RF-07) y del buscador de contenidos (RF-10).
 *
 * Va después de las tablas nuevas a propósito: los datos existentes deben cumplir
 * una invariante antes de que se pueda declarar. Donde hoy no la cumplen, esta
 * migración los normaliza primero y explica qué hizo.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  // ── I1/I2 — el ciclo editorial ────────────────────────────────────────────
  // `aprobarPagina` marca la nueva versión como publicada pero nunca degradaba la
  // anterior, así que una página con dos aprobaciones tiene hoy dos versiones en
  // estado 'publicado'. Una versión reemplazada no es borrador ni rechazada: es
  // 'archivado', un estado nuevo del dominio.
  await sql.query(`
    ALTER TABLE paginas_versiones
      ADD CONSTRAINT ck_paginas_versiones_estado
      CHECK (estado IN ('borrador', 'en_revision', 'publicado', 'rechazado', 'archivado'))
      NOT VALID;
  `);

  // Archiva toda versión 'publicado' que no sea la viva. La viva es la que apunta
  // `paginas.version_publicada_id`; si ese puntero está vacío o es inconsistente,
  // se conserva la de mayor número de versión.
  await sql.query(`
    WITH viva AS (
      SELECT p.id AS pagina_id,
             COALESCE(
               (SELECT v.id FROM paginas_versiones v
                 WHERE v.id = p.version_publicada_id AND v.estado = 'publicado'),
               (SELECT v.id FROM paginas_versiones v
                 WHERE v.pagina_id = p.id AND v.estado = 'publicado'
                 ORDER BY v.numero_version DESC
                 LIMIT 1)
             ) AS version_id
      FROM paginas p
    )
    UPDATE paginas_versiones pv
       SET estado = 'archivado'
      FROM viva
     WHERE pv.pagina_id = viva.pagina_id
       AND pv.estado = 'publicado'
       AND pv.id IS DISTINCT FROM viva.version_id;
  `);

  // Lo mismo para las que quedaron encoladas en revisión: solo la más reciente
  // sigue en revisión, las anteriores vuelven a ser editables.
  await sql.query(`
    WITH ultima AS (
      SELECT pagina_id, MAX(numero_version) AS numero_version
        FROM paginas_versiones
       WHERE estado = 'en_revision'
       GROUP BY pagina_id
    )
    UPDATE paginas_versiones pv
       SET estado = 'borrador'
      FROM ultima
     WHERE pv.pagina_id = ultima.pagina_id
       AND pv.estado = 'en_revision'
       AND pv.numero_version < ultima.numero_version;
  `);

  await sql.query('ALTER TABLE paginas_versiones VALIDATE CONSTRAINT ck_paginas_versiones_estado;');

  // I1 — una página tiene como máximo una versión publicada.
  await sql.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_pagina_version_publicada
      ON paginas_versiones (pagina_id) WHERE estado = 'publicado';
  `);

  // I2 — y como máximo una en revisión (T-05.11).
  await sql.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_pagina_version_en_revision
      ON paginas_versiones (pagina_id) WHERE estado = 'en_revision';
  `);

  // I3 — no hay dos versiones con el mismo número. No se autocorrige: renumerar
  // rompería cualquier referencia externa, así que se detiene y avisa.
  await sql.query(`
    DO $$
    DECLARE duplicadas INTEGER;
    BEGIN
      SELECT count(*) INTO duplicadas FROM (
        SELECT pagina_id FROM paginas_versiones
         GROUP BY pagina_id, numero_version HAVING count(*) > 1
      ) d;
      IF duplicadas > 0 THEN
        RAISE EXCEPTION
          'Hay % pares (pagina_id, numero_version) duplicados. Resolverlos a mano antes de continuar.',
          duplicadas;
      END IF;
    END $$;
  `);

  await sql.query(`
    ALTER TABLE paginas_versiones
      ADD CONSTRAINT uq_paginas_versiones_numero UNIQUE (pagina_id, numero_version);
  `);

  // I4 — una versión rechazada siempre dice por qué. NOT VALID: las que ya estén
  // rechazadas sin motivo se conservan; la regla aplica de aquí en adelante.
  await sql.query(`
    ALTER TABLE paginas_versiones
      ADD CONSTRAINT ck_paginas_versiones_motivo
      CHECK (estado <> 'rechazado' OR motivo_rechazo IS NOT NULL)
      NOT VALID;
  `);

  await sql.query(`
    CREATE INDEX IF NOT EXISTS idx_paginas_versiones_estado
      ON paginas_versiones (estado, creado_en DESC);
  `);

  // ── I7 / I8 — una sola marca activa, una sola política vigente ────────────
  // Índice único sobre la propia condición: entre las filas indexadas el valor es
  // siempre el mismo, así que solo cabe una.
  await sql.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_marca_activa
      ON marca_versiones (activa) WHERE activa;
  `);

  await sql.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_politica_vigente
      ON politicas_privacidad ((vigente_hasta IS NULL)) WHERE vigente_hasta IS NULL;
  `);

  // ── T-10.2 — buscador interno (RF-10) ─────────────────────────────────────
  // Columna generada: se mantiene sola, no hay trigger que se pueda desincronizar.
  // El título pesa más que el resumen en el ranking.
  await sql.query(`
    ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS busqueda tsvector
      GENERATED ALWAYS AS (
        setweight(to_tsvector('spanish', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(excerpt, '')), 'B')
      ) STORED;
  `);

  await sql.query(`
    CREATE INDEX IF NOT EXISTS idx_post_busqueda ON "Post" USING GIN (busqueda);
  `);

  // ── T-07.12 — índices de la tabla de auditoría (RF-07) ────────────────────
  await sql.query(`
    CREATE INDEX IF NOT EXISTS idx_audit_contenido
      ON content_audit_logs (content_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_fecha
      ON content_audit_logs (created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_usuario
      ON content_audit_logs (user_id);
  `);

  // ── Índices de las tablas nuevas ──────────────────────────────────────────
  await sql.query(`
    CREATE INDEX IF NOT EXISTS idx_archivos_ambito ON archivos (ambito, estado);
    CREATE INDEX IF NOT EXISTS idx_contenidos_archivos_archivo ON contenidos_archivos (archivo_id);
    CREATE INDEX IF NOT EXISTS idx_consentimientos_titular ON consentimientos (titular_identificador);
    CREATE INDEX IF NOT EXISTS idx_consentimientos_fecha ON consentimientos (aceptado_en DESC);
    CREATE INDEX IF NOT EXISTS idx_respaldos_estado ON respaldos (estado, iniciado_en DESC);
    CREATE INDEX IF NOT EXISTS idx_respaldos_retencion ON respaldos (retencion_hasta);
    CREATE INDEX IF NOT EXISTS idx_auditoria_accesos_recurso
      ON auditoria_accesos (recurso_tipo, recurso_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_auditoria_accesos_usuario
      ON auditoria_accesos (usuario_id, created_at DESC);
  `);

  // El índice de no leídas solo cubre las no leídas: es el 99% de las consultas
  // y mantiene el índice pequeño aunque la tabla crezca.
  await sql.query(`
    CREATE INDEX IF NOT EXISTS idx_notificaciones_pendientes
      ON notificaciones (destinatario_id, created_at DESC) WHERE leida_en IS NULL;
  `);

  // ── Índices redundantes ───────────────────────────────────────────────────
  // Un UNIQUE ya crea su índice; declarar además uno normal sobre la misma columna
  // duplica el coste de escritura sin acelerar ninguna lectura. Se detectan por
  // estructura y no por nombre, porque los nombres los generó Sequelize.
  await sql.query(`
    DO $$
    DECLARE indice RECORD;
    BEGIN
      FOR indice IN
        SELECT i.indexrelid::regclass AS nombre
          FROM pg_index i
         WHERE NOT i.indisunique
           AND i.indrelid IN (
                 SELECT oid FROM pg_class
                  WHERE relname IN ('users', 'Post', 'paginas', 'usuarios_sitio')
                    AND relnamespace = 'public'::regnamespace
               )
           AND EXISTS (
                 SELECT 1 FROM pg_index u
                  WHERE u.indrelid = i.indrelid
                    AND u.indisunique
                    AND u.indkey::text = i.indkey::text
               )
      LOOP
        RAISE NOTICE 'Índice redundante eliminado: %', indice.nombre;
        EXECUTE format('DROP INDEX IF EXISTS %s', indice.nombre);
      END LOOP;
    END $$;
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  await sql.query(`
    DROP INDEX IF EXISTS
      uq_pagina_version_publicada, uq_pagina_version_en_revision,
      idx_paginas_versiones_estado, uq_marca_activa, uq_politica_vigente,
      idx_post_busqueda, idx_audit_contenido, idx_audit_fecha, idx_audit_usuario,
      idx_archivos_ambito, idx_contenidos_archivos_archivo,
      idx_consentimientos_titular, idx_consentimientos_fecha,
      idx_respaldos_estado, idx_respaldos_retencion,
      idx_auditoria_accesos_recurso, idx_auditoria_accesos_usuario,
      idx_notificaciones_pendientes;
  `);

  await sql.query(`
    ALTER TABLE paginas_versiones
      DROP CONSTRAINT IF EXISTS uq_paginas_versiones_numero,
      DROP CONSTRAINT IF EXISTS ck_paginas_versiones_motivo,
      DROP CONSTRAINT IF EXISTS ck_paginas_versiones_estado;
  `);

  await sql.query('ALTER TABLE "Post" DROP COLUMN IF EXISTS busqueda;');

  // Los estados normalizados a 'archivado' no se revierten: no hay forma de saber
  // cuáles estaban publicados por error y cuáles no.
}

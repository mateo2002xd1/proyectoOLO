import { QueryInterface } from 'sequelize';

export const nombre = '004-contenidos-secciones-archivos';

/**
 * Fase 4, primera parte: las tres tablas heredadas dejan de tener nombre entre
 * comillas y columnas en camelCase.
 *
 * Los identificadores **ya son UUID** en la base real, pese a que los modelos los
 * declaraban `DataTypes.TEXT`. Por eso aquí no se convierte ningún tipo: no hace
 * falta, y un `!~*` sobre una columna uuid ni siquiera es un operador válido.
 *
 * El contrato de la API no cambia. Los modelos Sequelize conservan sus nombres de
 * atributo (`title`, `sectionId`, `publishedAt`) y solo declaran a qué columna
 * apuntan, así que ningún frontend se entera de este renombre.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  // La FK de los adjuntos heredados estorba al renombrar y no se vuelve a declarar:
  // `"Attachment"` queda obsoleta al final de esta migración.
  await sql.query(`
    ALTER TABLE "Attachment" DROP CONSTRAINT IF EXISTS "Attachment_postId_fkey";
  `);

  // ── secciones ─────────────────────────────────────────────────────────────
  await sql.query(`
    ALTER TABLE "Section" RENAME TO secciones;
    ALTER TABLE secciones RENAME COLUMN name TO nombre;
    ALTER TABLE secciones RENAME COLUMN description TO descripcion;
    ALTER TABLE secciones RENAME COLUMN "createdAt" TO created_at;
    ALTER TABLE secciones RENAME COLUMN "updatedAt" TO updated_at;
    ALTER TABLE secciones ALTER COLUMN id SET DEFAULT gen_random_uuid();
  `);

  // El árbol de navegación de RF-11. `nivel` arranca en 1 porque hoy todas las
  // secciones son raíz; el caso de uso lo mantiene al mover una sección.
  await sql.query(`
    ALTER TABLE secciones
      ADD COLUMN IF NOT EXISTS padre_id UUID REFERENCES secciones(id) ON DELETE RESTRICT,
      ADD COLUMN IF NOT EXISTS orden SMALLINT NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS nivel SMALLINT NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS visible_en_menu BOOLEAN NOT NULL DEFAULT true;
  `);

  await sql.query(`
    ALTER TABLE secciones
      ADD CONSTRAINT ck_secciones_nivel CHECK (nivel BETWEEN 1 AND 3),
      ADD CONSTRAINT ck_secciones_padre CHECK (padre_id IS NULL OR padre_id <> id);
  `);

  // ── contenidos ────────────────────────────────────────────────────────────
  await sql.query(`
    ALTER TABLE "Post" RENAME TO contenidos;
    ALTER TABLE contenidos RENAME COLUMN title TO titulo;
    ALTER TABLE contenidos RENAME COLUMN excerpt TO resumen;
    ALTER TABLE contenidos RENAME COLUMN content TO cuerpo;
    ALTER TABLE contenidos RENAME COLUMN "sectionId" TO seccion_id;
    ALTER TABLE contenidos RENAME COLUMN "authorId" TO autor_id;
    ALTER TABLE contenidos RENAME COLUMN "publishedAt" TO publicado_en;
    ALTER TABLE contenidos RENAME COLUMN "createdAt" TO created_at;
    ALTER TABLE contenidos RENAME COLUMN "updatedAt" TO updated_at;
  `);

  await sql.query('ALTER TABLE contenidos ALTER COLUMN id SET DEFAULT gen_random_uuid();');

  // Estado y tipo del diseño §4.2. `tipo` queda nulo en lo ya cargado: inventar el
  // tipo de un contenido existente sería fabricar un dato que nadie verificó.
  await sql.query(`
    ALTER TABLE contenidos
      ADD COLUMN IF NOT EXISTS tipo TEXT,
      ADD COLUMN IF NOT EXISTS estado TEXT NOT NULL DEFAULT 'borrador',
      ADD COLUMN IF NOT EXISTS motivo_rechazo TEXT,
      ADD COLUMN IF NOT EXISTS revisado_por UUID REFERENCES users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS revisado_en TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS destacado BOOLEAN NOT NULL DEFAULT false;
  `);

  // El estado se deriva del dato que ya existe, no se inventa: lo que tiene fecha
  // de publicación estaba publicado.
  await sql.query(`
    UPDATE contenidos SET estado = 'publicado' WHERE publicado_en IS NOT NULL;
  `);

  await sql.query(`
    ALTER TABLE contenidos
      ADD CONSTRAINT ck_contenidos_tipo
        CHECK (tipo IS NULL OR tipo IN ('estudio', 'informe', 'estadistica', 'banner', 'noticia')),
      ADD CONSTRAINT ck_contenidos_estado
        CHECK (estado IN ('borrador', 'en_revision', 'publicado', 'rechazado', 'archivado')),
      ADD CONSTRAINT ck_contenidos_publicado
        CHECK (estado <> 'publicado' OR publicado_en IS NOT NULL);
  `);

  // La FK a secciones ya existe desde el esquema original y sobrevive al renombre;
  // solo falta la de autoría, que nunca se declaró.
  await sql.query(`
    ALTER TABLE contenidos
      ADD CONSTRAINT fk_contenidos_autor
        FOREIGN KEY (autor_id) REFERENCES users(id) ON DELETE SET NULL;
  `);

  await sql.query(`
    CREATE INDEX IF NOT EXISTS idx_contenidos_seccion ON contenidos (seccion_id);
    CREATE INDEX IF NOT EXISTS idx_contenidos_tipo ON contenidos (tipo);
    CREATE INDEX IF NOT EXISTS idx_contenidos_estado ON contenidos (estado, publicado_en DESC);
  `);

  // ── archivos: los adjuntos heredados pasan al modelo nuevo ────────────────
  // Los archivos ya cargados no tienen hash: nadie los leyó del disco al subirlos.
  // En vez de inventarlo, la unicidad pasa a ser parcial y solo aplica a los que sí
  // lo traen, que son todos los que suba el `shared/storage` de RF-02.
  await sql.query(`
    ALTER TABLE archivos ALTER COLUMN hash_sha256 DROP NOT NULL;
    ALTER TABLE archivos DROP CONSTRAINT IF EXISTS archivos_hash_sha256_key;
    CREATE UNIQUE INDEX IF NOT EXISTS uq_archivos_hash
      ON archivos (hash_sha256) WHERE hash_sha256 IS NOT NULL;
  `);

  // `contenidos_archivos.contenido_id` ya apunta a la tabla renombrada: en Postgres
  // una clave foránea sigue a su tabla cuando esta cambia de nombre.

  // `nombre_almacenado` se compone con el id, no con el nombre que subió el usuario:
  // es único por construcción y no arrastra el nombre original al sistema de
  // archivos (S1). El nombre original se conserva para que la descarga sea legible.
  await sql.query(`
    INSERT INTO archivos (
      id, nombre_original, nombre_almacenado, ruta_relativa, mime_type,
      extension, tamano_bytes, ambito, estado, created_at, updated_at
    )
    SELECT a.id,
           a."fileName",
           a.id::text || COALESCE(substring(a."fileName" from '(\\.[^.]+)$'), ''),
           a."filePath",
           a."mimeType",
           substring(a."fileName" from '\\.([^.]+)$'),
           GREATEST(a."sizeBytes", 1),
           'publico',
           'disponible',
           a."createdAt",
           a."updatedAt"
      FROM "Attachment" a
     WHERE a."postId" IN (SELECT id FROM contenidos)
    ON CONFLICT (id) DO NOTHING;
  `);

  await sql.query(`
    INSERT INTO contenidos_archivos (contenido_id, archivo_id, orden, rol, created_at)
    SELECT a."postId", a.id, 0, 'adjunto', a."createdAt"
      FROM "Attachment" a
     WHERE a."postId" IN (SELECT id FROM contenidos)
    ON CONFLICT (contenido_id, archivo_id) DO NOTHING;
  `);

  // La tabla vieja no se borra en el mismo paso que se crea la nueva (regla 5 de
  // 4-reglas.md). Se aparta del camino y se elimina cuando la nueva esté verificada.
  await sql.query('ALTER TABLE "Attachment" RENAME TO _obsoleto_attachment;');
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  await sql.query('ALTER TABLE _obsoleto_attachment RENAME TO "Attachment";');
  await sql.query('DELETE FROM contenidos_archivos;');
  await sql.query('DELETE FROM archivos;');

  await sql.query(`
    ALTER TABLE contenidos_archivos DROP CONSTRAINT IF EXISTS fk_contenidos_archivos_contenido;
    ALTER TABLE contenidos_archivos ALTER COLUMN contenido_id TYPE TEXT USING contenido_id::text;
    DROP INDEX IF EXISTS uq_archivos_hash;
    ALTER TABLE archivos ALTER COLUMN hash_sha256 SET NOT NULL;
  `);

  await sql.query(`
    DROP INDEX IF EXISTS idx_contenidos_seccion, idx_contenidos_tipo, idx_contenidos_estado;
    ALTER TABLE contenidos
      DROP CONSTRAINT IF EXISTS fk_contenidos_seccion,
      DROP CONSTRAINT IF EXISTS fk_contenidos_autor,
      DROP CONSTRAINT IF EXISTS ck_contenidos_tipo,
      DROP CONSTRAINT IF EXISTS ck_contenidos_estado,
      DROP CONSTRAINT IF EXISTS ck_contenidos_publicado,
      DROP COLUMN IF EXISTS tipo,
      DROP COLUMN IF EXISTS estado,
      DROP COLUMN IF EXISTS motivo_rechazo,
      DROP COLUMN IF EXISTS revisado_por,
      DROP COLUMN IF EXISTS revisado_en,
      DROP COLUMN IF EXISTS destacado;
  `);

  await sql.query(`
    ALTER TABLE contenidos ALTER COLUMN id DROP DEFAULT;
    ALTER TABLE contenidos ALTER COLUMN id TYPE TEXT USING id::text;
    ALTER TABLE contenidos ALTER COLUMN seccion_id TYPE TEXT USING seccion_id::text;
    ALTER TABLE contenidos ALTER COLUMN autor_id TYPE TEXT USING autor_id::text;
    ALTER TABLE contenidos RENAME COLUMN titulo TO title;
    ALTER TABLE contenidos RENAME COLUMN resumen TO excerpt;
    ALTER TABLE contenidos RENAME COLUMN cuerpo TO content;
    ALTER TABLE contenidos RENAME COLUMN seccion_id TO "sectionId";
    ALTER TABLE contenidos RENAME COLUMN autor_id TO "authorId";
    ALTER TABLE contenidos RENAME COLUMN publicado_en TO "publishedAt";
    ALTER TABLE contenidos RENAME COLUMN created_at TO "createdAt";
    ALTER TABLE contenidos RENAME COLUMN updated_at TO "updatedAt";
    ALTER TABLE contenidos RENAME TO "Post";
  `);

  await sql.query(`
    ALTER TABLE secciones
      DROP CONSTRAINT IF EXISTS ck_secciones_nivel,
      DROP CONSTRAINT IF EXISTS ck_secciones_padre,
      DROP COLUMN IF EXISTS padre_id,
      DROP COLUMN IF EXISTS orden,
      DROP COLUMN IF EXISTS nivel,
      DROP COLUMN IF EXISTS visible_en_menu;
    ALTER TABLE secciones ALTER COLUMN id DROP DEFAULT;
    ALTER TABLE secciones ALTER COLUMN id TYPE TEXT USING id::text;
    ALTER TABLE secciones RENAME COLUMN nombre TO name;
    ALTER TABLE secciones RENAME COLUMN descripcion TO description;
    ALTER TABLE secciones RENAME COLUMN created_at TO "createdAt";
    ALTER TABLE secciones RENAME COLUMN updated_at TO "updatedAt";
    ALTER TABLE secciones RENAME TO "Section";
  `);

  await sql.query(`
    ALTER TABLE "Post"
      ADD CONSTRAINT "Post_sectionId_fkey"
      FOREIGN KEY ("sectionId") REFERENCES "Section"(id) ON DELETE CASCADE;
  `);
}

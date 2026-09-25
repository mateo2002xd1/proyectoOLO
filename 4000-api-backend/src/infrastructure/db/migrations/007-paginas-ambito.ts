import { QueryInterface } from 'sequelize';

export const nombre = '007-paginas-ambito';

/**
 * Fase 4, última parte. Cierra dos huecos del modelo de páginas:
 *
 * 1. El sitio y la intranet comparten la tabla `paginas` pero el slug era único a
 *    secas, así que una página `/inicio` en la intranet chocaba con la del sitio.
 * 2. Se registraba quién revisó y quién publicó una versión, pero no quién la
 *    escribió — un hueco directo en RF-07.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  await sql.query(`
    ALTER TABLE paginas
      ADD COLUMN IF NOT EXISTS ambito TEXT NOT NULL DEFAULT 'sitio';
  `);

  await sql.query(`
    ALTER TABLE paginas
      ADD CONSTRAINT ck_paginas_ambito CHECK (ambito IN ('sitio', 'intranet'));
  `);

  // El slug deja de ser único por sí solo y pasa a serlo dentro de su aplicación.
  await sql.query(`
    ALTER TABLE paginas DROP CONSTRAINT IF EXISTS paginas_slug_key;
    CREATE UNIQUE INDEX IF NOT EXISTS uq_paginas_ambito_slug ON paginas (ambito, slug);
  `);

  await sql.query(`
    ALTER TABLE paginas_versiones
      ADD COLUMN IF NOT EXISTS creado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS revisado_en TIMESTAMPTZ;
  `);

  // La autoría que sí se conoce: quien publicó una versión la tenía en revisión, y
  // antes de eso la escribió. Es una aproximación, no un dato inventado — para las
  // versiones anteriores a esta migración no hay forma de saberlo con certeza.
  await sql.query(`
    UPDATE paginas_versiones pv
       SET creado_por = p.creado_por
      FROM paginas p
     WHERE p.id = pv.pagina_id
       AND pv.creado_por IS NULL;
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  await sql.query(`
    ALTER TABLE paginas_versiones
      DROP COLUMN IF EXISTS creado_por,
      DROP COLUMN IF EXISTS revisado_en;
  `);

  await sql.query(`
    DROP INDEX IF EXISTS uq_paginas_ambito_slug;
    ALTER TABLE paginas
      DROP CONSTRAINT IF EXISTS ck_paginas_ambito,
      DROP COLUMN IF EXISTS ambito;
    ALTER TABLE paginas ADD CONSTRAINT paginas_slug_key UNIQUE (slug);
  `);
}

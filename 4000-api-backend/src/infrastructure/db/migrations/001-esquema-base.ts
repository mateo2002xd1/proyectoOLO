import { QueryInterface } from 'sequelize';

export const nombre = '001-esquema-base';

/**
 * Línea base del esquema: deja constancia versionada de lo que hasta ahora creaba
 * `sequelize.sync()` en el arranque. Todo es `IF NOT EXISTS`, así que sobre una base
 * existente es un no-op y sobre una base nueva reproduce el mismo punto de partida.
 *
 * Los nombres son los actuales (`users`, `"Post"`, `"Section"`...), no los del diseño
 * de `11-base-de-datos.md` §4. La unificación de nombres es una migración posterior
 * que va acompañada del cambio de los modelos Sequelize; separarlas es lo que permite
 * que esta sea de riesgo cero.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  await sql.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

  await sql.query(`
    CREATE TABLE IF NOT EXISTS roles (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS permissions (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name       TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
      PRIMARY KEY (role_id, permission_id)
    );
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS users (
      id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name                          TEXT NOT NULL,
      email                         TEXT NOT NULL UNIQUE,
      password_hash                 TEXT,
      role_id                       UUID NOT NULL REFERENCES roles(id),
      status                        TEXT NOT NULL DEFAULT 'active',
      expiration_date               TIMESTAMPTZ,
      last_access_at                TIMESTAMPTZ,
      must_setup_security_questions BOOLEAN NOT NULL DEFAULT true,
      must_change_password          BOOLEAN NOT NULL DEFAULT false,
      failed_security_attempts      INTEGER NOT NULL DEFAULT 0,
      locked_until                  TIMESTAMPTZ,
      created_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at                    TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS security_questions (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      question_key TEXT NOT NULL,
      answer_hash  TEXT NOT NULL,
      sort_order   INTEGER NOT NULL DEFAULT 0,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT uq_security_questions_user_key UNIQUE (user_id, question_key)
    );
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS usuarios_sitio (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      status        TEXT NOT NULL DEFAULT 'active',
      created_by    UUID REFERENCES users(id),
      last_login_at TIMESTAMPTZ,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS paginas (
      id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug                 VARCHAR(255) NOT NULL UNIQUE,
      titulo               VARCHAR(255) NOT NULL,
      version_publicada_id UUID,
      creado_por           UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS paginas_versiones (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      pagina_id      UUID NOT NULL REFERENCES paginas(id) ON DELETE CASCADE,
      contenido      JSONB NOT NULL,
      layout         JSONB,
      numero_version INTEGER NOT NULL,
      estado         VARCHAR(20) NOT NULL DEFAULT 'borrador',
      motivo_rechazo TEXT,
      revisor_id     UUID REFERENCES users(id) ON DELETE SET NULL,
      publicado_por  UUID REFERENCES users(id) ON DELETE SET NULL,
      publicado_en   TIMESTAMPTZ,
      creado_en      TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // FK circular: una página apunta a su versión publicada y la versión apunta a la
  // página. DEFERRABLE permite insertar el par dentro de una misma transacción.
  await sql.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_paginas_version_publicada'
      ) THEN
        ALTER TABLE paginas
          ADD CONSTRAINT fk_paginas_version_publicada
          FOREIGN KEY (version_publicada_id) REFERENCES paginas_versiones(id)
          ON DELETE SET NULL
          DEFERRABLE INITIALLY DEFERRED;
      END IF;
    END $$;
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS content_audit_logs (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      content_id       UUID NOT NULL,
      content_type     TEXT NOT NULL DEFAULT 'post',
      user_id          UUID REFERENCES users(id) ON DELETE SET NULL,
      user_name        TEXT,
      action_type      TEXT NOT NULL,
      modified_fields  JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // Tablas heredadas con identificadores entre comillas y columnas en camelCase.
  // Se renombran en la migración de unificación, no aquí.
  // Los identificadores son UUID, no TEXT: es lo que hay en la base real, aunque los
  // modelos Sequelize los declaraban `DataTypes.TEXT`. La línea base documenta el
  // esquema que existe, no el que decía el modelo.
  await sql.query(`
    CREATE TABLE IF NOT EXISTS "Section" (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        TEXT NOT NULL UNIQUE,
      slug        TEXT NOT NULL UNIQUE,
      description TEXT,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS "Post" (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title         TEXT NOT NULL,
      slug          TEXT NOT NULL UNIQUE,
      excerpt       TEXT,
      content       TEXT NOT NULL,
      "sectionId"   UUID NOT NULL REFERENCES "Section"(id) ON DELETE CASCADE,
      "authorId"    UUID,
      "publishedAt" TIMESTAMPTZ,
      "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
      "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS "Attachment" (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "postId"    UUID NOT NULL REFERENCES "Post"(id) ON DELETE CASCADE,
      "fileName"  TEXT NOT NULL,
      "filePath"  TEXT NOT NULL,
      "mimeType"  TEXT NOT NULL,
      "sizeBytes" INTEGER NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // Bases creadas con el `script.sql` anterior tienen `creado_por NOT NULL`, que
  // impide borrar un usuario sin borrar sus páginas. El arranque del servidor lo
  // corregía con un ALTER suelto en cada boot; su sitio es aquí.
  await sql.query('ALTER TABLE paginas ALTER COLUMN creado_por DROP NOT NULL;');
}

/**
 * Sin reverso. Revertir la línea base es borrar la base entera; si eso es lo que se
 * quiere, se hace con `DROP DATABASE`, no con una migración que puede ejecutarse por
 * error contra producción.
 */
export async function down(): Promise<void> {
  throw new Error(
    '001-esquema-base no se revierte: es la línea base del esquema. ' +
      'Para empezar de cero, recrear la base de datos.'
  );
}

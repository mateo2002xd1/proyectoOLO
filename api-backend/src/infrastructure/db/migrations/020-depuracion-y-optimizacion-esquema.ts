import { QueryInterface } from 'sequelize';

export const nombre = '020-depuracion-y-optimizacion-esquema';

/**
 * Script consolidado de depuración y optimización de base de datos.
 * Según el informe técnico, limpia el esquema eliminando las tablas
 * que no tienen uso en el código, purga índices redundantes y
 * resuelve conflictos de constraints que dejó el antiguo sync.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  await sql.query(`
    -- 1. Eliminar tabla huérfana y tablas inactivas
    DROP TABLE IF EXISTS "FileStatuses", "consentimientos", "politicas_privacidad", 
    "tableros_bi", "marca_versiones", "configuraciones", "auditoria_accesos", 
    "respaldos", "notificaciones" CASCADE;
    
    -- 2. Resolver conflicto de estados en usuarios
    ALTER TABLE "usuarios" DROP CONSTRAINT IF EXISTS "users_status_check";
    
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_usuarios_estado') THEN
        ALTER TABLE "usuarios" VALIDATE CONSTRAINT "ck_usuarios_estado";
      END IF;
    END $$;

    -- 3. Eliminar Foreign Key duplicada en contenidos
    ALTER TABLE "contenidos" DROP CONSTRAINT IF EXISTS "Post_authorId_fkey";

    -- 4. Eliminar restricción UNIQUE duplicada en preguntas_seguridad
    ALTER TABLE "preguntas_seguridad" DROP CONSTRAINT IF EXISTS "security_questions_user_id_question_key_key";

    -- 5. Eliminar índices duplicados y redundantes
    DROP INDEX IF EXISTS idx_post_section_id, post_section_id, post_author_id, 
    users_role_id, idx_audit_created_at, idx_audit_user_id, idx_audit_content_id, idx_rp_role_id;

    -- 6. Validar invariante de motivo de rechazo
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_paginas_versiones_motivo') THEN
        ALTER TABLE "paginas_versiones" VALIDATE CONSTRAINT ck_paginas_versiones_motivo;
      END IF;
    END $$;
  `);

  try {
    await sql.query(`VACUUM ANALYZE;`);
  } catch (error) {
    console.warn('[migraciones] No se pudo ejecutar VACUUM ANALYZE:', (error as Error).message);
  }
}

/**
 * No se revierte.
 * Restaurar tablas vacías, índices redundantes o restricciones duplicadas 
 * no aporta ningún valor al sistema.
 */
export async function down(): Promise<void> {
  // Intencionalmente vacío.
}

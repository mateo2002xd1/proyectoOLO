import { QueryInterface } from 'sequelize';

export const nombre = '006-auditoria-unificada';

/**
 * Fase 4, tercera parte: `content_audit_logs` pasa a `auditoria_cambios` y deja de
 * hablar solo de contenidos — RF-07 exige historial de cualquier entidad.
 *
 * Aquí sí se traducen los valores además de los nombres, cosa que las migraciones
 * anteriores evitaron: ningún frontend consume estos campos todavía (la vista de
 * detalle de RF-07 está pendiente), así que no hay contrato que respetar.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  await sql.query(`
    ALTER TABLE content_audit_logs RENAME TO auditoria_cambios;
    ALTER TABLE auditoria_cambios RENAME COLUMN content_id TO entidad_id;
    ALTER TABLE auditoria_cambios RENAME COLUMN content_type TO entidad_tipo;
    ALTER TABLE auditoria_cambios RENAME COLUMN action_type TO accion;
    ALTER TABLE auditoria_cambios RENAME COLUMN user_id TO usuario_id;
    ALTER TABLE auditoria_cambios RENAME COLUMN user_name TO usuario_nombre;
    ALTER TABLE auditoria_cambios RENAME COLUMN modified_fields TO campos_modificados;
  `);

  // `updated_at` no tiene sentido en una bitácora: una entrada de auditoría que se
  // puede modificar no sirve como evidencia.
  await sql.query('ALTER TABLE auditoria_cambios DROP COLUMN IF EXISTS updated_at;');

  await sql.query(`
    ALTER TABLE auditoria_cambios
      ADD COLUMN IF NOT EXISTS ip INET,
      ADD COLUMN IF NOT EXISTS user_agent TEXT;
  `);

  // 'post' y 'contenido' eran el mismo concepto con dos nombres, herencia del
  // renombre del modelo que nunca llegó a los datos.
  await sql.query(`
    UPDATE auditoria_cambios
       SET entidad_tipo = CASE lower(entidad_tipo)
             WHEN 'post'    THEN 'contenido'
             WHEN 'section' THEN 'seccion'
             WHEN 'user'    THEN 'usuario'
             WHEN 'page'    THEN 'pagina'
             ELSE lower(entidad_tipo)
           END;
  `);

  await sql.query(`
    UPDATE auditoria_cambios
       SET accion = CASE lower(accion)
             WHEN 'create'    THEN 'crear'
             WHEN 'update'    THEN 'actualizar'
             WHEN 'delete'    THEN 'eliminar'
             WHEN 'publish'   THEN 'publicar'
             WHEN 'unpublish' THEN 'despublicar'
             WHEN 'approve'   THEN 'aprobar'
             WHEN 'reject'    THEN 'rechazar'
             WHEN 'submit'    THEN 'enviar_revision'
             ELSE lower(accion)
           END;
  `);

  await sql.query(`
    ALTER TABLE auditoria_cambios
      ADD CONSTRAINT ck_auditoria_entidad
        CHECK (entidad_tipo IN
          ('contenido', 'pagina', 'seccion', 'usuario', 'rol', 'marca', 'configuracion', 'archivo')),
      ADD CONSTRAINT ck_auditoria_accion
        CHECK (accion IN
          ('crear', 'actualizar', 'eliminar', 'publicar', 'despublicar',
           'aprobar', 'rechazar', 'enviar_revision'));
  `);

  // Los índices de T-07.12 se crearon en 003 con el nombre viejo; Postgres los
  // conserva al renombrar la tabla, pero el nombre deja de describir lo que indexa.
  await sql.query(`
    ALTER INDEX IF EXISTS idx_audit_contenido RENAME TO idx_auditoria_entidad;
    ALTER INDEX IF EXISTS idx_audit_fecha RENAME TO idx_auditoria_fecha;
    ALTER INDEX IF EXISTS idx_audit_usuario RENAME TO idx_auditoria_usuario;
  `);

  // El índice de T-07.12 debe cubrir el par completo: el mismo id puede existir en
  // dos tipos de entidad distintos.
  await sql.query(`
    DROP INDEX IF EXISTS idx_auditoria_entidad;
    CREATE INDEX IF NOT EXISTS idx_auditoria_entidad
      ON auditoria_cambios (entidad_tipo, entidad_id, created_at DESC);
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  await sql.query(`
    DROP INDEX IF EXISTS idx_auditoria_entidad;
    ALTER INDEX IF EXISTS idx_auditoria_fecha RENAME TO idx_audit_fecha;
    ALTER INDEX IF EXISTS idx_auditoria_usuario RENAME TO idx_audit_usuario;
  `);

  await sql.query(`
    ALTER TABLE auditoria_cambios
      DROP CONSTRAINT IF EXISTS ck_auditoria_entidad,
      DROP CONSTRAINT IF EXISTS ck_auditoria_accion,
      DROP COLUMN IF EXISTS ip,
      DROP COLUMN IF EXISTS user_agent,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
  `);

  await sql.query(`
    UPDATE auditoria_cambios
       SET entidad_tipo = CASE entidad_tipo WHEN 'contenido' THEN 'post' ELSE entidad_tipo END,
           accion = CASE accion
             WHEN 'crear' THEN 'create'
             WHEN 'actualizar' THEN 'update'
             WHEN 'eliminar' THEN 'delete'
             ELSE accion
           END;
  `);

  await sql.query(`
    ALTER TABLE auditoria_cambios RENAME COLUMN campos_modificados TO modified_fields;
    ALTER TABLE auditoria_cambios RENAME COLUMN usuario_nombre TO user_name;
    ALTER TABLE auditoria_cambios RENAME COLUMN usuario_id TO user_id;
    ALTER TABLE auditoria_cambios RENAME COLUMN accion TO action_type;
    ALTER TABLE auditoria_cambios RENAME COLUMN entidad_tipo TO content_type;
    ALTER TABLE auditoria_cambios RENAME COLUMN entidad_id TO content_id;
    ALTER TABLE auditoria_cambios RENAME TO content_audit_logs;
    CREATE INDEX IF NOT EXISTS idx_audit_contenido
      ON content_audit_logs (content_id, created_at DESC);
  `);
}

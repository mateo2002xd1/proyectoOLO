import { QueryInterface } from 'sequelize';

export const nombre = '005-identidad';

/**
 * Fase 4, segunda parte: las tablas de identidad y RBAC pasan a la convención del
 * proyecto y se les añade lo que el diseño exige — `es_sistema` en los roles,
 * `creado_por` en los usuarios y los permisos de acceso por aplicación (§2.1).
 *
 * `usuarios_sitio` NO se fusiona aquí. Tiene su propio flujo de login con otro
 * secreto JWT, así que unificarla es un cambio de autenticación y no de nombres;
 * su sitio es E-16, junto con la caducidad de cuentas.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  // El correo pasa a ser único sin distinguir mayúsculas. Si ya hay dos cuentas que
  // solo difieren en eso, hay que decidir cuál sobrevive: no lo decide una migración.
  await sql.query(`
    DO $$
    DECLARE colisiones INTEGER;
    BEGIN
      SELECT count(*) INTO colisiones FROM (
        SELECT lower(email) FROM users GROUP BY lower(email) HAVING count(*) > 1
      ) c;
      IF colisiones > 0 THEN
        RAISE EXCEPTION
          'Hay % correos que solo difieren en mayúsculas. Unificarlos antes de continuar.',
          colisiones;
      END IF;
    END $$;
  `);

  // ── usuarios ──────────────────────────────────────────────────────────────
  await sql.query(`
    ALTER TABLE users RENAME TO usuarios;
    ALTER TABLE usuarios RENAME COLUMN name TO nombre;
    ALTER TABLE usuarios RENAME COLUMN role_id TO rol_id;
    ALTER TABLE usuarios RENAME COLUMN status TO estado;
    ALTER TABLE usuarios RENAME COLUMN expiration_date TO fecha_caducidad;
    ALTER TABLE usuarios RENAME COLUMN last_access_at TO ultimo_acceso_en;
    ALTER TABLE usuarios RENAME COLUMN must_setup_security_questions TO debe_configurar_preguntas;
    ALTER TABLE usuarios RENAME COLUMN must_change_password TO debe_cambiar_password;
    ALTER TABLE usuarios RENAME COLUMN failed_security_attempts TO intentos_fallidos;
    ALTER TABLE usuarios RENAME COLUMN locked_until TO bloqueado_hasta;
  `);

  await sql.query(`
    ALTER TABLE usuarios
      ADD COLUMN IF NOT EXISTS creado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL;
  `);

  // La columna se llama `estado`, pero sus valores siguen en inglés: el panel de
  // usuarios los compara y los escribe tal cual
  // (`sitio-web/.../usuarios-view.tsx`). Traducirlos sería cambiar el contrato de la
  // API, que es justo lo que esta fase no hace.
  await sql.query(`
    ALTER TABLE usuarios ADD CONSTRAINT ck_usuarios_estado
      CHECK (estado IN ('active', 'inactive', 'locked', 'expired'))
      NOT VALID;
  `);

  // El índice único sobre `lower(email)` sustituye al UNIQUE de la columna: la
  // normalización a minúsculas que ya hace el repositorio queda garantizada.
  await sql.query(`
    ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS users_email_key;
    CREATE UNIQUE INDEX IF NOT EXISTS uq_usuarios_email ON usuarios (lower(email));
  `);

  // ── roles ─────────────────────────────────────────────────────────────────
  await sql.query(`
    ALTER TABLE roles RENAME COLUMN name TO nombre;
    ALTER TABLE roles RENAME COLUMN description TO descripcion;
    ALTER TABLE roles ADD COLUMN IF NOT EXISTS es_sistema BOOLEAN NOT NULL DEFAULT false;
  `);

  // Los roles del dominio no se borran desde el panel: sin ellos no hay gobernanza.
  await sql.query(`
    UPDATE roles SET es_sistema = true
     WHERE lower(nombre) IN
       ('superadmin', 'administrador', 'editor', 'director', 'subdirector', 'visitante_interno');
  `);

  // ── permisos ──────────────────────────────────────────────────────────────
  // `clave` y no `nombre`: es el identificador que compara el código, no una etiqueta.
  await sql.query(`
    ALTER TABLE permissions RENAME TO permisos;
    ALTER TABLE permisos RENAME COLUMN name TO clave;
    ALTER TABLE role_permissions RENAME TO roles_permisos;
    ALTER TABLE roles_permisos RENAME COLUMN role_id TO rol_id;
    ALTER TABLE roles_permisos RENAME COLUMN permission_id TO permiso_id;
  `);

  // ── preguntas de seguridad ────────────────────────────────────────────────
  await sql.query(`
    ALTER TABLE security_questions RENAME TO preguntas_seguridad;
    ALTER TABLE preguntas_seguridad RENAME COLUMN user_id TO usuario_id;
    ALTER TABLE preguntas_seguridad RENAME COLUMN question_key TO pregunta_clave;
    ALTER TABLE preguntas_seguridad RENAME COLUMN answer_hash TO respuesta_hash;
    ALTER TABLE preguntas_seguridad RENAME COLUMN sort_order TO orden;
  `);

  // ── Quién entra a qué aplicación (§2.1) ───────────────────────────────────
  // El acceso al sitio y a la intranet es autorización, no una columna en `usuarios`:
  // así el administrador lo compone desde el panel sin tocar código, que es RF-04.
  await sql.query(`
    INSERT INTO roles_permisos (rol_id, permiso_id)
    SELECT r.id, p.id
      FROM roles r
      JOIN permisos p ON p.clave = 'acceso.sitio'
     WHERE lower(r.nombre) IN ('superadmin', 'administrador', 'editor', 'visitante_interno')
    ON CONFLICT DO NOTHING;
  `);

  await sql.query(`
    INSERT INTO roles_permisos (rol_id, permiso_id)
    SELECT r.id, p.id
      FROM roles r
      JOIN permisos p ON p.clave = 'acceso.intranet'
     WHERE lower(r.nombre) IN ('superadmin', 'administrador', 'director', 'subdirector')
    ON CONFLICT DO NOTHING;
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  await sql.query(`
    ALTER TABLE preguntas_seguridad RENAME COLUMN orden TO sort_order;
    ALTER TABLE preguntas_seguridad RENAME COLUMN respuesta_hash TO answer_hash;
    ALTER TABLE preguntas_seguridad RENAME COLUMN pregunta_clave TO question_key;
    ALTER TABLE preguntas_seguridad RENAME COLUMN usuario_id TO user_id;
    ALTER TABLE preguntas_seguridad RENAME TO security_questions;
  `);

  await sql.query(`
    ALTER TABLE roles_permisos RENAME COLUMN permiso_id TO permission_id;
    ALTER TABLE roles_permisos RENAME COLUMN rol_id TO role_id;
    ALTER TABLE roles_permisos RENAME TO role_permissions;
    ALTER TABLE permisos RENAME COLUMN clave TO name;
    ALTER TABLE permisos RENAME TO permissions;
  `);

  await sql.query(`
    ALTER TABLE roles DROP COLUMN IF EXISTS es_sistema;
    ALTER TABLE roles RENAME COLUMN descripcion TO description;
    ALTER TABLE roles RENAME COLUMN nombre TO name;
  `);

  await sql.query(`
    DROP INDEX IF EXISTS uq_usuarios_email;
    ALTER TABLE usuarios
      DROP CONSTRAINT IF EXISTS ck_usuarios_estado,
      DROP COLUMN IF EXISTS creado_por;
    ALTER TABLE usuarios RENAME COLUMN bloqueado_hasta TO locked_until;
    ALTER TABLE usuarios RENAME COLUMN intentos_fallidos TO failed_security_attempts;
    ALTER TABLE usuarios RENAME COLUMN debe_cambiar_password TO must_change_password;
    ALTER TABLE usuarios RENAME COLUMN debe_configurar_preguntas TO must_setup_security_questions;
    ALTER TABLE usuarios RENAME COLUMN ultimo_acceso_en TO last_access_at;
    ALTER TABLE usuarios RENAME COLUMN fecha_caducidad TO expiration_date;
    ALTER TABLE usuarios RENAME COLUMN estado TO status;
    ALTER TABLE usuarios RENAME COLUMN rol_id TO role_id;
    ALTER TABLE usuarios RENAME COLUMN nombre TO name;
    ALTER TABLE usuarios RENAME TO users;
    ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
  `);
}

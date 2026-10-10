import { QueryInterface } from 'sequelize';

export const nombre = '044-identidad-del-panel';

/** Debe coincidir con la clave de `catalogo-permisos.ts`. */
const PERMISO = 'configuracion.identidad';

/**
 * Los mismos que reciben el catálogo entero en `sembrar-permisos-roles.ts`. Superadmin
 * pasa por bypass, pero con la fila el panel de Roles enseña su interruptor encendido.
 */
const ROLES = ['Superadmin', 'Administrador'];

/**
 * La identidad visual del panel: logo de la barra lateral, icono (pestaña del navegador y
 * centro de la barra del móvil) y el color de las etiquetas de cada acción (decisión del
 * usuario, 10-10-2026). La cambia quien tenga `configuracion.identidad` y la ve todo el
 * panel, no solo quien la cambió.
 *
 * `configuracion` es una tabla de clave → valor y no una tabla con columnas de identidad:
 * la página de Configuración va a seguir creciendo y cada ajuste nuevo sería una migración
 * con una tabla de una sola fila. A cambio, la forma del `valor` no la garantiza el esquema
 * sino el validador de la API (`configuracion.validators.ts`); aquí solo se exige que sea
 * un objeto JSON. El `id` existe para la bitácora: `auditoria_cambios.entidad_id` es UUID y
 * `entidad_tipo = 'configuracion'` ya lo admite el CHECK desde la 006.
 *
 * La fila de la identidad nace vacía (`{}`): «vacío» significa «lo de fábrica», que vive
 * en el frontend (`shared/lib/identidad-panel/`). Así un cambio de los colores de fábrica
 * llega a quien nunca tocó los suyos.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  await sql.query(`
    CREATE TABLE IF NOT EXISTS configuracion (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      clave           TEXT NOT NULL,
      valor           JSONB NOT NULL DEFAULT '{}'::jsonb,
      actualizado_por UUID NULL REFERENCES usuarios(id) ON DELETE SET NULL,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT uq_configuracion_clave UNIQUE (clave),
      CONSTRAINT ck_configuracion_valor_objeto CHECK (jsonb_typeof(valor) = 'object')
    );

    INSERT INTO configuracion (clave) VALUES ('identidad-panel')
    ON CONFLICT (clave) DO NOTHING;
  `);

  // Por migración y no solo por `sembrar:permisos`, por lo mismo que la 023: el servidor
  // exige las migraciones para arrancar, el sembrador no lo corre nadie a la fuerza.
  await sql.query(
    `INSERT INTO permisos (id, clave, created_at, updated_at)
     VALUES (gen_random_uuid(), :clave, now(), now())
     ON CONFLICT (clave) DO NOTHING`,
    { replacements: { clave: PERMISO } }
  );
  await sql.query(
    `INSERT INTO roles_permisos (rol_id, permiso_id)
     SELECT r.id, p.id
       FROM roles r
       JOIN permisos p ON p.clave = :clave
      WHERE r.nombre IN (:roles)
     ON CONFLICT DO NOTHING`,
    { replacements: { clave: PERMISO, roles: ROLES } }
  );
}

/**
 * Los archivos del logo y del icono se quedan en `filesystem/panel/identidad/`: la
 * migración no toca el disco. Sin la fila, el panel vuelve a los de fábrica.
 */
export async function down(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  await sql.query(
    `DELETE FROM roles_permisos
      WHERE permiso_id IN (SELECT id FROM permisos WHERE clave = :clave)`,
    { replacements: { clave: PERMISO } }
  );
  await sql.query('DELETE FROM permisos WHERE clave = :clave', {
    replacements: { clave: PERMISO },
  });
  await sql.query('DROP TABLE IF EXISTS configuracion;');
}

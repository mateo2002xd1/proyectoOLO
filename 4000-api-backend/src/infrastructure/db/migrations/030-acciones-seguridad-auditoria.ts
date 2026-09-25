import { QueryInterface } from 'sequelize';

export const nombre = '030-acciones-seguridad-auditoria';

/**
 * Tres verbos nuevos para la bitácora, todos sobre `usuario`: hasta ahora el login
 * nunca dejaba rastro, y una cuenta que caducaba o que un administrador inactivaba
 * quedaba indistinguible de cualquier otra edición (`actualizar`).
 *
 * - `autenticar`: alguien inició sesión, en el sitio o en la intranet (van al mismo
 *   backend — ver `AuthController.login`).
 * - `expirar`: la cuenta pasó a inactiva por su propia fecha de caducidad, sin que
 *   nadie la tocara (`login.usecase.ts` y `deactivateExpiredUsers`).
 * - `inactivar`: un administrador la desactivó a mano desde el panel.
 *
 * Se recrea el `CHECK` completo porque en Postgres no se amplía en su sitio — mismo
 * patrón que las migraciones 011 y 022, que ya sumaron valores a este mismo check.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  await sql.query(`
    ALTER TABLE auditoria_cambios DROP CONSTRAINT IF EXISTS ck_auditoria_accion;
    ALTER TABLE auditoria_cambios
      ADD CONSTRAINT ck_auditoria_accion
        CHECK (accion IN
          ('crear', 'actualizar', 'eliminar', 'publicar', 'despublicar',
           'aprobar', 'rechazar', 'enviar_revision', 'guardar_borrador',
           'cambiar_password', 'autenticar', 'expirar', 'inactivar'));
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  // Las filas nuevas pasan a 'actualizar' para no romper el CHECK anterior al
  // revertir — mismo criterio que la baja de 022.
  await sql.query(`
    UPDATE auditoria_cambios SET accion = 'actualizar'
      WHERE accion IN ('autenticar', 'expirar', 'inactivar');
  `);

  await sql.query(`
    ALTER TABLE auditoria_cambios DROP CONSTRAINT IF EXISTS ck_auditoria_accion;
    ALTER TABLE auditoria_cambios
      ADD CONSTRAINT ck_auditoria_accion
        CHECK (accion IN
          ('crear', 'actualizar', 'eliminar', 'publicar', 'despublicar',
           'aprobar', 'rechazar', 'enviar_revision', 'guardar_borrador',
           'cambiar_password'));
  `);
}

import { QueryInterface } from 'sequelize';

export const nombre = '022-auditoria-guardar-borrador';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  // Se recrea el CHECK de auditoria_cambios para incluir 'guardar_borrador'
  await sql.query(`
    ALTER TABLE auditoria_cambios DROP CONSTRAINT IF EXISTS ck_auditoria_accion;
    ALTER TABLE auditoria_cambios
      ADD CONSTRAINT ck_auditoria_accion
        CHECK (accion IN
          ('crear', 'actualizar', 'eliminar', 'publicar', 'despublicar',
           'aprobar', 'rechazar', 'enviar_revision', 'cambiar_password', 'guardar_borrador'));
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  // Revertimos las filas nuevas a 'actualizar' para que no rompan el constraint anterior
  await sql.query(`
    UPDATE auditoria_cambios SET accion = 'actualizar' WHERE accion = 'guardar_borrador';
  `);

  await sql.query(`
    ALTER TABLE auditoria_cambios DROP CONSTRAINT IF EXISTS ck_auditoria_accion;
    ALTER TABLE auditoria_cambios
      ADD CONSTRAINT ck_auditoria_accion
        CHECK (accion IN
          ('crear', 'actualizar', 'eliminar', 'publicar', 'despublicar',
           'aprobar', 'rechazar', 'enviar_revision', 'cambiar_password'));
  `);
}

import { QueryInterface } from 'sequelize';

export const nombre = '036-eliminar-cms-tradicional';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(`
    DROP TABLE IF EXISTS contenidos_archivos CASCADE;
    DROP TABLE IF EXISTS contenidos CASCADE;
    DROP TABLE IF EXISTS secciones CASCADE;
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Esta migración elimina datos y tablas obsoletas. Es irreversible por diseño.
  console.warn('La migración 036 es irreversible. Las tablas del CMS antiguo han sido destruidas.');
}

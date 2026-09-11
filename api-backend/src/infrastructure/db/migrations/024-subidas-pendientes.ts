import { QueryInterface } from 'sequelize';

export const nombre = '024-subidas-pendientes';

/**
 * Archivos subidos desde el editor que todavía no se han publicado.
 *
 * El borrador se guarda sobre la misma versión, así que si alguien sube A y lo
 * reemplaza por B antes de publicar, la referencia a A desaparece de la base y nada
 * vuelve a mirarlo. Esta tabla recuerda para qué página se subió cada archivo; al
 * publicar esa página se borran los que ninguna versión usa.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(`
    CREATE TABLE IF NOT EXISTS subidas_pendientes (
      pagina_id  UUID NOT NULL REFERENCES paginas(id) ON DELETE CASCADE,
      ruta       TEXT NOT NULL,
      creado_en  TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (pagina_id, ruta)
    );
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query('DROP TABLE IF EXISTS subidas_pendientes;');
}

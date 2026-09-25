import { QueryInterface } from 'sequelize';

export const nombre = '025-visitas-paginas';

/**
 * Agrega el contador de visitas a las páginas y siembra conteos iniciales
 * realistas para las vistas existentes del sitio web y de la intranet.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  await sql.query(`
    ALTER TABLE paginas
      ADD COLUMN IF NOT EXISTS visitas INTEGER NOT NULL DEFAULT 0;
  `);

  // Sembrar conteos iniciales para vistas publicadas
  await sql.query(`
    UPDATE paginas SET visitas = 380 WHERE slug = 'inicio' AND ambito = 'sitio';
    UPDATE paginas SET visitas = 240 WHERE slug = 'tendencias' AND ambito = 'sitio';
    UPDATE paginas SET visitas = 195 WHERE slug = 'cno' AND ambito = 'sitio';
    UPDATE paginas SET visitas = 160 WHERE slug = 'cuoc' AND ambito = 'sitio';
    UPDATE paginas SET visitas = 130 WHERE slug = 'publicaciones' AND ambito = 'sitio';
    UPDATE paginas SET visitas = 75  WHERE slug = 'politica-de-privacidad' AND ambito = 'sitio';

    UPDATE paginas SET visitas = 210 WHERE slug = 'inicio' AND ambito = 'intranet';
    UPDATE paginas SET visitas = 165 WHERE slug = 'tasa' AND ambito = 'intranet';
    UPDATE paginas SET visitas = 115 WHERE slug = 'matriz' AND ambito = 'intranet';
    UPDATE paginas SET visitas = 85  WHERE slug = 'encuestas-seguimiento-laboral' AND ambito = 'intranet';
    UPDATE paginas SET visitas = 70  WHERE slug = 'encuestas-calidad-de-formacion' AND ambito = 'intranet';
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;
  await sql.query(`
    ALTER TABLE paginas
      DROP COLUMN IF EXISTS visitas;
  `);
}

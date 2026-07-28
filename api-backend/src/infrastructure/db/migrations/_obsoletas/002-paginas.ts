import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('paginas', {
    id: { type: 'UUID', primaryKey: true, defaultValue: 'gen_random_uuid()' },
    slug: { type: 'VARCHAR(255)', allowNull: false, unique: true },
    titulo: { type: 'VARCHAR(255)', allowNull: false },
    version_publicada_id: { type: 'UUID', allowNull: true },
    creado_por: { type: 'UUID', allowNull: false },
    created_at: { type: 'TIMESTAMPTZ', defaultValue: 'now()' },
    updated_at: { type: 'TIMESTAMPTZ', defaultValue: 'now()' },
  });

  await queryInterface.createTable('paginas_versiones', {
    id: { type: 'UUID', primaryKey: true, defaultValue: 'gen_random_uuid()' },
    pagina_id: { type: 'UUID', allowNull: false },
    contenido: { type: 'JSONB', allowNull: false },
    layout: { type: 'JSONB' },
    numero_version: { type: 'INTEGER', allowNull: false },
    estado: { type: 'VARCHAR(20)', defaultValue: 'borrador' },
    motivo_rechazo: { type: 'TEXT' },
    revisor_id: { type: 'UUID' },
    publicado_por: { type: 'UUID' },
    publicado_en: { type: 'TIMESTAMPTZ' },
    creado_en: { type: 'TIMESTAMPTZ', defaultValue: 'now()' },
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('paginas_versiones');
  await queryInterface.dropTable('paginas');
}

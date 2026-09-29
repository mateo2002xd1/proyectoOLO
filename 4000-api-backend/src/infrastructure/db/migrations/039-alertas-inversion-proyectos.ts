import { QueryInterface, DataTypes } from 'sequelize';

export const nombre = '039-alertas-inversion-proyectos';

/**
 * Tabla de hechos de "Alertas de inversión": una fila por proyecto de inversión
 * anunciado (noticia). Reutiliza el mismo ciclo editorial de `paginas_versiones`
 * (`borrador` / `en_revision` / `publicado` / `rechazado`, D8: borrado lógico por
 * `estado`) en vez de inventar uno nuevo — es el mismo problema (qué ve el público)
 * resuelto igual en todo el proyecto.
 *
 * `proyectos_inversion_ubicaciones` es el puente N:M con departamento/municipio
 * (un proyecto puede anunciarse en varias sedes), calcado de `roles_permisos`.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await queryInterface.createTable('proyectos_inversion', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: queryInterface.sequelize.literal('gen_random_uuid()'),
      },
      tipo: { type: DataTypes.STRING(10), allowNull: false },
      descripcion: { type: DataTypes.TEXT, allowNull: false },
      empresa_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'empresas', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      seccion_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'ciiu_secciones', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      clase_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'ciiu_clases', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      fecha_anuncio: { type: DataTypes.DATEONLY, allowNull: false },
      fuente_url: { type: DataTypes.TEXT, allowNull: false },
      fuente_medio: { type: DataTypes.STRING(120), allowNull: true },
      inversion_cop: { type: DataTypes.DECIMAL(18, 0), allowNull: true },
      empleos_estimados: { type: DataTypes.INTEGER, allowNull: true },
      estado: { type: DataTypes.STRING(12), allowNull: false, defaultValue: 'borrador' },
      creado_por: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'usuarios', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: queryInterface.sequelize.literal('now()') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: queryInterface.sequelize.literal('now()') },
    }, { transaction });

    await queryInterface.sequelize.query(`
      ALTER TABLE proyectos_inversion
        ADD CONSTRAINT ck_proyectos_inversion_tipo CHECK (tipo IN ('nuevo', 'expansion')),
        ADD CONSTRAINT ck_proyectos_inversion_estado CHECK (estado IN ('borrador', 'en_revision', 'publicado', 'rechazado')),
        ADD CONSTRAINT ck_proyectos_inversion_fuente_url CHECK (fuente_url ~* '^https?://'),
        ADD CONSTRAINT ck_proyectos_inversion_inversion_cop CHECK (inversion_cop IS NULL OR inversion_cop >= 0),
        ADD CONSTRAINT ck_proyectos_inversion_empleos CHECK (empleos_estimados IS NULL OR empleos_estimados >= 0);
    `, { transaction });

    await queryInterface.addIndex('proyectos_inversion', ['seccion_id'], {
      name: 'idx_proyectos_inversion_seccion',
      where: { estado: 'publicado' },
      transaction,
    });
    await queryInterface.addIndex('proyectos_inversion', ['fecha_anuncio'], {
      name: 'idx_proyectos_inversion_fecha',
      transaction,
    });

    await queryInterface.createTable('proyectos_inversion_ubicaciones', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: queryInterface.sequelize.literal('gen_random_uuid()'),
      },
      proyecto_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'proyectos_inversion', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      departamento_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'departamentos', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      municipio_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'municipios', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: queryInterface.sequelize.literal('now()') },
    }, { transaction });

    // `NULLS NOT DISTINCT` (PG15+) para que dos filas del mismo proyecto y
    // departamento sin municipio no se dupliquen — igual que el borrador de origen.
    await queryInterface.sequelize.query(`
      ALTER TABLE proyectos_inversion_ubicaciones
        ADD CONSTRAINT uq_proyectos_ubicaciones UNIQUE NULLS NOT DISTINCT (proyecto_id, departamento_id, municipio_id);
    `, { transaction });

    await queryInterface.addIndex('proyectos_inversion_ubicaciones', ['departamento_id', 'proyecto_id'], {
      name: 'idx_proyectos_ubicaciones_depto',
      transaction,
    });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    await queryInterface.dropTable('proyectos_inversion_ubicaciones', { transaction });
    await queryInterface.dropTable('proyectos_inversion', { transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

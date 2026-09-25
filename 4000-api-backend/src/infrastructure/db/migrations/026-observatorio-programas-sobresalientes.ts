import { QueryInterface, DataTypes } from 'sequelize';

export const nombre = '026-observatorio-programas-sobresalientes';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    // 1. Tabla: departamentos
    await queryInterface.createTable('departamentos', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: queryInterface.sequelize.literal('gen_random_uuid()'),
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: 'uq_departamentos_nombre'
      },
      codigo_dane: {
        type: DataTypes.STRING(10),
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: queryInterface.sequelize.literal('now()'),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: queryInterface.sequelize.literal('now()'),
      },
    }, { transaction });

    // 2. Tabla: centros_formacion
    await queryInterface.createTable('centros_formacion', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: queryInterface.sequelize.literal('gen_random_uuid()'),
      },
      departamento_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'departamentos', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: queryInterface.sequelize.literal('now()'),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: queryInterface.sequelize.literal('now()'),
      },
    }, { transaction });

    await queryInterface.addConstraint('centros_formacion', {
      type: 'unique',
      fields: ['departamento_id', 'nombre'],
      name: 'uq_centros_formacion_depto_nombre',
      transaction
    });

    // 3. Tabla: niveles_formacion
    await queryInterface.createTable('niveles_formacion', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: queryInterface.sequelize.literal('gen_random_uuid()'),
      },
      nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: 'uq_niveles_formacion_nombre'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: queryInterface.sequelize.literal('now()'),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: queryInterface.sequelize.literal('now()'),
      },
    }, { transaction });

    // 4. Tabla: programas_formacion
    await queryInterface.createTable('programas_formacion', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: queryInterface.sequelize.literal('gen_random_uuid()'),
      },
      nivel_formacion_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'niveles_formacion', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: queryInterface.sequelize.literal('now()'),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: queryInterface.sequelize.literal('now()'),
      },
    }, { transaction });

    await queryInterface.addConstraint('programas_formacion', {
      type: 'unique',
      fields: ['nivel_formacion_id', 'nombre'],
      name: 'uq_programas_formacion_nivel_nombre',
      transaction
    });

    // 5. Tabla: programas_sobresalientes
    await queryInterface.createTable('programas_sobresalientes', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: queryInterface.sequelize.literal('gen_random_uuid()'),
      },
      departamento_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'departamentos', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      centro_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'centros_formacion', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      programa_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'programas_formacion', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      nivel_formacion_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'niveles_formacion', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      sexo: {
        type: DataTypes.CHAR(1),
        allowNull: false,
      },
      certificados: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      vinculados: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tasa_vinculacion: {
        type: DataTypes.DECIMAL(6, 4),
        allowNull: false,
      },
      salario_promedio: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: queryInterface.sequelize.literal('now()'),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: queryInterface.sequelize.literal('now()'),
      },
    }, { transaction });

    // Restricciones de Dominio y Unicidad en tabla de hechos
    await queryInterface.sequelize.query(`
      ALTER TABLE programas_sobresalientes
      ADD CONSTRAINT ck_sobresalientes_sexo CHECK (sexo IN ('M', 'F')),
      ADD CONSTRAINT ck_sobresalientes_certificados CHECK (certificados >= 0),
      ADD CONSTRAINT ck_sobresalientes_vinculados CHECK (vinculados >= 0 AND vinculados <= certificados),
      ADD CONSTRAINT ck_sobresalientes_tasa CHECK (tasa_vinculacion >= 0 AND tasa_vinculacion <= 1),
      ADD CONSTRAINT ck_sobresalientes_salario CHECK (salario_promedio >= 0),
      ADD CONSTRAINT uq_sobresalientes_registro UNIQUE (centro_id, programa_id, sexo);
    `, { transaction });

    // Índices
    await queryInterface.addIndex('programas_sobresalientes', ['departamento_id'], { name: 'idx_sobresalientes_departamento', transaction });
    await queryInterface.addIndex('programas_sobresalientes', ['nivel_formacion_id'], { name: 'idx_sobresalientes_nivel', transaction });
    await queryInterface.addIndex('programas_sobresalientes', ['sexo'], { name: 'idx_sobresalientes_sexo', transaction });
    await queryInterface.addIndex('programas_sobresalientes', ['tasa_vinculacion'], { name: 'idx_sobresalientes_tasa', transaction });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    await queryInterface.dropTable('programas_sobresalientes', { transaction });
    await queryInterface.dropTable('programas_formacion', { transaction });
    await queryInterface.dropTable('niveles_formacion', { transaction });
    await queryInterface.dropTable('centros_formacion', { transaction });
    await queryInterface.dropTable('departamentos', { transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

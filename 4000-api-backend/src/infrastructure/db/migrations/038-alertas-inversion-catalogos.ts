import { QueryInterface, DataTypes } from 'sequelize';

export const nombre = '038-alertas-inversion-catalogos';

/**
 * Catálogos del módulo "Alertas de inversión" (tarjeta de "Actualizaciones" que hasta
 * ahora quedaba en "Próximamente" — ver el comentario de `027-cargas-datos`).
 *
 * Clasificación económica CIIU Rev. 4 A.C. (DANE): `ciiu_secciones` (A–U) y
 * `ciiu_clases` (el código de 4 dígitos, opcional por proyecto). No se reutiliza el
 * catálogo CNO/CUOC de ocupaciones (RF-09): es una clasificación distinta, de
 * actividad económica y no de ocupación.
 *
 * `empresas` y `municipios` son nuevos: no existía catálogo de empresas en el
 * proyecto, y `departamentos` (migración 026/032) nunca bajó a nivel de municipio.
 * `municipios` se modela como catálogo **abierto** (como `centros_formacion`): el
 * importador lo completa solo por `(departamento_id, nombre)`, a diferencia de
 * `departamentos`, que es cerrado y se resuelve por alias o rechaza.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await queryInterface.createTable('ciiu_secciones', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: queryInterface.sequelize.literal('gen_random_uuid()'),
      },
      letra: { type: DataTypes.CHAR(1), allowNull: false, unique: 'uq_ciiu_secciones_letra' },
      nombre: { type: DataTypes.STRING(250), allowNull: false },
      divisiones: { type: DataTypes.STRING(10), allowNull: false },
      activa: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: queryInterface.sequelize.literal('now()') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: queryInterface.sequelize.literal('now()') },
    }, { transaction });

    await queryInterface.sequelize.query(
      "ALTER TABLE ciiu_secciones ADD CONSTRAINT ck_ciiu_secciones_letra CHECK (letra ~ '^[A-Z]$');",
      { transaction }
    );

    await queryInterface.createTable('ciiu_clases', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: queryInterface.sequelize.literal('gen_random_uuid()'),
      },
      seccion_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'ciiu_secciones', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      codigo: { type: DataTypes.CHAR(4), allowNull: false },
      nombre: { type: DataTypes.STRING(300), allowNull: false },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: queryInterface.sequelize.literal('now()') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: queryInterface.sequelize.literal('now()') },
    }, { transaction });

    await queryInterface.sequelize.query(
      "ALTER TABLE ciiu_clases ADD CONSTRAINT ck_ciiu_clases_codigo CHECK (codigo ~ '^[0-9]{4}$');",
      { transaction }
    );
    await queryInterface.addConstraint('ciiu_clases', {
      type: 'unique',
      fields: ['seccion_id', 'codigo'],
      name: 'uq_ciiu_clases_seccion_codigo',
      transaction,
    });

    await queryInterface.createTable('empresas', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: queryInterface.sequelize.literal('gen_random_uuid()'),
      },
      nombre: { type: DataTypes.STRING(200), allowNull: false },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: queryInterface.sequelize.literal('now()') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: queryInterface.sequelize.literal('now()') },
    }, { transaction });

    // Único por nombre normalizado a minúsculas: "Bodytech" y "BODYTECH" en dos filas
    // del mismo Excel (o en cargas distintas) son la misma empresa.
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX uq_empresas_nombre ON empresas (lower(nombre));',
      { transaction }
    );

    await queryInterface.createTable('municipios', {
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
        onUpdate: 'CASCADE',
      },
      nombre: { type: DataTypes.STRING(120), allowNull: false },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: queryInterface.sequelize.literal('now()') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: queryInterface.sequelize.literal('now()') },
    }, { transaction });

    await queryInterface.addConstraint('municipios', {
      type: 'unique',
      fields: ['departamento_id', 'nombre'],
      name: 'uq_municipios_depto_nombre',
      transaction,
    });

    // Semilla: las 21 secciones CIIU Rev.4 A.C. (nombres oficiales DANE). La T
    // (hogares como empleadores) no genera proyectos de inversión — igual que en el
    // borrador de esquema de origen — y queda inactiva.
    await queryInterface.bulkInsert('ciiu_secciones', [
      { letra: 'A', nombre: 'Agricultura, ganadería, caza, silvicultura y pesca', divisiones: '01-03', activa: true },
      { letra: 'B', nombre: 'Explotación de minas y canteras', divisiones: '05-09', activa: true },
      { letra: 'C', nombre: 'Industrias manufactureras', divisiones: '10-33', activa: true },
      { letra: 'D', nombre: 'Suministro de electricidad, gas, vapor y aire acondicionado', divisiones: '35', activa: true },
      { letra: 'E', nombre: 'Distribución de agua; evacuación y tratamiento de aguas residuales, gestión de desechos y actividades de saneamiento ambiental', divisiones: '36-39', activa: true },
      { letra: 'F', nombre: 'Construcción', divisiones: '41-43', activa: true },
      { letra: 'G', nombre: 'Comercio al por mayor y al por menor; reparación de vehículos automotores y motocicletas', divisiones: '45-47', activa: true },
      { letra: 'H', nombre: 'Transporte y almacenamiento', divisiones: '49-53', activa: true },
      { letra: 'I', nombre: 'Alojamiento y servicios de comida', divisiones: '55-56', activa: true },
      { letra: 'J', nombre: 'Información y comunicaciones', divisiones: '58-63', activa: true },
      { letra: 'K', nombre: 'Actividades financieras y de seguros', divisiones: '64-66', activa: true },
      { letra: 'L', nombre: 'Actividades inmobiliarias', divisiones: '68', activa: true },
      { letra: 'M', nombre: 'Actividades profesionales, científicas y técnicas', divisiones: '69-75', activa: true },
      { letra: 'N', nombre: 'Actividades de servicios administrativos y de apoyo', divisiones: '77-82', activa: true },
      { letra: 'O', nombre: 'Administración pública y defensa; planes de seguridad social de afiliación obligatoria', divisiones: '84', activa: true },
      { letra: 'P', nombre: 'Educación', divisiones: '85', activa: true },
      { letra: 'Q', nombre: 'Actividades de atención de la salud humana y de asistencia social', divisiones: '86-88', activa: true },
      { letra: 'R', nombre: 'Actividades artísticas, de entretenimiento y recreación', divisiones: '90-93', activa: true },
      { letra: 'S', nombre: 'Otras actividades de servicios', divisiones: '94-96', activa: true },
      { letra: 'T', nombre: 'Actividades de los hogares individuales en calidad de empleadores; actividades no diferenciadas de los hogares individuales como productores de bienes y servicios para uso propio', divisiones: '97-98', activa: false },
      { letra: 'U', nombre: 'Actividades de organizaciones y entidades extraterritoriales', divisiones: '99', activa: true },
    ], { transaction });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    await queryInterface.dropTable('municipios', { transaction });
    await queryInterface.dropTable('empresas', { transaction });
    await queryInterface.dropTable('ciiu_clases', { transaction });
    await queryInterface.dropTable('ciiu_secciones', { transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

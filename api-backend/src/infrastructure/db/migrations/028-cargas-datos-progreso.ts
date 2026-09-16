import { QueryInterface, DataTypes } from 'sequelize';

export const nombre = '028-cargas-datos-progreso';

/**
 * `cargas_datos` solo distinguía "procesando" / "completado" / "error" — sin
 * forma de saber qué tan lejos iba una carga en curso. Estas dos columnas
 * alimentan el loader real de "Actualizaciones": `progreso` es el porcentaje
 * (0-100) y `filas_totales` es el total de filas de la hoja, para poder
 * mostrar "1.204 de 3.400 filas". `filas_procesadas` (de 027) ya existía pero
 * solo se escribía al terminar; ahora se actualiza también en caliente.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn('cargas_datos', 'progreso', {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  });

  await queryInterface.addColumn('cargas_datos', 'filas_totales', {
    type: DataTypes.INTEGER,
    allowNull: true,
  });

  await queryInterface.sequelize.query(`
    ALTER TABLE cargas_datos ADD CONSTRAINT ck_cargas_datos_progreso CHECK (progreso BETWEEN 0 AND 100);
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(`
    ALTER TABLE cargas_datos DROP CONSTRAINT IF EXISTS ck_cargas_datos_progreso;
  `);
  await queryInterface.removeColumn('cargas_datos', 'filas_totales');
  await queryInterface.removeColumn('cargas_datos', 'progreso');
}

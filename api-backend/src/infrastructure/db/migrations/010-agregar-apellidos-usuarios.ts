import { QueryInterface, DataTypes } from 'sequelize';

export const nombre = '010-agregar-apellidos-usuarios';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  // 1. Agregar la columna "apellidos" admitiendo nulos por el momento
  await queryInterface.addColumn('usuarios', 'apellidos', {
    type: DataTypes.TEXT,
    allowNull: true,
  });

  // 2. Llenar los datos existentes (extraer la última palabra como apellido como un respaldo heurístico temporal,
  //    o simplemente copiar el nombre al apellido para no dejarlo vacío si la base lo requiere).
  //    Vamos a separar usando SQL: si hay un espacio, tomamos desde el último espacio como apellido.
  await sql.query(`
    UPDATE usuarios
    SET 
        apellidos = CASE 
            WHEN position(' ' in nombre) > 0 THEN substring(nombre from ' [^ ]+$')
            ELSE '' 
        END,
        nombre = CASE 
            WHEN position(' ' in nombre) > 0 THEN trim(trailing substring(nombre from ' [^ ]+$') from nombre)
            ELSE nombre
        END
    WHERE apellidos IS NULL;
  `);

  // Limpiar espacios en blanco al inicio del apellido si los hay (por el regex/substring)
  await sql.query(`UPDATE usuarios SET apellidos = trim(apellidos);`);

  // No lo forzamos a NOT NULL aquí para no romper inserciones concurrentes de otras ramas,
  // pero lo ideal sería hacerlo NOT NULL cuando el código esté completamente desplegado.
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Para revertir, volvemos a concatenar el nombre y el apellido y luego eliminamos la columna
  const sql = queryInterface.sequelize;

  await sql.query(`
    UPDATE usuarios
    SET nombre = trim(nombre || ' ' || COALESCE(apellidos, ''));
  `);

  await queryInterface.removeColumn('usuarios', 'apellidos');
}

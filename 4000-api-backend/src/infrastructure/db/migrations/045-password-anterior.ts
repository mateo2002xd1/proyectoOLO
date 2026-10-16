import { QueryInterface } from 'sequelize';

export const nombre = '045-password-anterior';

/**
 * La contraseña anterior a la actual, para que nadie vuelva a ella ni a la actual al
 * elegir una nueva (pedido del usuario, 15-10-2026).
 *
 * `password_hash_anterior`:
 *
 * - Cada vez que cambia `password_hash`, el que había pasa aquí: primer ingreso,
 *   recuperación, cambio voluntario o forzado, y también cuando un administrador emite
 *   una temporal (así, en el primer ingreso tras un restablecimiento, «la anterior» es la
 *   contraseña real que la persona tenía antes de la temporal).
 * - `NULL` = no hay anterior (cuenta nueva, o anterior a esta migración). Las cuentas
 *   existentes empiezan sin ella: no hay forma de saber cuál tuvieron.
 * - La regla vive en `shared/password-policy.ts` (`nuevaPasswordSinRepetir`). Como
 *   `password_hash`, nunca sale en una respuesta: los repositorios la excluyen.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(`
    ALTER TABLE usuarios ADD COLUMN password_hash_anterior text NULL;
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(`
    ALTER TABLE usuarios DROP COLUMN IF EXISTS password_hash_anterior;
  `);
}

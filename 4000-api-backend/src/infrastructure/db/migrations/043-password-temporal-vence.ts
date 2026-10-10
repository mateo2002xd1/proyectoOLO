import { QueryInterface } from 'sequelize';

export const nombre = '043-password-temporal-vence';

/**
 * La contraseña temporal caduca a las 72 horas de emitirse (decisión del usuario,
 * 09-10-2026).
 *
 * Hasta ahora una temporal valía hasta que se cambiaba, sin límite. Una cuenta creada y
 * nunca estrenada guardaba indefinidamente una contraseña que viajó por correo, chat o
 * papel. Se descartó quemarla al primer uso: quien cierra la pestaña sin terminar el primer
 * ingreso quedaría fuera hasta que un administrador le emitiera otra.
 *
 * `password_temporal_vence_en`:
 *
 * - Se fija al emitir una temporal (alta, «Restablecer contraseña», reactivación) y se
 *   vacía al reemplazarla (primer ingreso, cambio voluntario, recuperación).
 * - `NULL` = no hay temporal vigente que vigilar. Solo cuenta junto a
 *   `debe_cambiar_password`: si esa marca está apagada, la fecha no se mira.
 * - La regla vive en `shared/password-policy.ts` (`HORAS_DE_VIGENCIA_TEMPORAL`,
 *   `temporalVencida`); aquí solo se guarda la fecha.
 *
 * Las cuentas que ya tienen una temporal pendiente reciben 72 horas **desde que se aplica
 * esta migración**: no se sabe cuándo se emitió la suya, y darlas por vencidas de golpe
 * dejaría fuera a quien recibió la contraseña ayer.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(`
    ALTER TABLE usuarios ADD COLUMN password_temporal_vence_en timestamptz NULL;

    UPDATE usuarios
       SET password_temporal_vence_en = now() + interval '72 hours'
     WHERE debe_cambiar_password = true;
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(`
    ALTER TABLE usuarios DROP COLUMN IF EXISTS password_temporal_vence_en;
  `);
}

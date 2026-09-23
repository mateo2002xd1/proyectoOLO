import { QueryInterface } from 'sequelize';

export const nombre = '031-bloqueo-y-preguntas-auditoria';

/**
 * Dos verbos nuevos para la bitácora, los dos sobre `usuario`. Hasta ahora ninguno de
 * los dos hechos dejaba rastro:
 *
 * - `bloquear`: la cuenta quedó bloqueada un tiempo por intentos fallidos. Pasa por dos
 *   caminos —cinco inicios de sesión fallidos la bloquean 15 minutos, y tres respuestas
 *   incorrectas a las preguntas de seguridad, 30— y los dos ocurrían en silencio: quien
 *   auditaba no tenía forma de saber que alguien había estado probando contraseñas o
 *   respuestas contra una cuenta.
 * - `verificar_preguntas`: alguien respondió las preguntas de seguridad para recuperar
 *   una cuenta, con su resultado. Los fallos son justo lo que interesa ver: cada uno es
 *   un intento de entrar en una cuenta ajena o un usuario que no recuerda sus respuestas.
 *
 * Se recrea el `CHECK` completo porque en Postgres no se amplía en su sitio — mismo
 * patrón que las migraciones 011, 022 y 030, que ya sumaron valores a este mismo check.
 */
const ACCIONES_HASTA_030 = [
  'crear', 'actualizar', 'eliminar', 'publicar', 'despublicar',
  'aprobar', 'rechazar', 'enviar_revision', 'guardar_borrador',
  'cambiar_password', 'autenticar', 'expirar', 'inactivar',
];

const ACCIONES_NUEVAS = ['bloquear', 'verificar_preguntas'];

const checkCon = (acciones: string[]) => `
  ALTER TABLE auditoria_cambios DROP CONSTRAINT IF EXISTS ck_auditoria_accion;
  ALTER TABLE auditoria_cambios
    ADD CONSTRAINT ck_auditoria_accion
      CHECK (accion IN (${acciones.map((a) => `'${a}'`).join(', ')}));
`;

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(checkCon([...ACCIONES_HASTA_030, ...ACCIONES_NUEVAS]));
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  // Las filas nuevas pasan a 'actualizar' para no romper el CHECK anterior al revertir
  // — mismo criterio que la baja de 022 y de 030.
  await sql.query(`
    UPDATE auditoria_cambios SET accion = 'actualizar'
      WHERE accion IN (${ACCIONES_NUEVAS.map((a) => `'${a}'`).join(', ')});
  `);

  await sql.query(checkCon(ACCIONES_HASTA_030));
}

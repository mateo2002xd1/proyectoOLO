import { QueryInterface } from 'sequelize';

export const nombre = '040-auditoria-autoguardado';

/**
 * Un verbo nuevo para la bitácora: `autoguardar_borrador`, el guardado que hace el editor
 * solo, cada poco, mientras hay cambios sin guardar.
 *
 * No se escribe como `guardar_borrador` a propósito. Esa fila se lee «el usuario guardó su
 * edición en borrador», y es lo que decidió el usuario (23/9/2026) para no confundir a
 * quien audita: guardar es algo que alguien pulsa. Un autoguardado no lo pulsó nadie, y
 * contarlo igual volvería a mezclar las dos cosas. Tampoco se deja sin fila: el contenido
 * de la página cambia, y eso siempre deja rastro.
 *
 * Se recrea el `CHECK` completo porque en Postgres no se amplía en su sitio — mismo
 * patrón que las migraciones 011, 022, 030 y 031.
 */
const ACCIONES_HASTA_031 = [
  'crear', 'actualizar', 'eliminar', 'publicar', 'despublicar',
  'aprobar', 'rechazar', 'enviar_revision', 'guardar_borrador',
  'cambiar_password', 'autenticar', 'expirar', 'inactivar',
  'bloquear', 'verificar_preguntas',
];

const ACCIONES_NUEVAS = ['autoguardar_borrador'];

const checkCon = (acciones: string[]) => `
  ALTER TABLE auditoria_cambios DROP CONSTRAINT IF EXISTS ck_auditoria_accion;
  ALTER TABLE auditoria_cambios
    ADD CONSTRAINT ck_auditoria_accion
      CHECK (accion IN (${acciones.map((a) => `'${a}'`).join(', ')}));
`;

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(checkCon([...ACCIONES_HASTA_031, ...ACCIONES_NUEVAS]));
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  // Al revertir pasan a `guardar_borrador` y no a `actualizar` como en 022, 030 y 031:
  // son guardados de borrador de verdad, y ese verbo ya existía antes de esta migración.
  await sql.query(`
    UPDATE auditoria_cambios SET accion = 'guardar_borrador'
      WHERE accion IN (${ACCIONES_NUEVAS.map((a) => `'${a}'`).join(', ')});
  `);

  await sql.query(checkCon(ACCIONES_HASTA_031));
}

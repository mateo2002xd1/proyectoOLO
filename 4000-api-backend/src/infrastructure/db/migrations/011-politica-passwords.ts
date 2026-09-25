import { QueryInterface, DataTypes } from 'sequelize';

export const nombre = '011-politica-passwords';

/**
 * Directivas de contraseñas, §3 «Protección contra ataques» y consideración 2
 * (trazabilidad, Ley 1581/2012).
 *
 * Dos cambios, ambos por el mismo motivo: lo que la política da por hecho no
 * existía en la base.
 *
 * 1. **`intentos_fallidos_login`.** Ya había `intentos_fallidos`, pero es de las
 *    preguntas de seguridad: se cuenta hasta 3 y bloquea 30 minutos
 *    (`security-questions.usecase.ts`). §3 pide 5 intentos y 15 minutos para el
 *    inicio de sesión, que es otro umbral y otro flujo. Reutilizar la misma
 *    columna mezclaría las dos cuentas y bloquearía a destiempo en ambos casos, así
 *    que el contador del login va aparte. `bloqueado_hasta` sí se comparte: la
 *    cuenta está bloqueada o no lo está, venga de donde venga.
 *
 * 2. **Verbo `cambiar_password` en la bitácora.** La migración 006 dejó un CHECK
 *    que solo admite ocho acciones, ninguna de las cuales describe un cambio de
 *    contraseña. Registrarlo como `actualizar` lo confundiría con cualquier otra
 *    edición del usuario, y una auditoría de la Ley 1581 tiene que poder responder
 *    «quién cambió contraseñas y cuándo» sin filtrar a mano.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  await queryInterface.addColumn('usuarios', 'intentos_fallidos_login', {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  });

  // Se recrea en vez de usar ADD: un CHECK no se amplía en su sitio. El nombre se
  // conserva para que 006 y esta migración hablen de la misma restricción.
  await sql.query(`
    ALTER TABLE auditoria_cambios DROP CONSTRAINT IF EXISTS ck_auditoria_accion;
    ALTER TABLE auditoria_cambios
      ADD CONSTRAINT ck_auditoria_accion
        CHECK (accion IN
          ('crear', 'actualizar', 'eliminar', 'publicar', 'despublicar',
           'aprobar', 'rechazar', 'enviar_revision', 'cambiar_password'));
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  // Las filas con el verbo nuevo violarían el CHECK anterior y harían fallar el
  // ALTER. Son evidencia de auditoría: no se borran, se reetiquetan al verbo
  // genérico que sí admitía 006.
  await sql.query(`
    UPDATE auditoria_cambios SET accion = 'actualizar' WHERE accion = 'cambiar_password';
  `);

  await sql.query(`
    ALTER TABLE auditoria_cambios DROP CONSTRAINT IF EXISTS ck_auditoria_accion;
    ALTER TABLE auditoria_cambios
      ADD CONSTRAINT ck_auditoria_accion
        CHECK (accion IN
          ('crear', 'actualizar', 'eliminar', 'publicar', 'despublicar',
           'aprobar', 'rechazar', 'enviar_revision'));
  `);

  await queryInterface.removeColumn('usuarios', 'intentos_fallidos_login');
}

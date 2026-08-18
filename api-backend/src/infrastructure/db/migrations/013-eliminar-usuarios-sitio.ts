import { QueryInterface } from 'sequelize';

export const nombre = '013-eliminar-usuarios-sitio';

/**
 * Cierra la deuda que el §2.1 de `11-base-de-datos.md` dejó abierta: la segunda
 * tabla de usuarios desaparece y `usuarios` queda como la única identidad del
 * sistema.
 *
 * No es un renombrado, es retirar una autenticación: con la tabla se va su login
 * propio (`/api/sitio-users/login`) y el segundo secreto JWT (`JWT_SITE_SECRET`)
 * que solo firmaba esos tokens. Ningún frontend los consumía — el panel del sitio
 * entra por `/api/auth/login`, que siempre validó contra `usuarios`.
 *
 * La guarda no es decorativa. Estas filas son datos personales de ciudadanos
 * (Ley 1581) y una migración no decide borrarlos: si en algún entorno la tabla
 * tiene cuentas, esto falla y deja la base intacta para que alguien decida a mano.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  await sql.query(`
    DO $$
    DECLARE cuentas INTEGER;
    BEGIN
      IF to_regclass('public.usuarios_sitio') IS NULL THEN
        RETURN;
      END IF;

      SELECT count(*) INTO cuentas FROM usuarios_sitio;

      IF cuentas > 0 THEN
        RAISE EXCEPTION
          'usuarios_sitio tiene % cuenta(s) con datos personales. Decide su destino antes de eliminarla: respáldalas o trasládalas a usuarios.',
          cuentas;
      END IF;
    END $$;
  `);

  await sql.query(`
    DROP TABLE IF EXISTS usuarios_sitio;
  `);
}

/**
 * Devuelve la tabla vacía, con la forma que tenía tras `001-esquema-base`. La
 * referencia apunta a `usuarios` porque `005-identidad` renombró `users`, y una
 * reversión no resucita el nombre viejo. No restaura filas: `up` solo corre con
 * la tabla vacía, así que no hay ninguna que devolver.
 */
export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(`
    CREATE TABLE IF NOT EXISTS usuarios_sitio (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      status        TEXT NOT NULL DEFAULT 'active',
      created_by    UUID REFERENCES usuarios(id),
      last_login_at TIMESTAMPTZ,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

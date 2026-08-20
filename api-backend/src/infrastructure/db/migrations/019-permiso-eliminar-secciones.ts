import { QueryInterface } from 'sequelize';

export const nombre = '019-permiso-eliminar-secciones';

/** Debe coincidir con la clave declarada en `shared/catalogo-permisos.ts`. */
const CLAVE = 'secciones.eliminar';

/**
 * Roles que estrenan el permiso.
 *
 * Son los dos a los que `sembrar-permisos-roles.ts` concede el catálogo entero, así
 * que dárselo aquí no les amplía el alcance: se lo iba a dar el sembrador de todas
 * formas. El Editor queda fuera a propósito —crear rutas del portal es más que editar
 * las que ya existen— y quien quiera dárselo lo hace desde el panel, que es donde esa
 * decisión se ve y queda registrada.
 */
const ROLES = ['Superadmin', 'Administrador'];

/**
 * Da de alta `secciones.eliminar`, el permiso del botón «Eliminar sección».
 *
 * Va por migración y no solo por el sembrador por lo mismo que la 016: `server.ts`
 * exige que no haya migraciones pendientes para arrancar, pero nada obliga a correr
 * `sembrar:permisos`. Sin esto, la API pediría un permiso que no existe en la tabla y
 * el botón no le saldría a nadie salvo al superadmin —que pasa por bypass— sin que
 * nada explicara por qué.
 *
 * Se separa de `secciones.crear` a propósito: crear añade, eliminar destruye y no se
 * deshace. Tenerlos aparte permite dar el primero a más gente sin dar el segundo.
 *
 * Es idempotente por partida doble: `ON CONFLICT DO NOTHING` sobre la clave única de
 * `permisos`, y el `INSERT ... SELECT` de las asignaciones tampoco duplica.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  await sql.query(
    `INSERT INTO permisos (id, clave, created_at, updated_at)
     VALUES (gen_random_uuid(), :clave, now(), now())
     ON CONFLICT (clave) DO NOTHING`,
    { replacements: { clave: CLAVE } }
  );

  // Un rol que no exista en este entorno simplemente no produce filas: el JOIN no
  // encuentra nada. No es un error — los roles los siembra otro script y puede que
  // aquí solo esté uno de los dos.
  await sql.query(
    `INSERT INTO roles_permisos (rol_id, permiso_id)
     SELECT r.id, p.id
       FROM roles r
       JOIN permisos p ON p.clave = :clave
      WHERE r.nombre IN (:roles)
     ON CONFLICT DO NOTHING`,
    { replacements: { clave: CLAVE, roles: ROLES } }
  );
}

/**
 * Retira el permiso y sus asignaciones.
 *
 * Lo ya borrado no vuelve: revertir quita la capacidad de eliminar secciones, no
 * resucita las que se eliminaron. Sus registros de bitácora siguen ahí, que es lo
 * único que quedaba de ellas.
 */
export async function down(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  await sql.query(
    `DELETE FROM roles_permisos
      WHERE permiso_id IN (SELECT id FROM permisos WHERE clave = :clave)`,
    { replacements: { clave: CLAVE } }
  );
  await sql.query('DELETE FROM permisos WHERE clave = :clave', {
    replacements: { clave: CLAVE },
  });
}

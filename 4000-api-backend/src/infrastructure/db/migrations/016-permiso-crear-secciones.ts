import { QueryInterface } from 'sequelize';

export const nombre = '016-permiso-crear-secciones';

/** Debe coincidir con la clave declarada en `shared/catalogo-permisos.ts`. */
const CLAVE = 'secciones.crear';

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
 * Da de alta `secciones.crear`, el permiso del botón «Nueva sección».
 *
 * ## Por qué una migración y no solo el sembrador
 *
 * La clave está en `CATALOGO_PERMISOS`, así que `npm run sembrar:permisos` la crearía.
 * Pero el sembrador se corre a mano y nada obliga a hacerlo: `server.ts` exige que no
 * haya migraciones pendientes para arrancar, y no tiene un control equivalente para
 * las siembras. Sin esto, un despliegue normal dejaría la API pidiendo un permiso que
 * no existe en `permisos`, y el botón no le aparecería a nadie salvo al superadmin
 * —que pasa por bypass— sin que nada explicara por qué.
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
 * Las secciones creadas mientras estuvo activo **no se tocan**: sus páginas y sus
 * claves `editar.{ambito}.{slug}` son contenido, no parte de esta migración. Revertir
 * quita la capacidad de crear más, no deshace lo ya creado.
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

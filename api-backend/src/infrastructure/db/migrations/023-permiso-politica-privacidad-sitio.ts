import { QueryInterface } from 'sequelize';

export const nombre = '023-permiso-politica-privacidad-sitio';

/** Debe coincidir con `claveDeSeccion('sitio', 'politica-de-privacidad')` en `catalogo-permisos.ts`. */
const CLAVE = 'editar.sitio.politica-de-privacidad';

/**
 * Roles que estrenan el permiso.
 *
 * A diferencia de `016`/`019` (`secciones.crear`/`secciones.eliminar`, que se quedan
 * en Superadmin + Administrador a propósito), esta clave concede *editar esta página*
 * — el mismo tipo de permiso que `editar.sitio.inicio` o `editar.sitio.menu-y-pie`,
 * que ya tiene también el Editor. Copiar la lista de roles de aquellas dos migraciones
 * sin pensarlo dejaría al Editor sin poder tocar una página que sí puede editar.
 */
const ROLES = ['Superadmin', 'Administrador', 'Editor'];

/**
 * Da de alta `editar.sitio.politica-de-privacidad`, ahora que esa página pasa a ser
 * una sección de fábrica (`SECCIONES_POR_AMBITO.sitio`) en vez de las dos rutas
 * hardcodeadas (`/politica-de-privacidad`, `/privacidad`) que tenía antes.
 *
 * Va por migración y no solo por `sembrar:permisos` por lo mismo que `016`/`019`:
 * `server.ts` exige que no haya migraciones pendientes para arrancar, pero nada obliga
 * a correr el sembrador. Sin esto, el botón «Editar» le aparecería a Editor y
 * Administrador (la visibilidad del botón solo mira el rol) pero guardar un borrador
 * les daría 403 — la clave que `requierePermisoDeSeccion()` busca no existiría.
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
  // aquí solo esté uno de los tres.
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
 * La página y su contenido publicado **no se tocan**: son de `paginas`/
 * `paginas_versiones`, ajenas a esta migración. Revertir deja la sección sin nadie
 * que pueda editarla salvo Superadmin (que pasa por bypass), no la hace desaparecer
 * del portal.
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

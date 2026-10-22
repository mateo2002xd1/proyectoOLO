import { QueryInterface } from 'sequelize';

export const nombre = '047-permiso-cambiar-direccion-secciones';

/** Debe coincidir con la clave declarada en `shared/catalogo-permisos.ts`. */
const CLAVE = 'secciones.cambiar-direccion';

/**
 * Roles que estrenan el permiso.
 *
 * Los mismos de `secciones.eliminar` (migración 019) y por la misma razón: son a los que
 * `sembrar-permisos-roles.ts` concede el catálogo entero, así que dárselo aquí no les amplía
 * el alcance. El Editor queda fuera a propósito: cambiar una dirección rompe los enlaces que
 * viven fuera del portal (correos, otros sitios, marcadores) y eso no se arregla desde aquí.
 *
 * Aunque el permiso se conceda a otro rol desde el panel, la API exige además que quien lo use
 * apruebe (`puedePublicar`): reescribir los enlaces de la versión publicada sin pasar por la
 * cola de aprobación equivale a publicar, y la invariante del ciclo editorial es que lo que
 * ve el ciudadano solo cambia al aprobar.
 */
const ROLES = ['Superadmin', 'Administrador'];

/**
 * Da de alta `secciones.cambiar-direccion`, el permiso del botón «Editar dirección».
 *
 * Va por migración y no solo por el sembrador por lo mismo que la 016 y la 019:
 * `server.ts` exige que no haya migraciones pendientes para arrancar, pero nada obliga a
 * correr `sembrar:permisos`. Sin esto, la API pediría un permiso que no existe en la tabla y
 * el botón no le saldría a nadie salvo al superadmin —que pasa por bypass—.
 *
 * Es idempotente: `ON CONFLICT DO NOTHING` sobre la clave única de `permisos`, y el
 * `INSERT ... SELECT` de las asignaciones tampoco duplica.
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
  // encuentra nada. No es un error, los roles los siembra otro script.
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
 * Retira el permiso y sus asignaciones. Las direcciones ya cambiadas no vuelven: revertir
 * quita la capacidad de cambiarlas, no deshace los cambios (quedan en la bitácora).
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

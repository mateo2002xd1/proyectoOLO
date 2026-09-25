import { QueryInterface } from 'sequelize';
import { CATALOGO_PERMISOS } from '../../../shared/catalogo-permisos';

export const nombre = '012-catalogo-permisos';

/**
 * Rehace el catálogo de permisos para que signifique algo.
 *
 * ## El problema
 *
 * Había 21 claves y **ninguna ruta comprobaba ninguna**: toda la autorización iba por
 * rol. El panel dejaba mover interruptores que no cambiaban nada, y peor — se podía
 * «revocar» un permiso y la persona seguía pudiendo hacerlo. Nada mantenía honesto al
 * catálogo, así que se desvió incluso de su propio sembrador, que declara que el Editor
 * no tiene `access_dashboard` cuando en la base sí lo tiene.
 *
 * Además, `editar contenido` no decía **qué** contenido, que era justo lo que había que
 * poder decir: un editor debe poder quedar atado a un ámbito y a secciones concretas.
 *
 * ## Qué desaparece
 *
 * - `create_post`, `edit_post`, `delete_post`, `publish_post` → los sustituyen las claves
 *   por sección (`editar.{ambito}.{slug}`) más `editor.*`.
 * - `access_portal_settings` ≡ `configure_portal` y `view_audit` ≡ `access_audit`:
 *   duplicados exactos, nada en el código los distinguía.
 * - `access_dashboard`, `access_branding`, `access_categories`, `access_trends`,
 *   `access_alerts` → eran secciones del panel, no capacidades. Las cubre `acceso.panel`.
 * - `manage_roles` + `manage_permissions` + `access_users_roles` → `usuarios.permisos`.
 *
 * ## La traducción
 *
 * Es la parte que puede dejar a alguien sin trabajar, así que se hace por equivalencia y
 * no borrando y volviendo a sembrar: **quien tenía `edit_post` recibe las secciones de
 * los ámbitos a los que ya tenía acceso**. Un editor con `acceso.intranet` + `edit_post`
 * sale de aquí con las seis claves de intranet y ninguna de sitio, que es exactamente lo
 * que podía hacer antes. Nadie gana alcance en esta migración; como mucho lo conserva.
 *
 * `down` restituye las claves viejas y sus asignaciones traducidas a la inversa. No
 * puede ser exacto —la información de qué secciones concretas tenía cada rol no existe
 * en el modelo viejo— pero deja el sistema funcionando con el alcance de antes.
 */

/** Claves del catálogo anterior que esta migración retira. */
const CLAVES_OBSOLETAS = [
  'create_post',
  'edit_post',
  'delete_post',
  'publish_post',
  'access_dashboard',
  'access_portal_settings',
  'configure_portal',
  'access_branding',
  'access_categories',
  'access_trends',
  'access_alerts',
  'view_audit',
  'access_audit',
  'access_users_roles',
  'manage_roles',
  'manage_permissions',
  'create_user',
  'edit_user',
  'delete_user',
];

/**
 * Equivalencias directas: clave vieja → clave nueva que la reemplaza.
 *
 * Las de sección no están aquí porque no son uno a uno: `edit_post` se convierte en
 * tantas claves como secciones tenga el ámbito al que el rol ya podía entrar, y eso
 * necesita mirar `acceso.*`. Se resuelve aparte, más abajo.
 */
const EQUIVALENCIAS: Record<string, string> = {
  access_dashboard: 'acceso.panel',
  access_portal_settings: 'acceso.panel',
  configure_portal: 'acceso.panel',
  access_branding: 'acceso.panel',
  access_categories: 'acceso.panel',
  access_trends: 'acceso.panel',
  access_alerts: 'acceso.panel',
  view_audit: 'auditoria.ver',
  access_audit: 'auditoria.ver',
  create_user: 'usuarios.crear',
  edit_user: 'usuarios.editar',
  delete_user: 'usuarios.eliminar',
  access_users_roles: 'usuarios.permisos',
  manage_roles: 'usuarios.permisos',
  manage_permissions: 'usuarios.permisos',
  publish_post: 'editor.enviar-revision',
  delete_post: 'editor.eliminar-bloques',
};

export async function up(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  // 1. Alta de las claves nuevas. Idempotente: la clave es única, así que volver a
  //    correr esto no duplica nada.
  for (const permiso of CATALOGO_PERMISOS) {
    await sql.query(
      `INSERT INTO permisos (id, clave, created_at, updated_at)
       VALUES (gen_random_uuid(), :clave, now(), now())
       ON CONFLICT (clave) DO NOTHING`,
      { replacements: { clave: permiso.clave } }
    );
  }

  // 2. Traducción de las equivalencias uno a uno.
  for (const [vieja, nueva] of Object.entries(EQUIVALENCIAS)) {
    await sql.query(
      `INSERT INTO roles_permisos (rol_id, permiso_id)
       SELECT rp.rol_id, nuevo.id
         FROM roles_permisos rp
         JOIN permisos viejo ON viejo.id = rp.permiso_id AND viejo.clave = :vieja
         JOIN permisos nuevo ON nuevo.clave = :nueva
       ON CONFLICT DO NOTHING`,
      { replacements: { vieja, nueva } }
    );
  }

  /**
   * 3. `edit_post` → las secciones del ámbito al que el rol ya podía entrar.
   *
   * Se cruza contra `acceso.sitio` / `acceso.intranet` para no ampliar el alcance de
   * nadie: quien solo entraba a la intranet sale solo con secciones de intranet. Si un
   * rol tenía `edit_post` sin ningún `acceso.*`, no recibe nada — no podía editar en
   * ninguna parte, porque no llegaba a ninguna.
   */
  for (const permiso of CATALOGO_PERMISOS) {
    if (!permiso.clave.startsWith('editar.')) continue;
    const ambito = permiso.clave.split('.')[1];

    await sql.query(
      `INSERT INTO roles_permisos (rol_id, permiso_id)
       SELECT rp.rol_id, seccion.id
         FROM roles_permisos rp
         JOIN permisos edit ON edit.id = rp.permiso_id AND edit.clave = 'edit_post'
         JOIN permisos seccion ON seccion.clave = :clave
        WHERE EXISTS (
                SELECT 1 FROM roles_permisos acc
                  JOIN permisos pa ON pa.id = acc.permiso_id
                 WHERE acc.rol_id = rp.rol_id AND pa.clave = :claveAcceso
              )
       ON CONFLICT DO NOTHING`,
      { replacements: { clave: permiso.clave, claveAcceso: `acceso.${ambito}` } }
    );
  }

  // 4. Retirada de las obsoletas. El borrado en `permisos` arrastra `roles_permisos`
  //    por la FK, pero se limpia antes de forma explícita para no depender de cómo esté
  //    declarada la cascada.
  await sql.query(
    `DELETE FROM roles_permisos
      WHERE permiso_id IN (SELECT id FROM permisos WHERE clave IN (:claves))`,
    { replacements: { claves: CLAVES_OBSOLETAS } }
  );
  await sql.query(`DELETE FROM permisos WHERE clave IN (:claves)`, {
    replacements: { claves: CLAVES_OBSOLETAS },
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const sql = queryInterface.sequelize;

  // Restituye el catálogo viejo.
  for (const clave of CLAVES_OBSOLETAS) {
    await sql.query(
      `INSERT INTO permisos (id, clave, created_at, updated_at)
       VALUES (gen_random_uuid(), :clave, now(), now())
       ON CONFLICT (clave) DO NOTHING`,
      { replacements: { clave } }
    );
  }

  // Traducción inversa de las equivalencias.
  for (const [vieja, nueva] of Object.entries(EQUIVALENCIAS)) {
    await sql.query(
      `INSERT INTO roles_permisos (rol_id, permiso_id)
       SELECT rp.rol_id, viejo.id
         FROM roles_permisos rp
         JOIN permisos nuevo ON nuevo.id = rp.permiso_id AND nuevo.clave = :nueva
         JOIN permisos viejo ON viejo.clave = :vieja
       ON CONFLICT DO NOTHING`,
      { replacements: { vieja, nueva } }
    );
  }

  // Cualquier clave de sección se convierte de vuelta en el `edit_post` genérico. Se
  // pierde el detalle de qué secciones tenía cada rol: el modelo viejo no sabe
  // expresarlo, y esa es precisamente la razón de esta migración.
  await sql.query(
    `INSERT INTO roles_permisos (rol_id, permiso_id)
     SELECT DISTINCT rp.rol_id, viejo.id
       FROM roles_permisos rp
       JOIN permisos seccion ON seccion.id = rp.permiso_id AND seccion.clave LIKE 'editar.%'
       JOIN permisos viejo ON viejo.clave = 'edit_post'
     ON CONFLICT DO NOTHING`
  );

  const clavesNuevas = CATALOGO_PERMISOS.map((p) => p.clave);
  await sql.query(
    `DELETE FROM roles_permisos
      WHERE permiso_id IN (SELECT id FROM permisos WHERE clave IN (:claves))`,
    { replacements: { claves: clavesNuevas } }
  );
  await sql.query(`DELETE FROM permisos WHERE clave IN (:claves)`, {
    replacements: { claves: clavesNuevas },
  });
}

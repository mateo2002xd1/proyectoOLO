/**
 * El permiso de edición de una sección: se crea la clave `editar.{ambito}.{slug}` (o se reutiliza
 * la que ya hay) y se concede a Administrador, Editor y a los roles que se pidan.
 *
 * Lo usan `crearSeccion` (el botón «Nueva página») y los sembradores de las páginas de la intranet,
 * que ya no están en el catálogo de fábrica (`SECCIONES_POR_AMBITO`) y por eso nadie les crea la
 * clave: sin ella nadie salvo el Superadmin podría editarlas. Una sola implementación para que las
 * dos vías den lo mismo.
 *
 * `findOrCreate` y no `create`: la clave puede existir de una sección que se borró y se vuelve a
 * crear con el mismo nombre, y ahí lo correcto es reutilizarla —conserva a quién se le había
 * concedido— en vez de fallar por clave duplicada.
 */
import type { Transaction } from 'sequelize';
import { Permission, Role, RolePermission } from '../../infrastructure/db/models';
import { claveDeSeccion } from '../../shared/catalogo-permisos';
import { invalidarPermisosDeRol } from '../../shared/permisos-de-rol';
import type { Ambito } from '../../shared/ambito';

/** Los roles que reciben la clave de toda sección nueva, además de quien la crea. */
const ROLES_QUE_EDITAN = ['admin', 'administrador', 'editor'];

export interface PermisoConcedido {
  clavePermiso: string;
  /** Los roles a los que se les concedió, con el nombre tal como está en `roles`. */
  rolesConcedidos: string[];
}

/**
 * Crea la clave de edición de la sección y la concede.
 * @param rolesAdicionales - Roles que se suman a Administrador y Editor (el de quien la crea).
 */
export const concederPermisoDeSeccion = async (
  ambito: Ambito,
  slug: string,
  rolesAdicionales: string[],
  transaction: Transaction
): Promise<PermisoConcedido> => {
  const clavePermiso = claveDeSeccion(ambito, slug);

  const [permiso] = await Permission.findOrCreate({
    where: { name: clavePermiso },
    defaults: { name: clavePermiso },
    transaction,
  });

  const nombresRoles = [...ROLES_QUE_EDITAN];
  for (const rol of rolesAdicionales) {
    const nombre = rol.toLowerCase();
    if (!nombresRoles.includes(nombre)) nombresRoles.push(nombre);
  }

  const todosLosRoles = await Role.findAll({ transaction });
  const rolesParaAsignar = todosLosRoles.filter((rol) => nombresRoles.includes(rol.name.toLowerCase()));

  if (rolesParaAsignar.length > 0) {
    await RolePermission.bulkCreate(
      rolesParaAsignar.map((rol) => ({ role_id: rol.id, permission_id: permiso.id })),
      { ignoreDuplicates: true, transaction }
    );

    for (const rol of rolesParaAsignar) {
      invalidarPermisosDeRol(rol.name);
    }
  }

  return { clavePermiso, rolesConcedidos: rolesParaAsignar.map((rol) => rol.name) };
};

/**
 * Crear una sección desde el editor.
 *
 * Es la operación que convierte «escribir un nombre» en una ruta viva del portal, y
 * toca tres cosas que normalmente solo se tocan desplegando: una fila en `paginas`,
 * una clave en `permisos` y una asignación en `roles_permisos`. Por eso va toda en
 * una transacción — a medias dejaría una sección que existe y nadie puede editar, o
 * un permiso que no corresponde a ninguna página.
 *
 * ## Qué NO hace
 *
 * No publica. La sección nace sin versión, así que su ruta todavía no muestra nada:
 * hay que llenarla, mandarla a revisión y que alguien la apruebe, igual que cualquier
 * cambio (`8-ciclo-editorial.md`). Crear una página en blanco y publicarla de una vez
 * habría saltado la cola de aprobación para dejar una página vacía en el portal, que
 * es lo peor de las dos opciones.
 *
 * No crea el archivo de ruta: no hace falta. El comodín (`[...puckPath]` en intranet,
 * `[slug]` en el sitio) ya pinta cualquier slug que esté en `paginas`, y
 * `configDeEdicion()` ya le da el catálogo completo de bloques a un slug que no
 * reconoce. Esta es la razón de que la funcionalidad quepa en un use-case y no en una
 * generación de código.
 *
 *
 * ## El permiso que se concede
 *
 * La clave nueva se crea en el catálogo y se asigna automáticamente al rol 'admin', 'editor'
 * y al rol de quien crea la sección (para que puedan empezar a editarla sin tener que ir al
 * panel de administración a asignársela).
 */
import {
  slugificar,
  motivoSlugInvalido,
  mensajeDeSlugInvalido,
} from '@olo/slug-policy';
import sequelize from '../../config/database';
import { Pagina, Permission, Role, RolePermission } from '../../infrastructure/db/models';
import { claveDeSeccion } from '../../shared/catalogo-permisos';
import { invalidarPermisosDeRol } from '../../middlewares/require-permission.middleware';
import type { Ambito } from '../../shared/ambito';

/** Error con `status`, que es como el manejador de errores decide el código HTTP. */
const fallo = (mensaje: string, status: number) =>
  Object.assign(new Error(mensaje), { status });

export interface SeccionCreada {
  /** El id de la fila en `paginas`. Es lo que la bitácora guarda como `entidad_id`. */
  id: string;
  slug: string;
  titulo: string;
  ambito: Ambito;
  /** La ruta en la app correspondiente, lista para pegar en un menú. */
  ruta: string;
  /** La clave que se creó. Se devuelve para poder auditarla. */
  clavePermiso: string;
  /** Los roles a los que se les concedió el permiso automáticamente. */
  rolesConcedidos: string[];
}

import { Transaction } from 'sequelize';
import { uuidONulo } from '../../shared/uuid';

/**
 * Crea una sección nueva: calcula su slug, crea la página vacía y su permiso de edición, y concede ese
 * permiso a los roles administrador y editor y al de quien la crea.
 * @throws {Error} 400 sin nombre o con un slug inválido; 409 si la ruta ya existe.
 */
export const crearSeccion = async (
  titulo: string,
  ambito: Ambito,
  userId: string,
  rolDelCreador: string | null,
  tx?: Transaction
): Promise<SeccionCreada> => {
  const nombre = (titulo ?? '').trim();
  if (!nombre) throw fallo('La sección necesita un nombre.', 400);

  // El slug se calcula **aquí** aunque el diálogo ya lo enseñe: lo que llega del
  // navegador es una vista previa, no la autoridad. Los dos usan `@olo/slug-policy`,
  // así que coinciden; si algún día no coincidieran, manda este.
  const slug = slugificar(nombre);

  const motivo = motivoSlugInvalido(slug);
  if (motivo) throw fallo(mensajeDeSlugInvalido(motivo), 400);

  const clavePermiso = claveDeSeccion(ambito, slug);

  const execute = async (transaction: Transaction) => {
    // El índice único es `(ambito, slug)`, así que esto solo choca dentro del mismo
    // ámbito: el sitio y la intranet pueden tener cada uno su «Bolsa de empleo».
    const yaExiste = await Pagina.findOne({ where: { slug, ambito }, transaction });
    if (yaExiste) {
      throw fallo(`Ya existe una sección en la ruta /${slug}. Elige otro nombre.`, 409);
    }

    const pagina = await Pagina.create(
      { slug, ambito, titulo: nombre, creadoPor: uuidONulo(userId) },
      { transaction }
    );

    // `findOrCreate` y no `create`: la clave puede existir ya de una sección que se
    // borró y se vuelve a crear con el mismo nombre, y ahí lo correcto es reutilizarla
    // —conserva a quién se le había concedido— en vez de fallar por clave duplicada.
    const [permiso] = await Permission.findOrCreate({
      where: { name: clavePermiso },
      defaults: { name: clavePermiso },
      transaction,
    });

    // Asignar el permiso automáticamente al creador, admin y editor
    const nombresRoles = ['admin', 'administrador', 'editor'];
    if (rolDelCreador && !nombresRoles.includes(rolDelCreador.toLowerCase())) {
      nombresRoles.push(rolDelCreador.toLowerCase());
    }

    const todosLosRoles = await Role.findAll({ transaction });
    const rolesParaAsignar = todosLosRoles.filter(rol => 
      nombresRoles.includes(rol.name.toLowerCase())
    );

    if (rolesParaAsignar.length > 0) {
      await RolePermission.bulkCreate(
        rolesParaAsignar.map(rol => ({
          role_id: rol.id,
          permission_id: permiso.id,
        })),
        { ignoreDuplicates: true, transaction }
      );

      for (const rol of rolesParaAsignar) {
        invalidarPermisosDeRol(rol.name);
      }
    }

    return { 
      pagina,
      rolesConcedidos: rolesParaAsignar.map(r => r.name)
    };
  };

  const resultado = tx ? await execute(tx) : await sequelize.transaction(execute);

  return {
    id: resultado.pagina.id,
    slug,
    titulo: nombre,
    ambito,
    ruta: `/${slug}`,
    clavePermiso,
    rolesConcedidos: resultado.rolesConcedidos,
  };
};

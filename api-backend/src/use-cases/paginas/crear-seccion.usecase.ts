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
 * ## El permiso que se concede
 *
 * La clave nueva se asigna **al rol de quien crea**, no a la persona: el modelo de
 * permisos es por rol (`roles_permisos`) y no existe la concesión individual. La
 * consecuencia hay que decirla en voz alta, y el diálogo la dice: si quien crea es
 * «Editor», todos los Editores podrán editar esa sección. La alternativa —no conceder
 * nada— dejaba a su creador con un 403 en la página que acababa de crear.
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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const toUUID = (id: string) => (UUID_RE.test(id) ? id : null);

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
  /** La clave que se creó y se concedió. Se devuelve para poder auditarla. */
  clavePermiso: string;
  /** El rol que recibió la clave, o `null` si no hizo falta tocar ninguno. */
  rolConcedido: string | null;
}

export const crearSeccion = async (
  titulo: string,
  ambito: Ambito,
  userId: string,
  rolDelCreador: string | null
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

  const resultado = await sequelize.transaction(async (transaction) => {
    // El índice único es `(ambito, slug)`, así que esto solo choca dentro del mismo
    // ámbito: el sitio y la intranet pueden tener cada uno su «Bolsa de empleo».
    const yaExiste = await Pagina.findOne({ where: { slug, ambito }, transaction });
    if (yaExiste) {
      throw fallo(`Ya existe una sección en la ruta /${slug}. Elige otro nombre.`, 409);
    }

    const pagina = await Pagina.create(
      { slug, ambito, titulo: nombre, creadoPor: toUUID(userId) },
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

    // Superadmin pasa por bypass en `resolverPermisos`, así que no necesita la fila; y
    // un rol que no esté en la tabla no se inventa. En ambos casos la sección queda
    // creada y quien la creó puede editarla.
    let rolConcedido: string | null = null;
    if (rolDelCreador && rolDelCreador.trim().toLowerCase() !== 'superadmin') {
      const rol = await Role.findOne({ where: { name: rolDelCreador }, transaction });
      if (rol) {
        await RolePermission.findOrCreate({
          where: { role_id: rol.id, permission_id: permiso.id },
          transaction,
        });
        rolConcedido = rolDelCreador;
      }
    }

    return { pagina, rolConcedido };
  });

  // Fuera de la transacción a propósito: la caché solo se debe olvidar cuando el
  // cambio está confirmado. Sin esto, quien acaba de crear la sección arrastraría sus
  // permisos viejos hasta 30 segundos y se comería un 403 en su propia página.
  if (resultado.rolConcedido) invalidarPermisosDeRol(resultado.rolConcedido);

  return {
    id: resultado.pagina.id,
    slug,
    titulo: nombre,
    ambito,
    ruta: `/${slug}`,
    clavePermiso,
    rolConcedido: resultado.rolConcedido,
  };
};

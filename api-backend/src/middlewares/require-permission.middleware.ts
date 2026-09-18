import { Request, Response, NextFunction } from 'express';
import { RolePermissionRepository } from '../repositories/role-permissions.repository';
import { marcarGuardia } from '../shared/autorizacion';
import { claveDeSeccion } from '../shared/catalogo-permisos';
import { esSeccionConocida } from '../use-cases/paginas/secciones.usecase';
import { AMBITO_HEADER, resolverAmbito } from '../shared/ambito';

/**
 * Comprobación de permisos contra `roles_permisos`.
 *
 * Este middleware llevaba escrito desde el principio **sin que ninguna ruta lo usara**:
 * era el hallazgo de auditoría «RBAC definido en base de datos pero nunca aplicado en
 * código». Ahora es quien decide qué secciones puede editar cada rol.
 */

const cache = new Map<string, { perms: string[]; expires: number }>();

/**
 * TTL corto, y solo como red.
 *
 * El mecanismo principal para que un cambio de permisos surta efecto **de inmediato** es
 * `invalidarPermisosDeRol`, que se llama al escribir. Este vencimiento existe para el
 * caso de varias instancias de la API: una caché en memoria no se entera de lo que
 * escribió otro proceso, así que sin él la otra instancia podría quedarse con permisos
 * viejos indefinidamente. Con un solo proceso —lo que hay hoy— no llega a usarse.
 *
 * Antes eran cinco minutos. Para un control de acceso es demasiado: revocar un permiso y
 * que la persona siguiera usándolo un rato no se puede explicar ni en el panel.
 */
const TTL_MS = 30 * 1000;

/**
 * Olvida los permisos cacheados de un rol, o de todos si no se indica ninguno.
 *
 * La llaman los dos únicos caminos que tocan `roles_permisos` —asignar y revocar— y las
 * operaciones sobre roles que dejan la clave huérfana (renombrar, borrar). Es lo que
 * hace que el cambio se note en la petición siguiente y no al cabo de un rato.
 */
export function invalidarPermisosDeRol(rol?: string | null): void {
  if (rol == null) {
    cache.clear();
    return;
  }
  cache.delete(rol);
  // El nombre del rol viaja en el JWT tal cual está en la tabla, pero un renombrado
  // podría dejar variantes; limpiar por comparación laxa evita dejar una entrada viva
  // con otro uso de mayúsculas.
  const normalizado = rol.trim().toLowerCase();
  for (const clave of cache.keys()) {
    if (clave.trim().toLowerCase() === normalizado) cache.delete(clave);
  }
}

/** Permisos de un rol, de la caché o de la base. */
const permisosDe = async (rol: string): Promise<string[]> => {
  const entrada = cache.get(rol);
  if (entrada && entrada.expires >= Date.now()) return entrada.perms;

  const perms = await RolePermissionRepository.getPermissionsByRole(rol);
  cache.set(rol, { perms, expires: Date.now() + TTL_MS });
  return perms;
};

/**
 * Resuelve rol y permisos de la petición, o responde el error que corresponda.
 *
 * Devuelve `null` cuando ya escribió la respuesta, para que quien llama solo tenga que
 * cortar. Superadmin no consulta nada: su bypass es anterior a cualquier catálogo y
 * quitarlo dejaría el sistema sin nadie capaz de repararse a sí mismo.
 */
const resolverPermisos = async (
  req: Request,
  res: Response
): Promise<{ perms: string[] } | null | 'superadmin'> => {
  if (!req.user) {
    res.status(401).json({ error: 'No autenticado' });
    return null;
  }

  const rol = req.user.role;
  if (!rol) {
    res.status(403).json({ error: 'Permiso denegado' });
    return null;
  }

  if (rol.trim().toLowerCase() === 'superadmin') return 'superadmin';

  return { perms: await permisosDe(rol) };
};

/** Exige un permiso de clave fija. */
export function requirePermission(permissionName: string) {
  return marcarGuardia(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const resultado = await resolverPermisos(req, res);
        if (resultado === null) return;
        if (resultado === 'superadmin') return next();

        if (!resultado.perms.includes(permissionName)) {
          return res.status(403).json({ error: 'Permiso denegado' });
        }
        next();
      } catch (error) {
        next(error);
      }
    },
    `permiso.${permissionName}`
  );
}

/**
 * Exige el permiso de **la sección que se está editando**.
 *
 * La clave no se puede fijar al declarar la ruta: depende de `req.params.slug` y del
 * ámbito, que llegan con la petición. Por eso existe esta variante en vez de reutilizar
 * `requirePermission` con una cadena.
 *
 * Es lo que ata a un editor a secciones concretas: con `editar.intranet.tasa` y nada más,
 * `POST /api/paginas/inicio/borrador` con `X-Ambito: intranet` responde 403 aunque su rol
 * sea Editor y `requierePermisoPagina('puedeEditar')` le haya dejado pasar. Las dos capas
 * conviven a propósito — el rol dice *si edita*, el permiso dice *qué*.
 *
 * Un slug que no está en el catálogo de secciones se rechaza con 404: no es que falte
 * permiso, es que no hay tal sección editable, y decir «permiso denegado» sugeriría que
 * existe.
 */
export function requierePermisoDeSeccion() {
  return marcarGuardia(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const ambito = resolverAmbito(req.header(AMBITO_HEADER));
        const slug = String(req.params.slug ?? '');

        // Antes esto consultaba una lista fija en código. Ahora también mira `paginas`,
        // porque una sección creada desde el editor existe sin estar en esa lista y su
        // propio creador se comía un 404 al ir a llenarla.
        if (!(await esSeccionConocida(ambito, slug))) {
          return res.status(404).json({ error: 'Sección no encontrada' });
        }

        const resultado = await resolverPermisos(req, res);
        if (resultado === null) return;
        if (resultado === 'superadmin') return next();

        const permisoAcceso = ambito === 'sitio' ? 'acceso.sitio' : 'acceso.intranet';
        if (!resultado.perms.includes(permisoAcceso)) {
          return res.status(403).json({
            error: `No tienes acceso a ${ambito}, por tanto no puedes editar sus secciones.`,
          });
        }

        if (!resultado.perms.includes(claveDeSeccion(ambito, slug))) {
          return res.status(403).json({
            error: 'No tienes permiso para editar esta sección',
          });
        }
        next();
      } catch (error) {
        next(error);
      }
    },
    'permiso.seccion'
  );
}

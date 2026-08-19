import { Request, Response, NextFunction } from 'express';
import { paginasPolicies, type PermisoPagina } from '../policies/paginas.policies';
import { auditoriaPolicies, type PermisoAuditoria } from '../policies/auditoria.policies';
import { usuariosPolicies, type PermisoUsuario } from '../policies/usuarios.policies';
import { contenidosPolicies, type PermisoContenido } from '../policies/contenidos.policies';
import { marcarGuardia } from '../shared/autorizacion';

/**
 * Construye el middleware que exige un permiso de una familia de policies.
 *
 * Los cuatro de abajo tenían el mismo cuerpo palabra por palabra —comprobar sesión,
 * consultar la policy, 401 o 403— y la única diferencia era de qué objeto sale la
 * función. Con cuatro copias, cualquier arreglo al contrato (un mensaje, un código de
 * estado, la marca que lee el verificador) había que acordarse de hacerlo cuatro veces.
 *
 * Sin sesión responde 401 y no 403 a propósito: el problema es que no hay sesión, no
 * que falten permisos.
 *
 * Esta es la verificación que manda. Que un botón no se pinte en el frontend es
 * comodidad visual, no seguridad.
 */
const construirGuardia = <P extends string>(
  familia: string,
  policies: Record<P, (rol?: string | null) => boolean>
) => {
  return (permiso: P) =>
    marcarGuardia(
      (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) return res.status(401).json({ error: 'No autenticado' });

        if (!policies[permiso](req.user.role)) {
          return res.status(403).json({ error: 'No tienes permisos para esta acción' });
        }

        next();
      },
      `${familia}.${permiso}`
    );
};

/**
 * Exige un permiso de páginas sobre el rol del usuario autenticado.
 *
 * Va siempre después de `requireAuth`, que es quien pone `req.user`.
 */
export const requierePermisoPagina = construirGuardia<PermisoPagina>('paginas', paginasPolicies);

/**
 * Exige permiso de auditoría sobre el rol del usuario autenticado.
 *
 * Existe por separado porque la bitácora no es una entidad de contenido: quién puede
 * leerla no se deduce de quién puede editarla — de hecho es casi lo contrario (ver
 * `auditoria.policies.ts`).
 */
export const requierePermisoAuditoria = construirGuardia<PermisoAuditoria>(
  'auditoria',
  auditoriaPolicies
);

/**
 * Exige permiso sobre cuentas o sobre la configuración de seguridad.
 *
 * Estas rutas (`/api/users`, `/api/roles`, `/api/permissions`, `/api/role-permissions`)
 * no tenían **ningún** filtro después de `requireAuth`, que es el
 * agujero más grave que había: por ahí cualquier sesión se ascendía a Superadmin y a
 * partir de ahí pasaba todos los demás controles.
 */
export const requierePermisoUsuario = construirGuardia<PermisoUsuario>(
  'usuarios',
  usuariosPolicies
);

/**
 * Exige permiso sobre contenidos, adjuntos o secciones.
 *
 * Ojo con lo que **no** hace: no mira de quién es el contenido. La edición es
 * colaborativa a propósito y la comprobación de autoría, donde aplica (borrar, leer lo
 * no publicado), vive en el caso de uso, que es quien tiene la fila delante.
 */
export const requierePermisoContenido = construirGuardia<PermisoContenido>(
  'contenidos',
  contenidosPolicies
);

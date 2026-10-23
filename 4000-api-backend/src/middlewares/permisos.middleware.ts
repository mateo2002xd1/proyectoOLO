import { Request, Response, NextFunction } from 'express';
import { paginasPolicies, type PermisoPagina } from '../policies/paginas.policies';
import { auditoriaPolicies, type PermisoAuditoria } from '../policies/auditoria.policies';
import { usuariosPolicies, type PermisoUsuario } from '../policies/usuarios.policies';
import { observatorioPolicies, type PermisoObservatorio } from '../policies/observatorio.policies';
import { alertasInversionPolicies, type PermisoAlertasInversion } from '../policies/alertas-inversion.policies';
import { marcarGuardia } from '../shared/autorizacion';
import { AMBITO_HEADER, resolverAmbito } from '../shared/ambito';
import { requireAuth } from './auth.middleware';

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
  policies: Record<P, (user?: any) => boolean>
) => {
  return (permiso: P) =>
    marcarGuardia(
      (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) return res.status(401).json({ error: 'No autenticado' });

        if (!policies[permiso](req.user)) {
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
 * Las lecturas «públicas» de páginas lo son solo en el sitio: en la intranet exigen sesión.
 *
 * `/paginas/publica/:slug`, `/indice-busqueda`, `/titulos` y el registro de visitas están
 * antes de `requireAuth` porque el sitio es público. Pero el ámbito lo elige quien
 * pregunta, con una cabecera, así que `X-Ambito: intranet` sin sesión devolvía el
 * contenido publicado de la intranet, su índice de búsqueda con los textos y los títulos
 * de todas sus páginas (y el registro de visitas confirmaba qué páginas existían y cuántas
 * visitas tenían). Los adjuntos de la intranet ya exigían sesión; el contenido no.
 *
 * Con ámbito `sitio` (o sin cabecera, que cae ahí) no hace nada. Con `intranet` exige
 * sesión y poder ver la intranet (`puedeVer`), igual que `/api/archivos/intranet`.
 *
 * Va **antes** de la caché de la ruta: la caché va por ámbito y no por persona, y una
 * respuesta guardada para la intranet solo debe poder servirse a quien ya pasó por aquí.
 * Marca la respuesta `private, no-store` para que ningún proxy la guarde.
 *
 * `leerAmbito` existe porque el registro de visitas acepta el ámbito también en el cuerpo.
 */
export const requiereSesionSiEsIntranet = (
  leerAmbito: (req: Request) => unknown = (req) => req.header(AMBITO_HEADER)
) =>
  marcarGuardia(
    (req: Request, res: Response, next: NextFunction) => {
      if (resolverAmbito(leerAmbito(req)) !== 'intranet') return next();

      res.setHeader('Cache-Control', 'private, no-store');
      void requireAuth(req, res, (error?: unknown) => {
        if (error) return next(error);
        return requierePermisoPagina('puedeVer')(req, res, next);
      });
    },
    'paginas.sesionSiEsIntranet'
  );

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
 * Exige permiso sobre las cargas de datos de "Actualizaciones" (panel de
 * administración). Solo Administrador y Superadmin — no hay editor en este flujo.
 */
export const requierePermisoObservatorio = construirGuardia<PermisoObservatorio>(
  'observatorio',
  observatorioPolicies
);

/**
 * Exige permiso sobre las cargas y altas manuales de "Alertas de inversión"
 * (panel de administración). Solo Administrador y Superadmin.
 */
export const requierePermisoAlertasInversion = construirGuardia<PermisoAlertasInversion>(
  'alertasInversion',
  alertasInversionPolicies
);

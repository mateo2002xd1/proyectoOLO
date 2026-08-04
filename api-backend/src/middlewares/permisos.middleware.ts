import { Request, Response, NextFunction } from 'express';
import { paginasPolicies, type PermisoPagina } from '../policies/paginas.policies';
import { auditoriaPolicies, type PermisoAuditoria } from '../policies/auditoria.policies';

/**
 * Exige un permiso de páginas sobre el rol del usuario autenticado.
 *
 * Va siempre después de `requireAuth`, que es quien pone `req.user`. Sin usuario
 * responde 401 en vez de 403: el problema es que no hay sesión, no que falten
 * permisos.
 *
 * Esta es la verificación que manda. Que un botón de editar no se pinte en el
 * frontend es comodidad visual, no seguridad.
 */
export const requierePermisoPagina = (permiso: PermisoPagina) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'No autenticado' });

    if (!paginasPolicies[permiso](req.user.role)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }

    next();
  };
};

/**
 * Exige permiso de auditoría sobre el rol del usuario autenticado.
 *
 * Mismo contrato que el de páginas: va después de `requireAuth` y responde 401 si
 * no hay sesión, 403 si el rol no alcanza. Existe por separado porque la bitácora
 * no es una entidad de contenido: quién puede leerla no se deduce de quién puede
 * editarla — de hecho es casi lo contrario (ver `auditoria.policies.ts`).
 */
export const requierePermisoAuditoria = (permiso: PermisoAuditoria) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'No autenticado' });

    if (!auditoriaPolicies[permiso](req.user.role)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }

    next();
  };
};

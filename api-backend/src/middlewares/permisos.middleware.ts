import { Request, Response, NextFunction } from 'express';
import { paginasPolicies, type PermisoPagina } from '../policies/paginas.policies';

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

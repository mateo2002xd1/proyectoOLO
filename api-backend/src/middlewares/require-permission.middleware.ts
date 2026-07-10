import { Request, Response, NextFunction } from 'express';
import { RolePermissionRepository } from '../repositories/role-permissions.repository';

// Cache de permisos por rol con TTL
const cache = new Map<string, { perms: string[]; expires: number }>();
const TTL_MS = 5 * 60 * 1000;

export function requirePermission(permissionName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const role = req.user.role;
    if (!role) {
      return res.status(403).json({ error: 'Permiso denegado' });
    }

    // Superadmin bypass
    if (role === 'Superadmin') {
      return next();
    }

    let entry = cache.get(role);

    if (!entry || entry.expires < Date.now()) {
      try {
        const perms = await RolePermissionRepository.getPermissionsByRole(role);
        entry = { perms, expires: Date.now() + TTL_MS };
        cache.set(role, entry);
      } catch (error) {
        return next(error);
      }
    }

    if (!entry.perms.includes(permissionName)) {
      return res.status(403).json({ error: 'Permiso denegado' });
    }
    next();
  };
}

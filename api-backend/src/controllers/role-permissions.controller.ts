import { Request, Response, NextFunction } from 'express';
import {
  getAllRolePermissions,
  getByRole,
  assignPermission,
  revokePermission,
} from '../use-cases/usuarios/role-permissions.usecase';

export const RolePermissionController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try { res.json(await getAllRolePermissions()); } catch (err) { next(err); }
  },
  async getByRole(req: Request, res: Response, next: NextFunction) {
    try { res.json(await getByRole(req.params.roleId as string)); } catch (err) { next(err); }
  },
  async assign(req: Request, res: Response, next: NextFunction) {
    try {
      const { role_id, permission_id } = req.body;
      const result = await assignPermission(role_id, permission_id);
      res.status(result.created ? 201 : 200).json(result);
    } catch (err) { next(err); }
  },
  async revoke(req: Request, res: Response, next: NextFunction) {
    try {
      const role_id = req.body?.role_id || req.query?.role_id;
      const permission_id = req.body?.permission_id || req.query?.permission_id;
      if (!role_id || !permission_id)
        return res.status(400).json({ error: 'role_id y permission_id son requeridos' });
      res.json(await revokePermission(role_id, permission_id));
    } catch (err) { next(err); }
  },
};

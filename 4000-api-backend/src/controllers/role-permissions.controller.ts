import { Request, Response, NextFunction } from 'express';
import {
  getAllRolePermissions,
  getByRole,
  assignPermission,
  revokePermission,
} from '../use-cases/usuarios/role-permissions.usecase';
import { logAudit } from '../use-cases/auditoria/audit.usecase';
import { datosDeAuditoria } from '../shared/auditoria-request';

/**
 * Asignar o revocar un permiso se registra como `actualizar` **sobre el rol**, no
 * sobre una entidad propia: el `CHECK` de la migración 006 no admite un tipo
 * `permiso`, y además la pregunta que se le hace a una auditoría es "qué le pasó a
 * este rol", no "qué le pasó a esta fila de la tabla puente".
 */
const registrarPermisoDeRol = (
  req: Request,
  rolId: string | undefined,
  campo: 'permiso_asignado' | 'permiso_revocado',
  permiso: string
) => {
  if (!rolId) return Promise.resolve();

  return logAudit({
    ...datosDeAuditoria(req),
    entidadId: rolId,
    entidadTipo: 'rol',
    accion: 'actualizar',
    camposModificados: [
      {
        campo,
        antes: campo === 'permiso_asignado' ? 'no asignado' : permiso,
        despues: campo === 'permiso_asignado' ? permiso : 'no asignado',
      },
    ],
  });
};

export const RolePermissionController = {
  /** Lista todas las asignaciones de permisos a roles. */
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try { res.json(await getAllRolePermissions()); } catch (err) { next(err); }
  },
  /** Lista los permisos asignados a un rol. */
  async getByRole(req: Request, res: Response, next: NextFunction) {
    try { res.json(await getByRole(req.params.roleId as string)); } catch (err) { next(err); }
  },
  /** Asigna un permiso a un rol (201 si es nuevo, 200 si ya lo tenía). */
  async assign(req: Request, res: Response, next: NextFunction) {
    try {
      const { role_id, permission_id } = req.body;
      const result = await assignPermission(role_id, permission_id);
      // Solo se registra si de verdad se creó la asignación: repetir la petición no
      // cambia nada y no debería ensuciar la bitácora con un permiso "otorgado" dos veces.
      if (result.created) {
        await registrarPermisoDeRol(req, role_id, 'permiso_asignado', result.permiso);
      }
      res.status(result.created ? 201 : 200).json(result);
    } catch (err) { next(err); }
  },
  /** Quita un permiso a un rol y lo registra en la bitácora. */
  async revoke(req: Request, res: Response, next: NextFunction) {
    try {
      const role_id = req.body?.role_id || req.query?.role_id;
      const permission_id = req.body?.permission_id || req.query?.permission_id;
      if (!role_id || !permission_id)
        return res.status(400).json({ error: 'role_id y permission_id son requeridos' });

      const result = await revokePermission(role_id, permission_id);
      await registrarPermisoDeRol(req, role_id, 'permiso_revocado', result.permiso);
      res.json(result);
    } catch (err) { next(err); }
  },
};

import { AuditRepository } from '../../repositories/auditoria.repository';

export const logAudit = (data: any) => {
  AuditRepository.create({
    entidad_id: data.contentId,
    entidad_tipo: data.contentType || 'contenido',
    usuario_id: data.userId || null,
    usuario_nombre: data.userName || null,
    accion: data.actionType,
    campos_modificados: data.modifiedFields || [],
    ip: data.ip || null,
    user_agent: data.userAgent || null,
  });
};

export const getAuditByContentId = (contentId: string, contentType?: string) =>
  AuditRepository.findByContentId(contentId, contentType);

export const getAllAudit = (params: any) => AuditRepository.findAll(params);

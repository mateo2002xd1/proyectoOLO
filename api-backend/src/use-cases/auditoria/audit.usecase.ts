import { AuditRepository } from '../../repositories/auditoria.repository';

export const logAudit = (data: any) => {
  AuditRepository.create({
    content_id: data.contentId,
    content_type: data.contentType || 'post',
    user_id: data.userId || null,
    user_name: data.userName || null,
    action_type: data.actionType,
    modified_fields: data.modifiedFields || [],
    created_at: new Date(),
  });
};

export const getAuditByContentId = (contentId: string, contentType?: string) =>
  AuditRepository.findByContentId(contentId, contentType);

export const getAllAudit = (params: any) => AuditRepository.findAll(params);

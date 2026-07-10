import { AuditRepository } from '../../../repositories/auditoria.repository';

export interface AuditEventData {
  contentId: string;
  contentType: string;
  userId: string | null;
  userName: string | null;
  actionType: string;
  modifiedFields: any[];
}

export const auditoriaListener = (data: AuditEventData) => {
  try {
    AuditRepository.create({
      content_id: data.contentId,
      content_type: data.contentType,
      user_id: data.userId,
      user_name: data.userName,
      action_type: data.actionType,
      modified_fields: data.modifiedFields,
    });
  } catch (error) {
    console.error('Error al registrar auditoría:', error);
  }
};

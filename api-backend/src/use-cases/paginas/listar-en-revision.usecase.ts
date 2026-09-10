import { PaginaRepository } from '../../repositories/pagina.repository';
import { ContentAuditLog } from '../../infrastructure/db/models';
import { Op } from 'sequelize';

/**
 * Páginas esperando aprobación, de las dos aplicaciones.
 *
 * No se filtra por ámbito a propósito: quien aprueba trabaja desde el panel del
 * sitio y necesita ver ahí también lo que envían los editores de la intranet. Cada
 * elemento lleva su `ambito` para que al aprobar o rechazar se actúe sobre la
 * página correcta — el mismo slug existe en las dos aplicaciones.
 */
export const listarEnRevision = async () => {
  const versiones = await PaginaRepository.listarEnRevision();

  // Si alguna versión no tiene autor directo ni creador de página enlazado (ej. registros previos o seeds),
  // buscamos en la bitácora de auditoría el nombre de usuario que envió a revisión o guardó el borrador.
  const paginasSinAutor = versiones
    .filter((v) => !v.autor && !v.pagina?.creador)
    .map((v) => v.paginaId)
    .filter(Boolean);

  const logsPorPagina = new Map<string, string>();
  if (paginasSinAutor.length > 0) {
    try {
      const logs = await ContentAuditLog.findAll({
        where: {
          entidad_id: { [Op.in]: paginasSinAutor },
          accion: { [Op.in]: ['enviar_revision', 'guardar_borrador', 'crear'] },
          usuario_nombre: { [Op.ne]: null },
        },
        order: [['created_at', 'DESC']],
      });
      for (const log of logs) {
        if (log.usuario_nombre && !logsPorPagina.has(log.entidad_id)) {
          logsPorPagina.set(log.entidad_id, log.usuario_nombre);
        }
      }
    } catch {
      // Si la consulta de auditoría falla, continúa con los datos disponibles
    }
  }

  return versiones.map((v) => {
    const usuarioRelacionado = v.autor || v.pagina?.creador;
    let nombreCompleto: string | null = null;
    let email: string | null = null;
    let id: string | null = null;

    if (usuarioRelacionado) {
      nombreCompleto =
        [usuarioRelacionado.name, usuarioRelacionado.apellidos].filter(Boolean).join(' ').trim() ||
        usuarioRelacionado.name;
      email = usuarioRelacionado.email;
      id = usuarioRelacionado.id;
    } else if (logsPorPagina.has(v.paginaId)) {
      nombreCompleto = logsPorPagina.get(v.paginaId) || null;
    }

    return {
      id: v.id,
      paginaId: v.paginaId,
      titulo: v.pagina?.titulo,
      slug: v.pagina?.slug,
      ambito: v.pagina?.ambito,
      numeroVersion: v.numeroVersion,
      creadoEn: v.creadoEn,
      autor: nombreCompleto
        ? {
            id: id || '',
            nombre: nombreCompleto,
            email: email || '',
          }
        : null,
    };
  });
};

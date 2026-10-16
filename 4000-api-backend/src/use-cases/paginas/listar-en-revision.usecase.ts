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

  // Consultamos en la bitácora de auditoría la fecha exacta del envío ('enviar_revision')
  // y el autor si la versión no lo tiene enlazado directamente.
  const todasPaginaIds = versiones.map((v) => v.paginaId).filter(Boolean);
  const logsPorPagina = new Map<string, string>();
  const fechasEnvio = new Map<string, Date>();

  if (todasPaginaIds.length > 0) {
    try {
      const logs = await ContentAuditLog.findAll({
        where: {
          entidad_id: { [Op.in]: todasPaginaIds },
          accion: { [Op.in]: ['enviar_revision', 'guardar_borrador', 'autoguardar_borrador', 'crear'] },
        },
        order: [['created_at', 'DESC']],
      });

      for (const log of logs) {
        if (log.usuario_nombre && !logsPorPagina.has(log.entidad_id)) {
          logsPorPagina.set(log.entidad_id, log.usuario_nombre);
        }

        if (log.accion === 'enviar_revision') {
          const campoVersion = log.campos_modificados?.find((c: any) => c.campo === 'version');
          const numVer = campoVersion?.despues;
          const clave = numVer !== undefined && numVer !== null ? `${log.entidad_id}:${numVer}` : log.entidad_id;
          const fechaLog = (log as any).createdAt || log.created_at || (log as any).dataValues?.createdAt;
          if (fechaLog) {
            if (!fechasEnvio.has(clave)) {
              fechasEnvio.set(clave, fechaLog);
            }
            if (!fechasEnvio.has(log.entidad_id)) {
              fechasEnvio.set(log.entidad_id, fechaLog);
            }
          }
        }
      }
    } catch {
      // Si la consulta de auditoría falla, continúa con los datos disponibles
    }
  }

  // Ordenamos para que las páginas enviadas más recientemente aparezcan primero
  versiones.sort((a, b) => {
    const fA = fechasEnvio.get(`${a.paginaId}:${a.numeroVersion}`) || fechasEnvio.get(a.paginaId) || a.creadoEn;
    const fB = fechasEnvio.get(`${b.paginaId}:${b.numeroVersion}`) || fechasEnvio.get(b.paginaId) || b.creadoEn;
    return new Date(fB).getTime() - new Date(fA).getTime();
  });

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

    const fechaEnvio =
      fechasEnvio.get(`${v.paginaId}:${v.numeroVersion}`) ||
      fechasEnvio.get(v.paginaId) ||
      v.creadoEn;

    return {
      id: v.id,
      paginaId: v.paginaId,
      titulo: v.pagina?.titulo,
      slug: v.pagina?.slug,
      ambito: v.pagina?.ambito,
      numeroVersion: v.numeroVersion,
      // Lo que quien editó dice que cambió: es lo primero que necesita leer quien
      // va a aprobar o rechazar, antes incluso de abrir la vista previa.
      comentario: v.comentarioCambios ?? null,
      creadoEn: fechaEnvio,
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

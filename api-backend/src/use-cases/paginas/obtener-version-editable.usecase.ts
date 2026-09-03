import { Op } from 'sequelize';
import { PaginaRepository } from '../../repositories/pagina.repository';
import { PaginaVersion } from '../../infrastructure/db/models';
import type { Ambito } from '../../shared/ambito';
import { adaptarRutasParaVistaPreviaArchivada } from '../../shared/storage/backup-uploads.service';

const EMPTY_CONTENIDO = { content: [], root: { props: {} } };

/**
 * Devuelve el contenido editable de una página para el editor visual.
 *
 * A diferencia de obtenerPaginaPublica (que solo expone la versión publicada),
 * aquí se toma la versión activa para editar (borrador activo o la versión publicada).
 * NUNCA se toma una versión en estado 'archivado' por defecto. Al restaurar un
 * respaldo, la versión restaurada pasa a ser 'publicado', por lo que el editor
 * siempre tomará esa versión publicada activa para trabajar sobre ella.
 */
export const obtenerVersionEditable = async (
  slug: string,
  ambito: Ambito,
  criterioVersion?: { versionId?: string; numeroVersion?: number } | string
) => {
  const versionId = typeof criterioVersion === 'string' ? criterioVersion : criterioVersion?.versionId;
  const numeroVersion = typeof criterioVersion === 'object' ? criterioVersion?.numeroVersion : undefined;

  const pagina = await PaginaRepository.findBySlug(slug, ambito);
  if (!pagina) {
    return {
      slug,
      titulo: slug,
      contenido: EMPTY_CONTENIDO,
      estado: null,
      versionId: null,
      numeroVersion: null,
      motivoRechazo: null,
    };
  }

  // Consulta asegurando integridad relacional con pagina.id
  let version = null;
  if (versionId) {
    version = await PaginaVersion.findOne({ where: { id: versionId, paginaId: pagina.id } });
  } else if (numeroVersion) {
    version = await PaginaVersion.findOne({ where: { paginaId: pagina.id, numeroVersion } });
  } else {
    // 1. Buscar si hay una versión borrador, en_revisión o rechazada activa
    const versionPendiente = await PaginaVersion.findOne({
      where: {
        paginaId: pagina.id,
        estado: { [Op.in]: ['borrador', 'en_revision', 'rechazado'] },
      },
      order: [['numeroVersion', 'DESC']],
    });

    // 2. Obtener la versión actualmente publicada
    let versionPublicada = null;
    if (pagina.versionPublicadaId) {
      versionPublicada = await PaginaVersion.findOne({
        where: { id: pagina.versionPublicadaId, paginaId: pagina.id, estado: 'publicado' },
      });
    }
    if (!versionPublicada) {
      versionPublicada = await PaginaVersion.findOne({
        where: { paginaId: pagina.id, estado: 'publicado' },
        order: [['publicadoEn', 'DESC'], ['numeroVersion', 'DESC']],
      });
    }

    // 3. Determinar la versión a editar:
    // Nunca debe ser una versión archivada. La edición siempre se trabaja sobre la publicada,
    // a menos que exista un borrador posterior a la fecha de publicación actual.
    if (versionPendiente && versionPublicada) {
      const fechaBorrador = new Date(versionPendiente.creadoEn).getTime();
      const fechaPublicacion = new Date(versionPublicada.publicadoEn || 0).getTime();
      if (fechaBorrador >= fechaPublicacion && versionPendiente.numeroVersion > versionPublicada.numeroVersion) {
        version = versionPendiente;
      } else {
        version = versionPublicada;
      }
    } else if (versionPublicada) {
      version = versionPublicada;
    } else if (versionPendiente) {
      version = versionPendiente;
    } else {
      // Fallback para secciones nuevas sin publicar: última versión que NO esté archivada
      version = await PaginaVersion.findOne({
        where: {
          paginaId: pagina.id,
          estado: { [Op.ne]: 'archivado' },
        },
        order: [['numeroVersion', 'DESC']],
      });
    }
  }
  if (!version) {
    return {
      slug: pagina.slug,
      titulo: pagina.titulo,
      contenido: EMPTY_CONTENIDO,
      estado: null,
      versionId: null,
      numeroVersion: null,
      motivoRechazo: null,
    };
  }

  let contenido = version.contenido as any;
  if (Array.isArray(contenido)) {
    contenido = { content: contenido, root: { props: {} } };
  } else if (!contenido || !contenido.content) {
    contenido = EMPTY_CONTENIDO;
  }

  // Si la versión devuelta es un respaldo archivado, validar los recursos físicos
  // en la carpeta de backup (/public/backend/{paginaId}) y adaptar dinámicamente
  // las rutas para que la vista previa cargue los archivos resguardados correctamente.
  if (version.estado === 'archivado') {
    contenido = adaptarRutasParaVistaPreviaArchivada(contenido, pagina.id, ambito);
  }

  return {
    slug: pagina.slug,
    titulo: pagina.titulo,
    paginaId: pagina.id,
    contenido,
    estado: version.estado,
    versionId: version.id,
    numeroVersion: version.numeroVersion,
    // El motivo viaja con la versión porque el editor tiene que leerlo justo
    // aquí: es la única explicación de por qué su trabajo volvió a borrador, y
    // la bitácora de auditoría —donde también queda— no la puede ver un editor.
    motivoRechazo: version.estado === 'rechazado' ? version.motivoRechazo ?? null : null,
  };
};

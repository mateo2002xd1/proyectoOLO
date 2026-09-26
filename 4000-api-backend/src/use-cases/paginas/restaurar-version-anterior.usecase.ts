import { Op } from 'sequelize';
import sequelize from '../../config/database';
import { Pagina, PaginaVersion, User } from '../../infrastructure/db/models';
import { PaginaRepository } from '../../repositories/pagina.repository';
import { emitirContenidoPublicado } from '../../domain-events/paginas/contenido-publicado.event';
import type { Ambito } from '../../shared/ambito';
import { restaurarArchivosDesdeBackup } from '../../infrastructure/storage/backup-uploads.service';
import { extraerRutasUploads } from '../../shared/rutas-uploads-en-contenido';
import { logAudit, type ContextoAuditoria } from '../auditoria/audit.usecase';
import { MOTIVO_DE_ARCHIVADO } from '../../shared/auditoria-resumen';
import { sanitizarContenidoPuck } from '../../shared/sanitizar-contenido';
import { BloqueoEdicionRepository } from '../../repositories/bloqueo-edicion.repository';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const toUUID = (id?: string | null) => (id && UUID_RE.test(id) ? id : null);

export async function restaurarVersionAnterior(
  slugOId: string,
  userId?: string,
  ambito: Ambito = 'intranet',
  criterioVersion?: { versionId?: string; numeroVersion?: number },
  contextoAuditoria?: ContextoAuditoria
) {
  const esUUID = UUID_RE.test(slugOId);
  const pagina = esUUID
    ? await Pagina.findByPk(slugOId)
    : await PaginaRepository.findBySlug(slugOId, ambito);

  if (!pagina) {
    throw new Error(`Página con identificador "${slugOId}" no encontrada en el ámbito "${ambito}"`);
  }

  // 0. Verificar que nadie está editando la página en este momento
  const dueño = await BloqueoEdicionRepository.vigente(ambito, pagina.slug);
  if (dueño) {
    const error = new Error(`No se puede restaurar la página porque está siendo editada por ${dueño.usuario_nombre}`);
    (error as any).status = 409;
    (error as any).code = 'PAGE_LOCKED';
    throw error;
  }

  // 1. Obtener la versión actualmente publicada de esta página
  const versionPublicada = await PaginaVersion.findOne({
    where: { paginaId: pagina.id, estado: 'publicado' },
  });

  // 2. Obtener la versión archivada usando las claves de la base de datos (paginaId, estado, numeroVersion o id)
  const whereArchivada: any = {
    paginaId: pagina.id,
    estado: 'archivado',
  };
  if (criterioVersion?.versionId) {
    whereArchivada.id = criterioVersion.versionId;
  } else if (criterioVersion?.numeroVersion) {
    whereArchivada.numeroVersion = criterioVersion.numeroVersion;
  } else {
    // Si no se especifica una versión puntual, se busca la última que estuvo publicada
    whereArchivada.publicadoEn = { [Op.ne]: null };
  }

  const versionArchivada = await PaginaVersion.findOne({
    where: whereArchivada,
    order: [['publicadoEn', 'DESC'], ['numeroVersion', 'DESC']],
  });

  if (!versionArchivada) {
    throw new Error(`La página "${pagina.slug}" no tiene la versión anterior archivada solicitada para restaurar.`);
  }

  // 3. Sincronizar archivos de disco entre backup y uploads. Lo que la versión que se
  // despublica deja de usar sale de `uploads/`, salvo que otra página lo enlace.
  const usadasPorOtrasPaginas = versionPublicada
    ? await PaginaRepository.rutasEnUso(extraerRutasUploads(versionPublicada.contenido), ambito, {
        excluirPaginaId: pagina.id,
      })
    : undefined;
  const resultadoArchivos = restaurarArchivosDesdeBackup({
    paginaId: pagina.id,
    versionRestaurarContenido: versionArchivada.contenido,
    versionActualContenido: versionPublicada ? versionPublicada.contenido : null,
    ambito,
    conservarEnUploads: usadasPorOtrasPaginas,
  });

  // 4. Ejecutar el intercambio atómico en PostgreSQL
  await sequelize.transaction(async (t) => {
    // Si hay una versión actualmente publicada, pasa a archivado
    if (versionPublicada) {
      await versionPublicada.update({ estado: 'archivado' }, { transaction: t });
    }

    // Cualquier borrador o versión pendiente anterior deja de ser vigente y se archiva
    await PaginaVersion.update(
      { estado: 'archivado' },
      {
        where: {
          paginaId: pagina.id,
          estado: { [Op.in]: ['borrador', 'en_revision', 'rechazado'] },
        },
        transaction: t,
      }
    );

    // La versión archivada pasa a ser la publicada. Se sanea al restaurarla: pudo
    // guardarse antes de que el saneo cubriera todo el contenido (2026-09-25).
    await versionArchivada.update(
      {
        contenido: sanitizarContenidoPuck(versionArchivada.contenido),
        estado: 'publicado',
        publicadoEn: new Date(),
        publicadoPor: toUUID(userId),
      },
      { transaction: t }
    );

    // Actualizar la referencia en la página
    await pagina.update(
      { versionPublicadaId: versionArchivada.id },
      { transaction: t }
    );
  });

  // 5. Invalidar caché en caliente (Redis + Next.js ISR)
  await emitirContenidoPublicado({
    paginaId: pagina.id,
    slug: pagina.slug,
    ambito,
    versionId: versionArchivada.id,
    publicadoPor: toUUID(userId),
    fecha: new Date(),
  });

  // 6. Registrar en auditoría el archivado de la versión previa y la publicación de la restaurada
  let nombreUsuario = contextoAuditoria?.usuarioNombre ?? null;
  const usuarioIdFinal = contextoAuditoria?.usuarioId !== undefined
    ? contextoAuditoria.usuarioId
    : toUUID(userId);

  if (!nombreUsuario && userId) {
    const idValido = toUUID(userId);
    if (idValido) {
      try {
        const u = await User.findByPk(idValido, { attributes: ['name', 'apellidos', 'email'] });
        if (u) {
          nombreUsuario = u.name ? (u.apellidos ? `${u.name} ${u.apellidos}` : u.name) : (u.email || null);
        }
      } catch {
        // En caso de error en la consulta de usuario, continuar sin romper el proceso
      }
    }
  }

  const datosAudit: ContextoAuditoria = {
    usuarioId: usuarioIdFinal,
    usuarioNombre: nombreUsuario,
    ip: contextoAuditoria?.ip ?? null,
    userAgent: contextoAuditoria?.userAgent ?? null,
  };

  // El mismo par que registra el ciclo editorial (`campoComentario` en
  // `pagina.controller.ts`): lo que estaba publicado → lo que se vuelve a publicar.
  const comentario = {
    campo: 'comentario',
    antes: versionPublicada?.comentarioCambios ?? null,
    despues: versionArchivada.comentarioCambios ?? null,
  };

  if (versionPublicada) {
    await logAudit({
      ...datosAudit,
      entidadId: pagina.id,
      entidadTipo: 'pagina',
      accion: 'despublicar',
      camposModificados: [
        comentario,
        { campo: 'slug', antes: pagina.slug, despues: pagina.slug },
        { campo: 'version', antes: versionPublicada.numeroVersion, despues: versionPublicada.numeroVersion },
        { campo: 'estado', antes: 'publicado', despues: 'archivado' },
        { campo: 'motivo', antes: null, despues: MOTIVO_DE_ARCHIVADO.alRestaurar(versionArchivada.numeroVersion) },
      ],
    });
  }

  await logAudit({
    ...datosAudit,
    entidadId: pagina.id,
    entidadTipo: 'pagina',
    accion: 'publicar',
    camposModificados: [
      comentario,
      { campo: 'slug', antes: pagina.slug, despues: pagina.slug },
      { campo: 'version', antes: versionPublicada ? versionPublicada.numeroVersion : null, despues: versionArchivada.numeroVersion },
      { campo: 'motivo', antes: null, despues: `Restaurada versión anterior ${versionArchivada.numeroVersion}` },
    ],
  });

  return {
    pagina,
    versionRestaurada: {
      id: versionArchivada.id,
      numeroVersion: versionArchivada.numeroVersion,
      estado: 'publicado',
    },
    versionAnteriorArchivada: versionPublicada
      ? {
        id: versionPublicada.id,
        numeroVersion: versionPublicada.numeroVersion,
        estado: 'archivado',
      }
      : null,
    archivos: resultadoArchivos,
  };
}

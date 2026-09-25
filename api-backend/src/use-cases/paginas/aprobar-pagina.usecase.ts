import { Transaction } from 'sequelize';
import { PaginaRepository } from '../../repositories/pagina.repository';
import { emitirContenidoPublicado } from '../../domain-events/paginas/contenido-publicado.event';
import type { Ambito } from '../../shared/ambito';
import { respaldarArchivosAlPublicar } from '../../infrastructure/storage/backup-uploads.service';
import { extraerRutasUploads } from '../../shared/rutas-uploads-en-contenido';
import { limpiarSubidasPendientes } from './limpiar-subidas-pendientes.usecase';
import { SubidaPendiente } from '../../infrastructure/db/models';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const toUUID = (id: string) => (UUID_RE.test(id) ? id : null);

export const aprobarPagina = async (slug: string, userId: string, ambito: Ambito, tx?: Transaction) => {
  const pagina = await PaginaRepository.findBySlug(slug, ambito, tx);
  if (!pagina) throw new Error('Página no encontrada');
  const paginaAnterior = pagina.toJSON();

  const versionEnRevision = await PaginaRepository.findVersionPorEstado(pagina.id, 'en_revision', tx);
  if (!versionEnRevision) throw new Error('No hay versión en revisión');
  const versionAnterior = versionEnRevision.toJSON();

  // 1. Obtener la versión que estaba publicada antes de archivarla para respaldar sus recursos
  const versionPublicadaAnterior = await PaginaRepository.findVersionPorEstado(pagina.id, 'publicado', tx);
  if (versionPublicadaAnterior) {
    // Lo que la versión nueva deja de usar sale de `uploads/`, salvo que otra página lo
    // enlace: entonces se copia al backup y se queda donde está.
    const usadasPorOtrasPaginas = await PaginaRepository.rutasEnUso(
      extraerRutasUploads(versionPublicadaAnterior.contenido),
      ambito,
      { excluirPaginaId: pagina.id, tx }
    );
    respaldarArchivosAlPublicar({
      paginaId: pagina.id,
      versionAnteriorContenido: versionPublicadaAnterior.contenido,
      versionNuevaContenido: versionEnRevision.contenido,
      ambito,
      conservarEnUploads: usadasPorOtrasPaginas,
    });
  }

  // La versión que estaba publicada pasa a archivada antes de que entre la nueva:
  // una página tiene como máximo una versión publicada, y la base lo impone.
  await PaginaRepository.archivarVersionPublicada(pagina.id, tx);

  await PaginaRepository.actualizarVersion(versionEnRevision, {
    estado: 'publicado',
    publicadoPor: toUUID(userId),
    publicadoEn: new Date(),
  }, tx);

  await PaginaRepository.actualizarPagina(pagina, { versionPublicadaId: versionEnRevision.id }, tx);

  // Los archivos que se subieron y se reemplazaron antes de publicar no los mira nadie más.
  await limpiarSubidasPendientes({ paginaId: pagina.id, slug: pagina.slug, ambito, usuarioId: userId });
  
  // Los archivos que sobrevivieron y están en la versión publicada ya no son "pendientes".
  // Limpiamos el registro para evitar acumulación innecesaria (y que no se eliminen si luego
  // se reemplazan en futuros borradores, la gestión de publicados se encarga de eso).
  await SubidaPendiente.destroy({ where: { paginaId: pagina.id }, transaction: tx });

  // Hasta aquí la publicación es correcta en la base de datos, y aun así la página no
  // cambiaba: el sitio seguía sirviendo su copia cacheada y quien acababa de aprobar
  // recargaba, veía lo de antes y concluía que la aprobación no había hecho nada.
  //
  // Se espera antes de responder justamente por eso: la recarga viene inmediatamente
  // después de esta respuesta. No puede fallar la petición —lo de arriba ya está
  // escrito—, y de eso se encarga el emisor.
  await emitirContenidoPublicado({
    paginaId: pagina.id,
    slug: pagina.slug,
    ambito,
    versionId: versionEnRevision.id,
    publicadoPor: toUUID(userId),
    fecha: new Date(),
  });

  // `paginaAnterior` y `versionAnterior` son las copias tomadas ARRIBA, antes de que
  // `actualizarVersion` pusiera el estado en `publicado`: son lo único que conserva el
  // `en_revision` de partida, y es lo que la bitácora registra como «antes». Se
  // calculaban pero no se devolvían —el controlador ya las pedía—, y eso tumbaba la API
  // entera al cargar: `ts-node` no compila un acceso a una propiedad que no existe.
  // Los otros tres casos del ciclo editorial (`guardar-borrador`, `enviar-a-revision`,
  // `rechazar-pagina`) devuelven este mismo par; aquí faltaba.
  return {
    pagina,
    version: versionEnRevision,
    paginaAnterior,
    versionAnterior,
    versionArchivada: versionPublicadaAnterior,
  };
};

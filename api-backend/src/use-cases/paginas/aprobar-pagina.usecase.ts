import { PaginaRepository } from '../../repositories/pagina.repository';
import { emitirContenidoPublicado } from '../../domain-events/paginas/contenido-publicado.event';
import type { Ambito } from '../../shared/ambito';
import { respaldarArchivosAlPublicar } from '../../shared/storage/backup-uploads.service';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const toUUID = (id: string) => (UUID_RE.test(id) ? id : null);

export const aprobarPagina = async (slug: string, userId: string, ambito: Ambito) => {
  const pagina = await PaginaRepository.findBySlug(slug, ambito);
  if (!pagina) throw new Error('Página no encontrada');

  const versionEnRevision = await PaginaRepository.findVersionPorEstado(pagina.id, 'en_revision');
  if (!versionEnRevision) throw new Error('No hay versión en revisión');

  // 1. Obtener la versión que estaba publicada antes de archivarla para respaldar sus recursos
  const versionPublicadaAnterior = await PaginaRepository.findVersionPorEstado(pagina.id, 'publicado');
  if (versionPublicadaAnterior) {
    respaldarArchivosAlPublicar({
      paginaId: pagina.id,
      versionAnteriorContenido: versionPublicadaAnterior.contenido,
      versionNuevaContenido: versionEnRevision.contenido,
      ambito,
    });
  }

  // La versión que estaba publicada pasa a archivada antes de que entre la nueva:
  // una página tiene como máximo una versión publicada, y la base lo impone.
  await PaginaRepository.archivarVersionPublicada(pagina.id);

  await PaginaRepository.actualizarVersion(versionEnRevision, {
    estado: 'publicado',
    publicadoPor: toUUID(userId),
    publicadoEn: new Date(),
  });

  await PaginaRepository.actualizarPagina(pagina, { versionPublicadaId: versionEnRevision.id });

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

  return { pagina, version: versionEnRevision };
};

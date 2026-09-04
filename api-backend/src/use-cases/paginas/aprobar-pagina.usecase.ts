import { Transaction } from 'sequelize';
import { PaginaRepository } from '../../repositories/pagina.repository';
import { emitirContenidoPublicado } from '../../domain-events/paginas/contenido-publicado.event';
import type { Ambito } from '../../shared/ambito';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const toUUID = (id: string) => (UUID_RE.test(id) ? id : null);

export const aprobarPagina = async (slug: string, userId: string, ambito: Ambito, tx?: Transaction) => {
  const pagina = await PaginaRepository.findBySlug(slug, ambito, tx);
  if (!pagina) throw new Error('Página no encontrada');
  const paginaAnterior = pagina.toJSON();

  const versionEnRevision = await PaginaRepository.findVersionPorEstado(pagina.id, 'en_revision', tx);
  if (!versionEnRevision) throw new Error('No hay versión en revisión');
  const versionAnterior = versionEnRevision.toJSON();

  // La versión que estaba publicada pasa a archivada antes de que entre la nueva:
  // una página tiene como máximo una versión publicada, y la base lo impone.
  await PaginaRepository.archivarVersionPublicada(pagina.id, tx);

  await PaginaRepository.actualizarVersion(versionEnRevision, {
    estado: 'publicado',
    publicadoPor: toUUID(userId),
    publicadoEn: new Date(),
  }, tx);

  await PaginaRepository.actualizarPagina(pagina, { versionPublicadaId: versionEnRevision.id }, tx);

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

  return { pagina, version: versionEnRevision, paginaAnterior, versionAnterior };
};

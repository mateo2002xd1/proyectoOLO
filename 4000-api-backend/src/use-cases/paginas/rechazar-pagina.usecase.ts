import { Transaction } from 'sequelize';
import { PaginaRepository } from '../../repositories/pagina.repository';
import type { Ambito } from '../../shared/ambito';
import { uuidONulo } from '../../shared/uuid';

/**
 * Devuelve la versión en revisión a «rechazado» con su motivo y quién la revisó.
 * @throws {Error} si la página no existe o no tiene versión en revisión.
 */
export const rechazarPagina = async (
  slug: string,
  userId: string,
  motivo: string,
  ambito: Ambito,
  tx?: Transaction
) => {
  // Se bloquea la fila de la página hasta el fin de la transacción: el ciclo editorial (guardar,
  // enviar, aprobar, rechazar, descartar) va de uno en uno por página, y quien llega después lee
  // el estado que dejó el anterior. Sin esto dos decisiones sobre la misma versión podían
  // responder «ok» las dos y una se perdía sin avisar.
  const pagina = await PaginaRepository.findBySlug(slug, ambito, tx, { bloquear: true });
  if (!pagina) throw Object.assign(
    new Error('Página no encontrada. Puede que haya cambiado de dirección: actualiza la lista.'),
    { status: 404 }
  );
  const paginaAnterior = pagina.toJSON();

  const versionEnRevision = await PaginaRepository.findVersionPorEstado(pagina.id, 'en_revision', tx);
  if (!versionEnRevision) {
    throw Object.assign(new Error('No hay versión en revisión: puede que otra persona ya la haya decidido.'), { status: 409 });
  }
  const versionAnterior = versionEnRevision.toJSON();

  // Rechazar no toca lo publicado, pero la bitácora lo pone al lado del comentario
  // rechazado para que se lea qué se quería cambiar y desde dónde.
  const versionPublicada = await PaginaRepository.findVersionPorEstado(pagina.id, 'publicado', tx);

  await PaginaRepository.actualizarVersion(versionEnRevision, {
    estado: 'rechazado',
    motivoRechazo: motivo,
    revisorId: uuidONulo(userId),
  }, tx);

  return {
    pagina,
    version: versionEnRevision,
    paginaAnterior,
    versionAnterior,
    comentarioAnterior: versionPublicada?.comentarioCambios ?? null,
  };
};

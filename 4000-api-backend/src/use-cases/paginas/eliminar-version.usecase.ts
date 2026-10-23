import { PaginaRepository } from '../../repositories/pagina.repository';
import type { Ambito } from '../../shared/ambito';

/**
 * Descarta una versión que aún no se ha publicado.
 *
 * Sirve para tirar un borrador o algo enviado a revisión que no se quiere seguir:
 * en vez de rechazarlo y dejarlo ahí, desaparece. La versión publicada no se toca —
 * eso dejaría la página sin nada que mostrar.
 *
 * Si al borrarla la página se queda sin ninguna versión, se elimina también la
 * página: así el siguiente borrador vuelve a empezar por la versión 1 en vez de
 * seguir contando desde donde estaba.
 *
 * Devuelve además `pagina` y `version` porque **sin el id de la página el
 * controlador no puede registrar nada**: `entidad_id` es NOT NULL, y esta era la
 * única acción del ciclo editorial que destruye trabajo sin dejar huella. Es un
 * añadido a la respuesta: quien solo lee `paginaEliminada` y `versionesRestantes`
 * sigue funcionando igual.
 */
import { Transaction } from 'sequelize';

/**
 * Elimina una versión que no está publicada; si era la única, se lleva la página con ella.
 * @throws {Error} 404 si la página o la versión no existen; 409 si es la versión publicada.
 */
export const eliminarVersion = async (slug: string, versionId: string, ambito: Ambito, tx?: Transaction) => {
  // Se bloquea la fila de la página hasta el fin de la transacción: el ciclo editorial (guardar,
  // enviar, aprobar, rechazar, descartar) va de uno en uno por página, y quien llega después lee
  // el estado que dejó el anterior. Sin esto dos decisiones sobre la misma versión podían
  // responder «ok» las dos y una se perdía sin avisar.
  const pagina = await PaginaRepository.findBySlug(slug, ambito, tx, { bloquear: true });
  if (!pagina) throw Object.assign(new Error('Página no encontrada'), { status: 404 });
  const paginaAnterior = pagina.toJSON();

  const version = await PaginaRepository.findVersionPorId(versionId, tx);
  if (!version || version.paginaId !== pagina.id) {
    throw Object.assign(new Error('Versión no encontrada'), { status: 404 });
  }
  const versionAnterior = version.toJSON();

  if (version.estado === 'publicado' || pagina.versionPublicadaId === version.id) {
    throw Object.assign(
      new Error('No se puede eliminar la versión publicada: la página se quedaría sin contenido'),
      { status: 409 }
    );
  }

  // El comentario de lo publicado es el «antes» de la bitácora; el de la versión
  // descartada, el «después». Se lee antes de borrar nada.
  const versionPublicada = await PaginaRepository.findVersionPorEstado(pagina.id, 'publicado', tx);

  // Se copian antes de borrar: después de `eliminarPagina` la instancia deja de
  // tener una fila detrás y lo que se registre saldría de un objeto huérfano.
  const identidad = {
    pagina: { id: pagina.id, slug: pagina.slug },
    version: { numeroVersion: version.numeroVersion, comentarioCambios: version.comentarioCambios },
    paginaAnterior,
    versionAnterior,
    comentarioAnterior: versionPublicada?.comentarioCambios ?? null,
  };

  await PaginaRepository.eliminarVersion(version, tx);

  const restantes = await PaginaRepository.contarVersiones(pagina.id, tx);
  if (restantes === 0) {
    await PaginaRepository.eliminarPagina(pagina, tx);
    return { ...identidad, eliminada: true, paginaEliminada: true, versionesRestantes: 0 };
  }

  return { ...identidad, eliminada: true, paginaEliminada: false, versionesRestantes: restantes };
};

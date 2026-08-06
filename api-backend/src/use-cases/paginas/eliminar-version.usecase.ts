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
export const eliminarVersion = async (slug: string, versionId: string, ambito: Ambito) => {
  const pagina = await PaginaRepository.findBySlug(slug, ambito);
  if (!pagina) throw Object.assign(new Error('Página no encontrada'), { status: 404 });

  const version = await PaginaRepository.findVersionPorId(versionId);
  if (!version || version.paginaId !== pagina.id) {
    throw Object.assign(new Error('Versión no encontrada'), { status: 404 });
  }

  if (version.estado === 'publicado' || pagina.versionPublicadaId === version.id) {
    throw Object.assign(
      new Error('No se puede eliminar la versión publicada: la página se quedaría sin contenido'),
      { status: 409 }
    );
  }

  // Se copian antes de borrar: después de `eliminarPagina` la instancia deja de
  // tener una fila detrás y lo que se registre saldría de un objeto huérfano.
  const identidad = {
    pagina: { id: pagina.id, slug: pagina.slug },
    version: { numeroVersion: version.numeroVersion },
  };

  await PaginaRepository.eliminarVersion(version);

  const restantes = await PaginaRepository.contarVersiones(pagina.id);
  if (restantes === 0) {
    await PaginaRepository.eliminarPagina(pagina);
    return { ...identidad, eliminada: true, paginaEliminada: true, versionesRestantes: 0 };
  }

  return { ...identidad, eliminada: true, paginaEliminada: false, versionesRestantes: restantes };
};

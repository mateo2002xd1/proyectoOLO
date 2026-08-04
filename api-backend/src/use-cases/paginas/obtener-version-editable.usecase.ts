import { PaginaRepository } from '../../repositories/pagina.repository';
import type { Ambito } from '../../shared/ambito';

const EMPTY_CONTENIDO = { content: [], root: { props: {} } };

/**
 * Devuelve el contenido editable de una página para el editor visual.
 *
 * A diferencia de obtenerPaginaPublica (que solo expone la versión publicada),
 * aquí se toma la ÚLTIMA versión sin importar el estado (borrador, en_revisión,
 * publicado o rechazado), para que el editor abra siempre con el trabajo más
 * reciente. Si la página o la versión aún no existen, se devuelve un contenido
 * vacío (no null) para que el editor arranque en limpio en vez de fallar.
 */
export const obtenerVersionEditable = async (slug: string, ambito: Ambito) => {
  const pagina = await PaginaRepository.findBySlug(slug, ambito);
  if (!pagina) {
    return { slug, titulo: slug, contenido: EMPTY_CONTENIDO, estado: null, versionId: null };
  }

  const version = await PaginaRepository.findUltimaVersion(pagina.id);
  if (!version) {
    return {
      slug: pagina.slug,
      titulo: pagina.titulo,
      contenido: EMPTY_CONTENIDO,
      estado: null,
      versionId: null,
    };
  }

  let contenido = version.contenido as any;
  if (Array.isArray(contenido)) {
    contenido = { content: contenido, root: { props: {} } };
  } else if (!contenido || !contenido.content) {
    contenido = EMPTY_CONTENIDO;
  }

  return {
    slug: pagina.slug,
    titulo: pagina.titulo,
    contenido,
    estado: version.estado,
    versionId: version.id,
  };
};

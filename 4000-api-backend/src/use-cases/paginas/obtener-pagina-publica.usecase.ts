import { PaginaRepository } from '../../repositories/pagina.repository';
import type { Ambito } from '../../shared/ambito';

export const obtenerPaginaPublica = async (slug: string, ambito: Ambito) => {
  const pagina = await PaginaRepository.findBySlug(slug, ambito);
  if (!pagina) return null;

  if (!pagina.versionPublicadaId) return null;

  const version = await PaginaRepository.findVersionPorId(pagina.versionPublicadaId);
  if (!version) return null;

  let contenido = version.contenido as any;
  if (Array.isArray(contenido)) {
    contenido = { content: contenido, root: { props: {} } };
  } else if (!contenido || !contenido.content) {
    contenido = { content: [], root: { props: {} } };
  }

  return {
    id: pagina.id,
    slug: pagina.slug,
    titulo: pagina.titulo,
    contenido,
    layout: version.layout,
    publicadoEn: version.publicadoEn,
  };
};

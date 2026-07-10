import { Pagina, PaginaVersion } from '../../infrastructure/db/models';

export const obtenerPaginaPublica = async (slug: string) => {
  const pagina = await Pagina.findOne({ where: { slug } });
  if (!pagina) return null;

  if (!pagina.versionPublicadaId) return null;

  const version = await PaginaVersion.findByPk(pagina.versionPublicadaId);
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

import { Op } from 'sequelize';
import { Pagina } from '../../infrastructure/db/models';
import type { Ambito } from '../../shared/ambito';
import { SLUGS_IGNORADOS } from './obtener-indice-busqueda.usecase';

export interface TituloPublicado {
  slug: string;
  titulo: string;
}

/**
 * Slug y título de cada página publicada de un ámbito.
 *
 * Es lo que necesitan las migas de pan del sitio, que se pintan en cada visita: el
 * índice de búsqueda trae además el texto de todas las páginas, y mandar eso en cada
 * petición para leer un nombre sería desproporcionado. El criterio de «publicada» es el
 * mismo del índice (`versionPublicadaId` vigente), y por eso una página sin nada
 * aprobado no aparece: sus migas no tienen a dónde enlazar.
 */
export const obtenerTitulosPublicados = async (ambito: Ambito): Promise<TituloPublicado[]> => {
  const paginas = await Pagina.findAll({
    attributes: ['slug', 'titulo'],
    where: { ambito, versionPublicadaId: { [Op.ne]: null } },
    order: [['slug', 'ASC']],
  });

  return paginas
    .filter((pagina) => !SLUGS_IGNORADOS.has(pagina.slug))
    .map((pagina) => ({ slug: pagina.slug, titulo: pagina.titulo }));
};

import { Op } from 'sequelize';
import { Pagina, PaginaVersion } from '../../infrastructure/db/models';
import type { Ambito } from '../../shared/ambito';
import {
  extraerTextosPuck,
  resolverHref,
  type PaginaIndiceBusqueda,
} from '../../shared/extraer-textos-puck';

/**
 * Slugs reservados que no son páginas navegables (plantillas, menús, etc.).
 */
const SLUGS_IGNORADOS = new Set(['menu-y-pie', 'plantilla']);

/**
 * Construye el índice de búsqueda dinámico para las páginas publicadas de un ámbito.
 *
 * Consulta únicamente las páginas con `version_publicada_id` vigente y estado 'publicado',
 * asegurando que borradores o versiones rechazadas jamás se expongan.
 */
export const obtenerIndiceBusqueda = async (
  ambito: Ambito
): Promise<PaginaIndiceBusqueda[]> => {
  // 1. Obtener todas las páginas del ámbito con una versión publicada activa
  const paginas = await Pagina.findAll({
    where: {
      ambito,
      versionPublicadaId: {
        [Op.ne]: null,
      },
    },
    order: [['titulo', 'ASC']],
  });

  const paginasValidas = paginas.filter((p) => !SLUGS_IGNORADOS.has(p.slug));
  if (paginasValidas.length === 0) return [];

  const versionIds = paginasValidas
    .map((p) => p.versionPublicadaId)
    .filter(Boolean) as string[];

  // 2. Cargar las versiones publicadas
  const versiones = await PaginaVersion.findAll({
    where: {
      id: {
        [Op.in]: versionIds,
      },
      estado: 'publicado',
    },
  });

  const versionMap = new Map(versiones.map((v) => [v.id, v]));

  // 3. Procesar y extraer textos limpios de Puck para cada página
  const indice: PaginaIndiceBusqueda[] = [];

  for (const pagina of paginasValidas) {
    const version = pagina.versionPublicadaId
      ? versionMap.get(pagina.versionPublicadaId)
      : null;

    if (!version) continue;

    let contenido = version.contenido as any;
    if (Array.isArray(contenido)) {
      contenido = { content: contenido };
    }

    const items = extraerTextosPuck(contenido, pagina.titulo);

    if (items.length === 0) {
      items.push({ type: 'h1', text: pagina.titulo });
    }

    indice.push({
      slug: pagina.slug,
      titulo: pagina.titulo,
      href: resolverHref(pagina.slug, ambito),
      fechaActualizacion: version.publicadoEn 
        ? version.publicadoEn.toISOString() 
        : version.creadoEn 
          ? version.creadoEn.toISOString() 
          : undefined,
      items,
    });
  }

  return indice;
};

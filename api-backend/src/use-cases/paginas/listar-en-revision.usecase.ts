import { PaginaRepository } from '../../repositories/pagina.repository';

/**
 * Páginas esperando aprobación, de las dos aplicaciones.
 *
 * No se filtra por ámbito a propósito: quien aprueba trabaja desde el panel del
 * sitio y necesita ver ahí también lo que envían los editores de la intranet. Cada
 * elemento lleva su `ambito` para que al aprobar o rechazar se actúe sobre la
 * página correcta — el mismo slug existe en las dos aplicaciones.
 */
export const listarEnRevision = async () => {
  const versiones = await PaginaRepository.listarEnRevision();

  return versiones.map((v) => ({
    id: v.id,
    paginaId: v.paginaId,
    titulo: v.pagina?.titulo,
    slug: v.pagina?.slug,
    ambito: v.pagina?.ambito,
    numeroVersion: v.numeroVersion,
    creadoEn: v.creadoEn,
    autor: v.publicador,
  }));
};

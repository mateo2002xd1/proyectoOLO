import { PaginaRepository } from '../../repositories/pagina.repository';
import { SubidaPendiente } from '../../infrastructure/db/models';
import type { Ambito } from '../../shared/ambito';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const toUUID = (id?: string | null) => (id && UUID_RE.test(id) ? id : null);

/** Anota que `ruta` se subió desde el editor de esta página y aún no se ha publicado. */
export const registrarSubidaPendiente = async (
  slug: string,
  ruta: string,
  ambito: Ambito,
  userId?: string
) => {
  let pagina = await PaginaRepository.findBySlug(slug, ambito);
  if (!pagina) {
    // Si la página se está creando y aún no se guardó el primer borrador,
    // se crea la cabecera en `paginas` para poder satisfacer la FK de subidas_pendientes.
    pagina = await PaginaRepository.crear({
      slug,
      ambito,
      titulo: slug,
      creadoPor: toUUID(userId),
    });
  }

  await SubidaPendiente.findOrCreate({ where: { paginaId: pagina.id, ruta } });
};

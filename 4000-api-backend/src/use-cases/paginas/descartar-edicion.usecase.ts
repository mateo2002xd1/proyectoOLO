import { describirErrorParaLog } from '../../shared/errores';
import { PaginaRepository } from '../../repositories/pagina.repository';
import type { Ambito } from '../../shared/ambito';
import { limpiarSubidasPendientes } from './limpiar-subidas-pendientes.usecase';
import { liberarBloqueo } from './liberar-bloqueo.usecase';

/**
 * Se invoca cuando el usuario cierra o abandona el editor sin guardar cambios.
 * Su único propósito es limpiar los archivos que haya subido durante la sesión
 * (subidas_pendientes) y liberar el bloqueo de la página.
 */
export const descartarEdicion = async (
  slug: string,
  userId: string,
  ambito: Ambito
) => {
  const pagina = await PaginaRepository.findBySlug(slug, ambito);
  if (pagina) {
    // Limpiar huérfanos de la sesión en background
    limpiarSubidasPendientes({
      paginaId: pagina.id,
      slug,
      ambito,
      usuarioId: userId,
    }).catch((err) => console.error('[Limpieza Descartar Edición] Error limpiando subidas pendientes:', describirErrorParaLog(err)));
  }

  // Liberar el bloqueo para que otro pueda editar (ya que el usuario salió)
  await liberarBloqueo(slug, ambito, userId);
};

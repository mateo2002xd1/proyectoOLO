import { Op } from 'sequelize';
import { SubidaPendiente } from '../../infrastructure/db/models';
import { BloqueoEdicionRepository } from '../../repositories/bloqueo-edicion.repository';
import { borrarArchivosHuerfanos } from './borrar-archivos-huerfanos.usecase';
import type { Ambito } from '../../shared/ambito';

/**
 * Al publicar, guardar borrador o cerrar, borra de `uploads/` los archivos que se subieron
 * y que ninguna versión (de ninguna página del ámbito) usa. Devuelve las rutas borradas.
 *
 * Qué está en uso y cómo se borra lo resuelve `borrarArchivosHuerfanos`, lo mismo que al
 * eliminar una sección; aquí queda lo propio de las subidas pendientes: la guarda del
 * bloqueo y el registro de `subidas_pendientes`.
 */
export const limpiarSubidasPendientes = async (params: {
  paginaId: string;
  slug: string;
  ambito: Ambito;
  usuarioId: string;
}): Promise<string[]> => {
  const { paginaId, slug, ambito, usuarioId } = params;

  // Quien tiene el editor abierto puede tener subidas que aún no guardó en el borrador.
  const bloqueo = await BloqueoEdicionRepository.vigente(ambito, slug);
  if (bloqueo && bloqueo.usuario_id !== usuarioId) return [];

  const pendientes = await SubidaPendiente.findAll({ where: { paginaId } });
  if (pendientes.length === 0) return [];

  const borradas = await borrarArchivosHuerfanos(
    pendientes.map(({ ruta }) => ruta),
    ambito
  );

  if (borradas.length > 0) {
    // Solo eliminamos del registro de pendientes las que efectivamente borramos.
    // Las que están en uso (referenciadas) se mantienen en pendientes hasta que
    // se publique la página o se reemplace el archivo y quede huérfano.
    await SubidaPendiente.destroy({
      where: { paginaId, ruta: { [Op.in]: borradas } },
    });
  }

  return borradas;
};

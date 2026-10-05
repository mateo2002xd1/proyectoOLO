import { AlertasInversionRepository as Repo } from '../../repositories/alertas-inversion.repository';

export class ErrorAlEliminarProyecto extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

/**
 * Borra un proyecto de inversión (alta manual o fila de un Excel) y, con él, sus
 * ubicaciones. Es la única forma de quitar un proyecto: `eliminarCargaAlertasInversion`
 * solo borra la auditoría de la carga y nunca toca `proyectos_inversion`.
 */
export async function eliminarProyectoInversion(id: string): Promise<void> {
  const borrados = await Repo.eliminarProyecto(id);
  if (borrados === 0) {
    throw new ErrorAlEliminarProyecto('Proyecto no encontrado.', 404);
  }
}

/** Botón «Limpiar» del panel: borra todos los proyectos y devuelve cuántos eran. */
export const eliminarTodosLosProyectosInversion = () => Repo.eliminarTodosLosProyectos();

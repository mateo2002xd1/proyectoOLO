import { FuentesFuturasEmpleoRepository as Repo } from '../../../repositories/fuentes-futuras-empleo.repository';
import { eliminarArchivoSiQuedaSuelto } from '../eliminar-carga.usecase';
import { olvidarFuentesFuturasEnCache } from './consultar-fuentes-futuras-actual.usecase';

export class ErrorAlEliminarCarga extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

/**
 * Borra una carga de "Fuentes futuras de empleo" del historial y, si nadie más comparte
 * el archivo, también el Excel de `uploads/cargas-datos/` y su fila en `archivos` —
 * `eliminarArchivoSiQuedaSuelto` es la misma función que usan las otras tres cargas.
 *
 * A diferencia de ellas, aquí sí cambia lo que ve el público: el portal lee el Excel de
 * la carga vigente, así que borrar la última lo devuelve a la anterior, y borrar todas
 * deja la sección sin datos. Es el "deshacer" de este módulo, no solo su auditoría.
 *
 * @returns `archivoEliminado` en `false` si el Excel se conservó porque otra carga lo usa.
 */
export async function eliminarCargaFuentesFuturas(id: string): Promise<{ archivoEliminado: boolean }> {
  const carga = await Repo.obtenerCarga(id);
  if (!carga) {
    throw new ErrorAlEliminarCarga('Carga no encontrada.', 404);
  }

  const archivoId = carga.get('archivoId') as string | null;
  await Repo.eliminarCarga(id);

  const archivoEliminado = archivoId ? await eliminarArchivoSiQuedaSuelto(archivoId, id) : false;

  // Cambió cuál es la carga vigente, y puede que su Excel ya no esté en disco.
  olvidarFuentesFuturasEnCache();

  return { archivoEliminado };
}

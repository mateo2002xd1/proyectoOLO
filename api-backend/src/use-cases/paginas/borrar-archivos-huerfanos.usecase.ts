import { PaginaRepository } from '../../repositories/pagina.repository';
import { borrarDeUploads } from '../../infrastructure/storage/backup-uploads.service';
import type { Ambito } from '../../shared/ambito';

/**
 * Borra de `uploads/` las rutas candidatas que ya no nombra ninguna versión de ninguna
 * página del ámbito, y devuelve las borradas.
 *
 * Es la única puerta para borrar archivos de páginas. Cada flujo solo aporta su lista de
 * candidatos —las subidas pendientes al guardar o publicar (`limpiarSubidasPendientes`),
 * los archivos de una sección eliminada (`eliminarSeccion`)—; quién decide
 * (`PaginaRepository.rutasEnUso`) y quién borra (`borrarDeUploads`) son los mismos para
 * todos. Antes cada flujo tenía su propio criterio y su propio borrado, y el de eliminar
 * sección borraba también lo que otra página seguía enlazando.
 *
 * Pregunta a la base en el momento de llamarla: fuera de una transacción, ve solo lo
 * confirmado.
 */
export const borrarArchivosHuerfanos = async (candidatas: Iterable<string>, ambito: Ambito): Promise<string[]> => {
  const rutas = [...new Set(candidatas)];
  if (rutas.length === 0) return [];

  const enUso = await PaginaRepository.rutasEnUso(rutas, ambito);
  return borrarDeUploads(
    rutas.filter((ruta) => !enUso.has(ruta)),
    ambito
  );
};

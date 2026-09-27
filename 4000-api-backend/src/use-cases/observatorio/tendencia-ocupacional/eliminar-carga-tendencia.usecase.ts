import sequelize from '../../../config/database';
import { TendenciaOcupacionalRepository as Repo } from '../../../repositories/tendencia-ocupacional.repository';
import { eliminarArchivoSiQuedaSuelto } from '../eliminar-carga.usecase';

/** Un `Error` con el `status` HTTP que traduce `error.middleware.ts`. */
const conEstado = (mensaje: string, status: number) => Object.assign(new Error(mensaje), { status });

export interface CargaEliminada {
  /** Año y periodo cuyos datos se borraron con la carga, por ser la vigente; `null` si no cambiaron. */
  datosEliminados: { anio: number; periodo: string; estabaPublicado: boolean } | null;
  /** `false` si el Excel se conservó porque otra carga lo usa (se deduplican por contenido). */
  archivoEliminado: boolean;
}

/**
 * Elimina una carga de percentiles del historial y su Excel del almacenamiento.
 *
 * Si es la carga **vigente** de su celda —la que puso los datos que el corte tiene hoy—
 * se borra también el corte con sus indicadores. Dejarlos sin la carga que los trajo los
 * dejaría sin origen, y publicar/despublicar pasaría a una carga anterior cuyos datos ya
 * no están. La celda queda sin datos y, si estaba publicada, el sitio deja de mostrarla.
 * Una carga reemplazada o fallida se borra sin tocar los datos.
 *
 * Corre con el candado de la celda, sin esperarlo: si una carga está guardando en ella,
 * responde 409. Una que figura «procesando» pero no está guardando —en cola, leyendo el
 * Excel o colgada tras un reinicio— sí se elimina; el worker, al tomar el candado, ve que
 * ya no existe y no guarda nada (`carga.sigueExistiendo`).
 *
 * @throws {Error} 404 si no existe; 409 si hay una carga guardando en esa celda.
 */
export async function eliminarCargaTendencia(cargaId: string): Promise<CargaEliminada> {
  const { archivoId, datosEliminados } = await sequelize.transaction(async (transaction) => {
    const previa = await Repo.eliminacion.detalle(transaction, cargaId);
    if (!previa) throw conEstado('Carga no encontrada.', 404);

    const libre = await Repo.eliminacion.intentarBloquearCelda(transaction, previa.anio, previa.periodo_id);
    if (!libre) {
      throw conEstado(
        `Hay una carga guardando datos en ${previa.anio} · ${previa.periodo_nombre}. ` +
          'Espere a que termine y vuelva a intentarlo.',
        409
      );
    }

    // Otra vez, con la celda ya bloqueada: mientras tanto pudo terminar otra carga de la
    // celda (y esta dejar de ser la vigente), o alguien más pudo eliminarla.
    const carga = await Repo.eliminacion.detalle(transaction, cargaId);
    if (!carga) throw conEstado('Carga no encontrada.', 404);

    let datos: CargaEliminada['datosEliminados'] = null;
    if (carga.vigente && carga.corte_id !== null) {
      await Repo.eliminacion.eliminarCorte(transaction, carga.corte_id);
      datos = {
        anio: carga.anio,
        periodo: carga.periodo_nombre,
        estabaPublicado: carga.corte_estado === 'publicado',
      };
    }
    await Repo.eliminacion.eliminarCarga(transaction, cargaId);
    return { archivoId: carga.archivo_id, datosEliminados: datos };
  });

  // Después del commit: un Excel que no se pudo borrar de disco no deshace la eliminación.
  const archivoEliminado = archivoId ? await eliminarArchivoSiQuedaSuelto(archivoId, cargaId) : false;
  return { datosEliminados, archivoEliminado };
}

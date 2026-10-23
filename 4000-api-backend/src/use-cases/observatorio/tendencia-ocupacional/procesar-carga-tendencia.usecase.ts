import { describirErrorParaLog, mensajeSeguroDeCarga } from '../../../shared/errores';
import fs from 'fs/promises';
import { ObservatorioRepository } from '../../../repositories/observatorio.repository';
import { TendenciaOcupacionalRepository as Repo } from '../../../repositories/tendencia-ocupacional.repository';
import { importarPercentilesExcel, type ProgresoCarga } from './importar-percentiles-excel.usecase';
import { ErrorDeCargaTendencia, hallazgoReporte, type ReporteCarga } from './reporte-carga';

/** Mismo criterio que la carga de programas: el panel sondea cada pocos segundos. */
const INTERVALO_MINIMO_ESCRITURA_MS = 500;

/**
 * Lo que corre el worker de `heavy-jobs` para una carga de percentiles: lee el Excel ya
 * guardado, lo importa y deja el resultado en la bitácora. El éxito se registra dentro de
 * la transacción de la importación; el fallo, aquí, fuera de ella, para que sobreviva al
 * rollback. Nunca relanza: un fallo ya quedó registrado y no hay a quién devolvérselo.
 */
export async function procesarCargaTendencia(cargaId: string, rutaAbsoluta: string): Promise<void> {
  let ultimaEscritura = 0;
  const reportarProgreso = (progreso: ProgresoCarga) => {
    const ahora = Date.now();
    if (progreso.porcentaje < 100 && ahora - ultimaEscritura < INTERVALO_MINIMO_ESCRITURA_MS) return;
    ultimaEscritura = ahora;
    // Sin `await`: un progreso perdido lo corrige el siguiente.
    ObservatorioRepository.actualizarProgreso(
      cargaId,
      progreso.porcentaje,
      progreso.filasProcesadas,
      progreso.filasTotales
    ).catch((error) =>
      console.error(`[tendencia-ocupacional] No se pudo registrar el progreso de la carga ${cargaId}:`, describirErrorParaLog(error))
    );
  };

  try {
    const detalle = await Repo.obtenerDetalleCarga(cargaId);
    if (!detalle) throw new Error(`La carga ${cargaId} no tiene año y periodo registrados.`);

    const datos = await fs.readFile(rutaAbsoluta);
    await importarPercentilesExcel(
      datos,
      {
        cargaId,
        anio: detalle.anio,
        periodoId: detalle.periodo_id,
        periodoNombre: detalle.periodo_nombre,
      },
      reportarProgreso
    );
  } catch (error) {
    // `cargas_datos.mensaje` y la muestra del reporte se enseñan en el panel: ahí solo va lo que
    // `mensajeSeguroDeCarga` deja pasar. El detalle completo queda en el log de más abajo.
    const mensaje = mensajeSeguroDeCarga(error);
    const reporte: ReporteCarga =
      error instanceof ErrorDeCargaTendencia
        ? error.reporte
        : {
            errores: [
              hallazgoReporte('LECTURA', {
                total: 1,
                muestra: [{ mensaje }],
              }),
            ],
            advertencias: [],
          };

    if (!(error instanceof ErrorDeCargaTendencia)) {
      console.error(`[tendencia-ocupacional] Carga ${cargaId} falló:`, describirErrorParaLog(error));
    }
    await Repo.cerrarCargaFallida(cargaId, mensaje, reporte).catch((errorAlCerrar) =>
      console.error(`[tendencia-ocupacional] No se pudo registrar el fallo de la carga ${cargaId}:`, describirErrorParaLog(errorAlCerrar))
    );
  }
}

import fs from 'fs/promises';
import { importarAlertasInversionExcel, ProgresoImportacionAlertas } from './importar-excel.usecase';
import { AlertasInversionRepository as Repo } from '../../repositories/alertas-inversion.repository';

/** Mismo criterio de throttle que `observatorio/procesar-carga.usecase.ts`. */
const INTERVALO_MINIMO_ESCRITURA_MS = 500;

/**
 * Lo que corre el worker de `heavy-jobs` para una carga de "Alertas de inversión":
 * lee el Excel ya guardado en disco, importa fila a fila (agrega, no reemplaza) y
 * deja el resultado en `cargas_datos`.
 */
export async function procesarCargaAlertasInversion(
  cargaId: string,
  rutaAbsoluta: string,
  subidoPor: string | null
): Promise<void> {
  let ultimaEscritura = 0;
  const reportarProgreso = (progreso: ProgresoImportacionAlertas) => {
    const ahora = Date.now();
    if (progreso.porcentaje < 100 && ahora - ultimaEscritura < INTERVALO_MINIMO_ESCRITURA_MS) return;
    ultimaEscritura = ahora;

    Repo.actualizarProgreso(cargaId, progreso.porcentaje, progreso.filasProcesadas, progreso.filasTotales).catch(
      (error) => console.error(`[alertas-inversion] No se pudo registrar el progreso de la carga ${cargaId}:`, error)
    );
  };

  try {
    const datos = await fs.readFile(rutaAbsoluta);
    const resultado = await importarAlertasInversionExcel(datos, subidoPor, reportarProgreso);
    const partes = [`${resultado.filasCargadas} proyecto(s) cargado(s)`];
    if (resultado.filasOmitidasPorDuplicado > 0) {
      partes.push(`${resultado.filasOmitidasPorDuplicado} fila(s) omitida(s) por tener la misma fuente ya registrada`);
    }
    if (resultado.nuevasEmpresas > 0) partes.push(`${resultado.nuevasEmpresas} empresa(s) nueva(s)`);
    if (resultado.nuevosMunicipios > 0) partes.push(`${resultado.nuevosMunicipios} municipio(s) nuevo(s)`);

    await Repo.marcarCargaCompletada(cargaId, resultado.filasCargadas, `${partes.join(', ')}.`);
  } catch (error) {
    const mensaje = describirError(error);
    console.error(`[alertas-inversion] Carga ${cargaId} falló:`, mensaje);
    await Repo.marcarCargaError(cargaId, mensaje);
  }
}

function describirError(error: unknown): string {
  return error instanceof Error ? error.message : 'Error desconocido al procesar el archivo.';
}

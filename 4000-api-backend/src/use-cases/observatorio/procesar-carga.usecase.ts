import fs from 'fs/promises';
import { importarProgramasExcel, ProgresoImportacion } from './importar-programas-excel.usecase';
import { ObservatorioRepository as Repo } from '../../repositories/observatorio.repository';
import { describirErrorParaLog, mensajeSeguroDeCarga } from '../../shared/errores';

/** No escribir en `cargas_datos` más seguido que esto mientras se procesa —
 * el loader del panel sondea cada pocos segundos, no hace falta una fila por
 * lote de 2.000 en un archivo de 100.000. Siempre se escribe el último tick
 * (100%), sin importar el tiempo transcurrido. */
const INTERVALO_MINIMO_ESCRITURA_MS = 500;

/**
 * Lo que corre el worker de `heavy-jobs` para una carga de "Programa +
 * Sobresalientes": lee el archivo ya guardado en disco, ejecuta la importación
 * (vaciar + recargar transaccional) y deja el resultado escrito en
 * `cargas_datos` — completado con cuántas filas quedaron, o error con el motivo
 * exacto. Nunca relanza: un fallo aquí ya quedó contado, no hay a quién devolvérselo.
 */
export async function procesarCargaObservatorio(cargaId: string, rutaAbsoluta: string): Promise<void> {
  let ultimaEscritura = 0;
  const reportarProgreso = (progreso: ProgresoImportacion) => {
    const ahora = Date.now();
    if (progreso.porcentaje < 100 && ahora - ultimaEscritura < INTERVALO_MINIMO_ESCRITURA_MS) return;
    ultimaEscritura = ahora;

    // Sin `await` a propósito: un progreso perdido no importa, el siguiente
    // tick lo corrige — pero esperar la escritura sí frenaría el parseo/insert.
    Repo.actualizarProgreso(cargaId, progreso.porcentaje, progreso.filasProcesadas, progreso.filasTotales).catch(
      (error) =>
        console.error(`[observatorio] No se pudo registrar el progreso de la carga ${cargaId}: ${describirErrorParaLog(error)}`)
    );
  };

  try {
    const datos = await fs.readFile(rutaAbsoluta);
    const resultado = await importarProgramasExcel(datos, reportarProgreso);
    await Repo.marcarCargaCompletada(
      cargaId,
      resultado.estadisticas.filasCargadas,
      `${resultado.estadisticas.filasCargadas} filas cargadas ` +
        `(${resultado.estadisticas.nuevosCentros} centros, ` +
        `${resultado.estadisticas.nuevosNiveles} niveles y ` +
        `${resultado.estadisticas.nuevosProgramas} programas nuevos)` +
        (resultado.estadisticas.filasCombinadas > 0
          ? `. ${resultado.estadisticas.filasCombinadas} fila(s) del Excel repetían centro+programa+sexo ` +
            'y se sumaron en una sola.'
          : '.')
    );
  } catch (error) {
    // El log lleva el detalle completo; a `cargas_datos.mensaje` —que se enseña en el panel— solo
    // llega lo que `mensajeSeguroDeCarga` deja pasar (nada de tablas ni restricciones).
    console.error(`[observatorio] Carga ${cargaId} falló: ${describirErrorParaLog(error)}`);
    await Repo.marcarCargaError(cargaId, mensajeSeguroDeCarga(error));
  }
}

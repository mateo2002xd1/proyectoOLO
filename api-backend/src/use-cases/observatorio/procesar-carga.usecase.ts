import fs from 'fs/promises';
import { importarProgramasExcel, ProgresoImportacion } from './importar-programas-excel.usecase';
import { ObservatorioRepository as Repo } from '../../repositories/observatorio.repository';

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
      (error) => console.error(`[observatorio] No se pudo registrar el progreso de la carga ${cargaId}:`, error)
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
    const mensaje = describirError(error);
    console.error(`[observatorio] Carga ${cargaId} falló:`, mensaje);
    await Repo.marcarCargaError(cargaId, mensaje);
  }
}

/**
 * Sequelize reduce cualquier error de validación o de restricción única a
 * `"Validation error"` en `.message` — el detalle real vive en `.errors[]`
 * (uno por columna). Sin esto, `cargas_datos.mensaje` no dice nada útil y hay
 * que ir a los logs del servidor a adivinar qué pasó.
 */
function describirError(error: unknown): string {
  const detalles = extraerDetallesDeValidacion(error);
  if (detalles.length > 0) return detalles.join('; ');

  return error instanceof Error ? error.message : 'Error desconocido al procesar el archivo.';
}

/** Forma mínima de `ValidationErrorItem` de Sequelize: lo único que se lee de cada error. */
interface DetalleDeValidacion {
  message?: string;
  path?: string;
}

function extraerDetallesDeValidacion(error: unknown): string[] {
  if (typeof error !== 'object' || error === null || !('errors' in error)) return [];

  const { errors } = error as { errors: unknown };
  if (!Array.isArray(errors)) return [];

  return errors
    .map((item: DetalleDeValidacion) => item?.message ?? item?.path)
    .filter((detalle): detalle is string => Boolean(detalle));
}

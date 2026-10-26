import { FuentesFuturasEmpleoRepository as Repo } from '../../../repositories/fuentes-futuras-empleo.repository';
import { validarYGuardarExcel } from '../guardar-excel-de-carga';
import { olvidarFuentesFuturasEnCache } from './consultar-fuentes-futuras-actual.usecase';
import { leerRegistrosDeBuffer } from './leer-excel-fuentes-futuras';

export { ErrorDeSubida } from '../guardar-excel-de-carga';
export { ErrorDeExcelFuentesFuturas } from './leer-excel-fuentes-futuras';

/**
 * Sube el Excel de "Fuentes futuras de empleo" y lo deja vigente en el portal.
 *
 * Es la única carga de "Actualizaciones" sin cola ni worker: no importa filas a ninguna
 * tabla, el propio Excel es el dato y el portal lo lee de la carga vigente
 * (`consultar-fuentes-futuras-actual.usecase.ts`). Son dos docenas de filas de cuatro
 * columnas, así que se resuelve en la misma petición y no depende de Redis.
 *
 * El archivo se valida **antes** de parsearlo (SUB-03): hasta el 2026-10-25 era al revés y
 * `exceljs` abría cualquier byte que llegara, tipo real o no, antes de que
 * `validarYGuardarExcel` mirara magic bytes y extensión. Un Excel con otras columnas sigue
 * rechazándose sin dejar fila en `archivos` ni copia en disco, solo que ahora ese rechazo
 * llega después de confirmar que sí es un `.xlsx` de verdad.
 */
export async function iniciarCargaFuentesFuturas(
  datos: Buffer,
  nombreOriginal: string,
  subidoPor: string | null
): Promise<{ cargaId: string; filas: number }> {
  const { archivoId } = await validarYGuardarExcel(datos, nombreOriginal, subidoPor, { requiereCola: false });

  const registros = await leerRegistrosDeBuffer(datos);

  const mensaje = `Publicados ${registros.length.toLocaleString('es-CO')} registros desde ${nombreOriginal}.`;
  const carga = await Repo.crearCargaCompletada(archivoId, subidoPor, registros.length, mensaje);

  // La carga recién creada es la vigente: lo que el portal tenga leído ya no vale.
  olvidarFuentesFuturasEnCache();

  return { cargaId: carga.get('id') as string, filas: registros.length };
}

import sequelize from '../../../config/database';
import { DepartamentosRepository } from '../../../repositories/departamentos.repository';
import {
  TendenciaOcupacionalRepository as Repo,
  type FilaStaging,
} from '../../../repositories/tendencia-ocupacional.repository';
import { leerExcelPercentiles } from './leer-excel-percentiles';
import {
  conHallazgos,
  ErrorDeCargaTendencia,
  hallazgoReporte,
  mensajeCeldaOcupada,
  type ReporteCarga,
} from './reporte-carga';

export interface CeldaDeCarga {
  cargaId: string;
  anio: number;
  periodoId: number;
  periodoNombre: string;
}

export interface ProgresoCarga {
  /** 0-100: 0-40 leer el Excel, 40-60 tabla temporal, 60-85 validar, 85-100 guardar. */
  porcentaje: number;
  filasProcesadas: number;
  filasTotales: number;
}

const formatoMiles = (numero: number) => numero.toLocaleString('es-CO');

/**
 * Carga un Excel de percentiles en la celda (año, periodo) de la carga.
 *
 * Todo ocurre en una sola transacción, en el orden de `criterios/002_carga_y_validaciones.sql`:
 * candado por celda → celda libre → tabla temporal → V1–V5 (abortan) → V6–V9 (advertencias)
 * → huella → catálogo de ocupaciones → corte → hechos → cierre de la carga. V10 (el mismo
 * contenido en otra celda) ya no se aplica: los datos pueden repetirse entre periodos. Si
 * algo falla no queda nada a medias: el sitio nunca ve un corte cargado a la mitad.
 *
 * Solo carga en una celda **sin datos**, y el corte nace en `borrador`. Una celda con
 * datos no se recarga: se elimina antes su carga desde el historial. Aquí se vuelve a
 * mirar con el candado tomado, porque la subida lo comprobó sin él.
 *
 * @throws {ErrorDeCargaTendencia} con el reporte, si la celda ya tiene datos o alguna
 *   validación bloqueante falla.
 */
export async function importarPercentilesExcel(
  datos: Buffer,
  celda: CeldaDeCarga,
  onProgreso?: (progreso: ProgresoCarga) => void
): Promise<{ mensaje: string; reporte: ReporteCarga }> {
  const libro = await leerExcelPercentiles(datos, (leidas, total) =>
    onProgreso?.({ porcentaje: Math.round((leidas / Math.max(total, 1)) * 40), filasProcesadas: leidas, filasTotales: total })
  );
  const totalFilas = libro.filas.length;

  // El departamento se resuelve contra el catálogo único (migración 032). Uno que no
  // calce se guarda como NULL y lo reporta V1 con su fila, igual que el resto de errores.
  const departamentos = await DepartamentosRepository.resolverPorNombres(
    libro.filas.flatMap((f) => (f.departamentoTxt ? [f.departamentoTxt] : []))
  );
  const filas: FilaStaging[] = libro.filas.map((fila) => ({
    ...fila,
    departamentoId: fila.departamentoTxt ? (departamentos.get(fila.departamentoTxt)?.id ?? null) : null,
  }));

  return sequelize.transaction(async (transaction) => {
    await Repo.carga.bloquearCelda(transaction, celda.anio, celda.periodoId);
    // Sin la carga no hay a quién atribuir los datos: se eliminó mientras se leía el Excel.
    if (!(await Repo.carga.sigueExistiendo(transaction, celda.cargaId))) {
      throw new Error('La carga se eliminó del historial antes de guardarse.');
    }
    // Dos subidas a la misma celda vacía pasan las dos el control de la subida; la que
    // llega segunda encuentra aquí el corte de la primera.
    const ocupada = await Repo.obtenerCorteDeCelda(celda.anio, celda.periodoId, transaction);
    if (ocupada) {
      throw new ErrorDeCargaTendencia({
        errores: [
          hallazgoReporte('CONFLICTO', {
            total: 1,
            muestra: [{ mensaje: mensajeCeldaOcupada(celda.anio, celda.periodoNombre, ocupada.estado) }],
          }),
        ],
        advertencias: [],
      });
    }
    await Repo.carga.crearStaging(transaction);
    await Repo.carga.insertarStaging(transaction, filas, (insertadas) =>
      onProgreso?.({
        porcentaje: 40 + Math.round((insertadas / totalFilas) * 20),
        filasProcesadas: insertadas,
        filasTotales: totalFilas,
      })
    );

    const errores = conHallazgos(await Repo.carga.validacionesBloqueantes(transaction));
    onProgreso?.({ porcentaje: 70, filasProcesadas: totalFilas, filasTotales: totalFilas });
    const advertencias = conHallazgos(await Repo.carga.validacionesDeAdvertencia(transaction));
    onProgreso?.({ porcentaje: 80, filasProcesadas: totalFilas, filasTotales: totalFilas });

    if (errores.length > 0) throw new ErrorDeCargaTendencia({ errores, advertencias });

    // Sin V10: el mismo contenido puede estar en varias celdas, porque los datos se
    // repiten entre periodos (migración 034). La huella se guarda igual, como referencia.
    const huella = await Repo.carga.calcularHuella(transaction);

    await Repo.carga.upsertOcupaciones(transaction, celda.anio, celda.periodoId);

    const corteId = await Repo.carga.crearCorte(transaction, celda.anio, celda.periodoId, huella);
    onProgreso?.({ porcentaje: 85, filasProcesadas: totalFilas, filasTotales: totalFilas });

    await Repo.carga.guardarIndicadores(transaction, corteId);

    const reporte: ReporteCarga = { errores: [], advertencias };
    const mensaje =
      `${formatoMiles(totalFilas)} filas cargadas en ${celda.anio} · ${celda.periodoNombre} ` +
      `(${formatoMiles(libro.filasNacional)} nacionales y ${formatoMiles(libro.filasDepartamental)} departamentales)` +
      // Queda escrito en el historial: dice lo que pasó al cargar, no el estado de hoy
      // (ese lo da el corte, que se puede publicar después).
      '; quedó en borrador.' +
      (advertencias.length > 0
        ? ` Advertencias: ${advertencias.map((a) => `${a.codigo} (${formatoMiles(a.total)})`).join(', ')}.`
        : '');

    await Repo.carga.cerrarCompletada(transaction, {
      cargaId: celda.cargaId,
      corteId,
      filasNacional: libro.filasNacional,
      filasDepartamental: libro.filasDepartamental,
      reporte,
      mensaje,
    });

    return { mensaje, reporte };
  });
}

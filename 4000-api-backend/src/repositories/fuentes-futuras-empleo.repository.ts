import { CargaDatos } from '../infrastructure/db/models';

/** Valor de `cargas_datos.modulo` de esta tarjeta de "Actualizaciones". */
export const MODULO_CARGA = 'fuentes_futuras_empleo';

/**
 * Historial de cargas de "Fuentes futuras de empleo". Reutiliza `cargas_datos` —
 * la misma tabla de las otras tarjetas, distinta solo por `modulo`— y los métodos
 * sobre `archivos` (dedup por hash, borrado si queda suelto) siguen en
 * `ObservatorioRepository`, que ya es cross-módulo.
 *
 * A diferencia de los demás módulos, aquí la carga no importa nada a una tabla de
 * hechos: el Excel *es* el dato, y el portal lee el de la carga vigente. Por eso
 * `obtenerVigente` es el centro de este repositorio y no un detalle de auditoría.
 */
export const FuentesFuturasEmpleoRepository = {
  /** Nace completada: esta carga no pasa por la cola, se valida y se guarda en la misma petición. */
  crearCargaCompletada: (archivoId: string, subidoPor: string | null, filas: number, mensaje: string) =>
    CargaDatos.create({
      modulo: MODULO_CARGA,
      archivoId,
      subidoPor,
      estado: 'completado',
      progreso: 100,
      filasProcesadas: filas,
      filasTotales: filas,
      mensaje,
      completadoEn: new Date(),
    }),

  listarCargas: (limite = 20) =>
    CargaDatos.findAll({ where: { modulo: MODULO_CARGA }, order: [['creadoEn', 'DESC']], limit: limite }),

  obtenerCarga: (id: string) => CargaDatos.findOne({ where: { id, modulo: MODULO_CARGA } }),

  /**
   * La carga cuyo Excel ve hoy el portal: la última que entró. Cada carga reemplaza
   * entera a la anterior —el Excel trae todos los registros, no un incremento—, así
   * que eliminar la vigente deja vigente a la anterior, no deja un hueco.
   */
  obtenerVigente: () =>
    CargaDatos.findOne({
      where: { modulo: MODULO_CARGA, estado: 'completado' },
      order: [['creadoEn', 'DESC']],
    }),

  eliminarCarga: (id: string) => CargaDatos.destroy({ where: { id, modulo: MODULO_CARGA } }),
};

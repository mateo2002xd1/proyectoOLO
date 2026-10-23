import { Op } from 'sequelize';
import {
  CargaDatos,
  ProgramaSobresaliente,
  Departamento,
  CentroFormacion,
  NivelFormacion,
  ProgramaFormacion,
  Archivo,
} from '../infrastructure/db/models';

const MODULO = 'programa_sobresalientes';

/**
 * Única capa que toca los modelos Sequelize para la auditoría de cargas y la
 * lectura pública del observatorio. La escritura de `programas_sobresalientes`
 * en sí (catálogos + hechos) vive en
 * `use-cases/observatorio/importar-programas-excel.usecase.ts` — es lógica de
 * Mateo, con sus propios `bulkCreate`/`destroy` transaccionales, y no se
 * reparte entre dos archivos para no tener que sincronizar dos versiones de la
 * misma transacción.
 */
export const ObservatorioRepository = {
  /** Crea la fila de una carga nueva en estado «procesando». */
  crearCarga: (archivoId: string | null, subidoPor: string | null) =>
    CargaDatos.create({ modulo: MODULO, archivoId, subidoPor, estado: 'procesando' }),

  /**
   * Progreso en caliente de una carga en curso — se llama muchas veces durante
   * el procesamiento (ver `procesar-carga.usecase.ts`), siempre fuera de la
   * transacción grande de `importarProgramasExcel` para que quede visible de
   * inmediato a quien esté consultando `GET /cargas/:id`.
   */
  actualizarProgreso: (id: string, progreso: number, filasProcesadas: number, filasTotales?: number) =>
    CargaDatos.update(
      { progreso, filasProcesadas, ...(filasTotales !== undefined ? { filasTotales } : {}) },
      { where: { id } }
    ),

  /** Cierra una carga como completada: progreso al 100 %, filas y mensaje final. */
  marcarCargaCompletada: (id: string, filasProcesadas: number, mensaje: string) =>
    CargaDatos.update(
      { estado: 'completado', progreso: 100, filasProcesadas, mensaje, completadoEn: new Date() },
      { where: { id } }
    ),

  /** Cierra una carga como fallida, con el mensaje del error. */
  marcarCargaError: (id: string, mensaje: string) =>
    CargaDatos.update({ estado: 'error', mensaje, completadoEn: new Date() }, { where: { id } }),

  /** Las últimas cargas del módulo, de la más reciente a la más antigua. */
  listarCargas: (limite = 20) =>
    CargaDatos.findAll({ where: { modulo: MODULO }, order: [['creadoEn', 'DESC']], limit: limite }),

  /**
   * Una carga de **este** módulo por su id, o `null`.
   *
   * Filtra por `modulo` como `obtenerCarga` de alertas de inversión y de fuentes futuras. Con
   * `findByPk` a secas, `GET`/`DELETE /api/observatorio/cargas/:id` aceptaba el id de una carga
   * de cualquier otro módulo y la leía o la borraba (con su Excel): un id de un objeto servido
   * por la ruta de otro. Hoy los mismos roles operan los cuatro módulos, pero las policies son
   * separadas a propósito y el aislamiento no puede depender de que sigan coincidiendo.
   */
  obtenerCarga: (id: string) => CargaDatos.findOne({ where: { id, modulo: MODULO } }),

  /** Una carga por su id sea del módulo que sea; solo para decir a qué ruta pertenece. */
  obtenerCargaDeCualquierModulo: (id: string) => CargaDatos.findByPk(id),

  /** Borra la fila de una carga (el Excel lo gestiona `eliminarArchivoSiQuedaSuelto`). */
  eliminarCarga: (id: string) => CargaDatos.destroy({ where: { id } }),

  /**
   * ¿Algo más todavía necesita este archivo? El mismo `archivo_id` puede estar en
   * más de una `carga_datos` (mismo Excel subido dos veces, deduplicado por hash) o
   * en `contenidos_archivos` (adjunto de RF-02) — son las dos únicas tablas del
   * proyecto con FK hacia `archivos` (`002-tablas-nuevas`, `027-cargas-datos`).
   * Solo si ambas dan cero es seguro borrar el archivo físico y su fila.
   */
  otrasReferenciasAlArchivo: async (archivoId: string, idCargaExcluida: string): Promise<number> => {
    const otrasCargas = await CargaDatos.count({ where: { archivoId, id: { [Op.ne]: idCargaExcluida } } });
    return otrasCargas;
  },

  /** La fila de `archivos` de un Excel por su id, o `null`. */
  obtenerArchivo: (id: string) => Archivo.findByPk(id),

  /** Borra la fila de `archivos` de un Excel (el archivo físico se borra aparte). */
  eliminarArchivo: (id: string) => Archivo.destroy({ where: { id } }),

  /** `archivos.hash_sha256` es `UNIQUE` (RF-02): el mismo archivo subido dos veces no crea dos filas. */
  buscarArchivoPorHash: (hashSha256: string) => Archivo.findOne({ where: { hashSha256 } }),

  /** Registra en `archivos` un Excel recién guardado en disco, como archivo interno. */
  crearArchivo: (datos: {
    nombreOriginal: string;
    nombreAlmacenado: string;
    rutaRelativa: string;
    mimeType: string;
    extension: string;
    tamanoBytes: number;
    hashSha256: string;
    subidoPor: string | null;
  }) => Archivo.create({ ...datos, ambito: 'interno', estado: 'disponible' }),

  /** Los datos vigentes del observatorio, con los nombres de catálogo ya resueltos. */
  obtenerProgramasSobresalientes: () =>
    ProgramaSobresaliente.findAll({
      include: [
        { model: Departamento, as: 'departamento', attributes: ['id', 'nombre', 'codigo_dane'] },
        { model: CentroFormacion, as: 'centro', attributes: ['id', 'nombre'] },
        { model: NivelFormacion, as: 'nivelFormacion', attributes: ['id', 'nombre'] },
        { model: ProgramaFormacion, as: 'programa', attributes: ['id', 'nombre'] },
      ],
    }),
};

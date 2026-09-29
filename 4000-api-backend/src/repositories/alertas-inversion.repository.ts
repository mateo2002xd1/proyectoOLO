import { Op, QueryTypes } from 'sequelize';
import sequelize from '../config/database';
import {
  CargaDatos,
  CiiuSeccion,
  CiiuClase,
  Empresa,
  Municipio,
  Departamento,
  ProyectoInversion,
  ProyectoInversionUbicacion,
} from '../infrastructure/db/models';

export const MODULO_CARGA = 'alertas_inversion';

export interface UbicacionEntrada {
  departamentoId: string;
  municipioId: string | null;
}

export interface ProyectoInversionEntrada {
  tipo: 'nuevo' | 'expansion';
  descripcion: string;
  empresaId: string;
  seccionId: string;
  claseId: string | null;
  fechaAnuncio: string;
  fuenteUrl: string;
  fuenteMedio: string | null;
  inversionCop: number | null;
  empleosEstimados: number | null;
  ubicaciones: UbicacionEntrada[];
  creadoPor: string | null;
  /** Alta manual: `publicado` de una vez. Carga masiva: `borrador`, igual que hoy nace un corte. */
  estado?: 'borrador' | 'publicado';
}

/**
 * Única capa que toca los modelos Sequelize de "Alertas de inversión". El
 * historial de cargas reutiliza `cargas_datos` (la misma tabla de Observatorio,
 * distinta solo por `modulo`); los métodos sobre `archivos` (dedup por hash,
 * borrado si queda suelto) siguen en `ObservatorioRepository`, que ya es
 * cross-módulo (lo usa también la tendencia ocupacional).
 */
export const AlertasInversionRepository = {
  // --- Cargas (historial de "Actualizaciones") ---

  crearCarga: (archivoId: string | null, subidoPor: string | null) =>
    CargaDatos.create({ modulo: MODULO_CARGA, archivoId, subidoPor, estado: 'procesando' }),

  actualizarProgreso: (id: string, progreso: number, filasProcesadas: number, filasTotales?: number) =>
    CargaDatos.update(
      { progreso, filasProcesadas, ...(filasTotales !== undefined ? { filasTotales } : {}) },
      { where: { id } }
    ),

  marcarCargaCompletada: (id: string, filasProcesadas: number, mensaje: string) =>
    CargaDatos.update(
      { estado: 'completado', progreso: 100, filasProcesadas, mensaje, completadoEn: new Date() },
      { where: { id } }
    ),

  marcarCargaError: (id: string, mensaje: string) =>
    CargaDatos.update({ estado: 'error', mensaje, completadoEn: new Date() }, { where: { id } }),

  listarCargas: (limite = 20) =>
    CargaDatos.findAll({ where: { modulo: MODULO_CARGA }, order: [['creadoEn', 'DESC']], limit: limite }),

  obtenerCarga: (id: string) => CargaDatos.findOne({ where: { id, modulo: MODULO_CARGA } }),

  eliminarCarga: (id: string) => CargaDatos.destroy({ where: { id, modulo: MODULO_CARGA } }),

  // --- Catálogos ---

  /** Las secciones CIIU activas, para el formulario manual y para resolver texto libre del Excel. */
  listarSecciones: () => CiiuSeccion.findAll({ where: { activa: true }, order: [['letra', 'ASC']] }),

  /** Resuelve una letra de sección ('A'..'U') exacta. */
  buscarSeccionPorLetra: (letra: string) => CiiuSeccion.findOne({ where: { letra: letra.toUpperCase() } }),

  /** Resuelve una clase por su código de 4 dígitos, sin importar la sección (el código ya es único por sección). */
  buscarClasePorCodigo: (codigo: string) => CiiuClase.findOne({ where: { codigo } }),

  /** `empresas`: resuelve por nombre (case-insensitive) o crea. */
  async resolverOCrearEmpresa(nombre: string): Promise<Empresa> {
    const existente = await Empresa.findOne({ where: sequelize.where(sequelize.fn('lower', sequelize.col('nombre')), nombre.toLowerCase()) });
    if (existente) return existente;
    return Empresa.create({ nombre });
  },

  /** `municipios`: catálogo abierto, resuelve por (departamento, nombre) o crea. */
  async resolverOCrearMunicipio(departamentoId: string, nombre: string): Promise<Municipio> {
    const existente = await Municipio.findOne({ where: { departamento_id: departamentoId, nombre } });
    if (existente) return existente;
    return Municipio.create({ departamento_id: departamentoId, nombre });
  },

  // --- Proyectos ---

  crearProyecto: (datos: ProyectoInversionEntrada) =>
    sequelize.transaction(async (transaction) => {
      const proyecto = await ProyectoInversion.create(
        {
          tipo: datos.tipo,
          descripcion: datos.descripcion,
          empresa_id: datos.empresaId,
          seccion_id: datos.seccionId,
          clase_id: datos.claseId,
          fecha_anuncio: datos.fechaAnuncio,
          fuente_url: datos.fuenteUrl,
          fuente_medio: datos.fuenteMedio,
          inversion_cop: datos.inversionCop,
          empleos_estimados: datos.empleosEstimados,
          estado: datos.estado ?? 'publicado',
          creado_por: datos.creadoPor,
        },
        { transaction }
      );

      if (datos.ubicaciones.length > 0) {
        await ProyectoInversionUbicacion.bulkCreate(
          datos.ubicaciones.map((u) => ({
            proyecto_id: proyecto.get('id'),
            departamento_id: u.departamentoId,
            municipio_id: u.municipioId,
          })),
          { transaction }
        );
      }

      return proyecto;
    }),

  /**
   * Conteo de proyectos publicados por sección, para el gráfico público — calcado de
   * la consulta `grafico` del borrador de esquema de origen: `LEFT JOIN` desde el
   * catálogo para que salgan también las secciones en 0.
   */
  obtenerGraficoPorSeccion: (departamentoCodigoDane: string | null, anio: number | null) =>
    sequelize.query<{ letra: string; nombre: string; cantidad_proyectos: string }>(
      `SELECT s.letra, s.nombre, count(DISTINCT p.id) AS cantidad_proyectos
         FROM ciiu_secciones s
         LEFT JOIN proyectos_inversion p
                ON p.seccion_id = s.id
               AND p.estado = 'publicado'
               AND (:anio::int IS NULL OR EXTRACT(YEAR FROM p.fecha_anuncio) = :anio)
               AND (:codigoDane::char(2) IS NULL OR EXISTS (
                     SELECT 1 FROM proyectos_inversion_ubicaciones u
                     JOIN departamentos d ON d.id = u.departamento_id
                    WHERE u.proyecto_id = p.id AND d.codigo_dane = :codigoDane))
        WHERE s.activa
        GROUP BY s.id
        ORDER BY s.letra`,
      { replacements: { codigoDane: departamentoCodigoDane, anio }, type: QueryTypes.SELECT }
    ),

  /** Listado paginado de proyectos publicados, con sus ubicaciones ya resueltas a texto. */
  async listarPublicados(filtros: { seccionLetra: string | null; anio: number | null; pagina: number; porPagina: number }) {
    // `sequelize.where(...)` es una condición completa, no el valor de una clave: va en
    // un `AND` aparte, no asignada a `where.fecha_anuncio`.
    const condiciones: any[] = [{ estado: 'publicado' }];
    if (filtros.anio) {
      condiciones.push(
        sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('YEAR FROM fecha_anuncio')), filtros.anio)
      );
    }
    const where = { [Op.and]: condiciones };

    const include: any[] = [
      { model: Empresa, as: 'empresa', attributes: ['id', 'nombre'] },
      { model: CiiuSeccion, as: 'seccion', attributes: ['id', 'letra', 'nombre'] },
      { model: CiiuClase, as: 'clase', attributes: ['id', 'codigo', 'nombre'] },
      {
        model: ProyectoInversionUbicacion,
        as: 'ubicaciones',
        include: [
          { model: Departamento, as: 'departamento', attributes: ['id', 'nombre', 'codigo_dane'] },
          { model: Municipio, as: 'municipio', attributes: ['id', 'nombre'] },
        ],
      },
    ];

    if (filtros.seccionLetra) {
      include[1].where = { letra: filtros.seccionLetra };
    }

    const { rows, count } = await ProyectoInversion.findAndCountAll({
      where,
      include,
      distinct: true,
      order: [['fecha_anuncio', 'DESC']],
      limit: filtros.porPagina,
      offset: (filtros.pagina - 1) * filtros.porPagina,
    });

    return { rows, total: count };
  },

  /** Todos los años con al menos un proyecto publicado, del más reciente al más antiguo. */
  listarAniosConDatos: () =>
    sequelize.query<{ anio: number }>(
      `SELECT DISTINCT EXTRACT(YEAR FROM fecha_anuncio)::int AS anio
         FROM proyectos_inversion WHERE estado = 'publicado' ORDER BY anio DESC`,
      { type: QueryTypes.SELECT }
    ),
};

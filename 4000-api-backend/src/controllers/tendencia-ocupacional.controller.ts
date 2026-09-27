import { NextFunction, Request, Response } from 'express';
import type { ZodError } from 'zod';
import {
  consultarOpcionesTendencia,
  consultarTendencia,
} from '../use-cases/observatorio/tendencia-ocupacional/consultar-tendencia.usecase';
import {
  consultarEstadoCargasTendencia,
  despublicarCorteTendencia,
  listarCargasTendencia,
  obtenerCargaTendencia,
  publicarCortesTendencia,
} from '../use-cases/observatorio/tendencia-ocupacional/gestionar-cortes-tendencia.usecase';
import { eliminarCargaTendencia } from '../use-cases/observatorio/tendencia-ocupacional/eliminar-carga-tendencia.usecase';
import { iniciarCargaTendencia } from '../use-cases/observatorio/tendencia-ocupacional/iniciar-carga-tendencia.usecase';
import { idReferenciable } from '../shared/auditoria-request';
import {
  consultaTendenciaSchema,
  historialCargasSchema,
  idCargaSchema,
  idCorteSchema,
  opcionesTendenciaSchema,
} from '../validators/tendencia-ocupacional.validators';

/** Mismo formato que `validarCuerpo`, para el querystring y los parámetros de ruta. */
const datosInvalidos = (res: Response, error: ZodError) =>
  res.status(400).json({
    error: 'Datos inválidos',
    detalles: error.issues.map((issue) => ({ campo: issue.path.join('.') || '(raíz)', mensaje: issue.message })),
  });

/**
 * Tendencia ocupacional (percentiles inscritos vs. vacantes). Las dos primeras rutas son
 * públicas; el resto es del panel de "Actualizaciones" (ver `observatorio.routes.ts`).
 */
export const TendenciaOcupacionalController = {
  /** Buscador público: un criterio por bloque del sitio, filtros y paginación en SQL. */
  async buscar(req: Request, res: Response, next: NextFunction) {
    const consulta = consultaTendenciaSchema.safeParse(req.query);
    if (!consulta.success) return datosInvalidos(res, consulta.error);

    try {
      const { pagina, porPagina, ...filtros } = consulta.data;
      res.json(await consultarTendencia(filtros, pagina, porPagina));
    } catch (error) {
      next(error);
    }
  },

  /** Opciones de los cuatro desplegables del buscador. */
  async opciones(req: Request, res: Response, next: NextFunction) {
    const consulta = opcionesTendenciaSchema.safeParse(req.query);
    if (!consulta.success) return datosInvalidos(res, consulta.error);

    try {
      res.json(await consultarOpcionesTendencia(consulta.data.anio));
    } catch (error) {
      next(error);
    }
  },

  /** Recibe el Excel de una celda y lo encola. El cuerpo ya pasó por `cargaTendenciaSchema`. */
  async subir(req: Request, res: Response, next: NextFunction) {
    try {
      const archivo = (req as Request & { file?: Express.Multer.File }).file;
      if (!archivo) return res.status(400).json({ error: 'No se envió ningún archivo.' });

      const { anio, periodo } = req.body as { anio: number; periodo: string };
      // `idReferenciable`: la cuenta maestra local lleva `id: 'local-auth'`, que no es un
      // UUID y rompía el INSERT contra `cargas_datos.subido_por`.
      const { cargaId } = await iniciarCargaTendencia(archivo.buffer, archivo.originalname, idReferenciable(req.user), {
        anio,
        periodo,
      });

      res.status(202).json({ cargaId, message: 'Archivo recibido, procesando...' });
    } catch (error) {
      next(error);
    }
  },

  /** Historial paginado, opcionalmente de un año y/o un periodo. */
  async listarCargas(req: Request, res: Response, next: NextFunction) {
    const consulta = historialCargasSchema.safeParse(req.query);
    if (!consulta.success) return datosInvalidos(res, consulta.error);

    try {
      res.json(await listarCargasTendencia(consulta.data));
    } catch (error) {
      next(error);
    }
  },

  /** Una carga con su reporte de validaciones: el panel la sondea mientras se procesa. */
  async obtenerCarga(req: Request, res: Response, next: NextFunction) {
    const id = idCargaSchema.safeParse(req.params.id);
    if (!id.success) return datosInvalidos(res, id.error);

    try {
      const carga = await obtenerCargaTendencia(id.data);
      if (!carga) return res.status(404).json({ error: 'Carga no encontrada.' });
      res.json(carga);
    } catch (error) {
      next(error);
    }
  },

  /** Borra la carga, su Excel si nadie más lo usa y, si era la vigente, los datos de su corte. */
  async eliminarCarga(req: Request, res: Response, next: NextFunction) {
    const id = idCargaSchema.safeParse(req.params.id);
    if (!id.success) return datosInvalidos(res, id.error);

    try {
      res.json(await eliminarCargaTendencia(id.data));
    } catch (error) {
      next(error);
    }
  },

  /** Devuelve la matriz año × periodo con el estado de carga de cada celda. */
  async estado(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await consultarEstadoCargasTendencia());
    } catch (error) {
      next(error);
    }
  },

  /** El cuerpo ya pasó por `publicarCortesSchema`. */
  async publicar(req: Request, res: Response, next: NextFunction) {
    try {
      const { corteIds } = req.body as { corteIds: string[] };
      res.json({ publicados: await publicarCortesTendencia(corteIds) });
    } catch (error) {
      next(error);
    }
  },

  /** Retira del sitio público un corte de datos ya publicado. */
  async despublicar(req: Request, res: Response, next: NextFunction) {
    const id = idCorteSchema.safeParse(req.params.id);
    if (!id.success) return datosInvalidos(res, id.error);

    try {
      await despublicarCorteTendencia(id.data);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};

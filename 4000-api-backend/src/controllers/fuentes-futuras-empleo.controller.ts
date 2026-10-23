import { describirErrorParaLog } from '../shared/errores';
import { Request, Response } from 'express';
import { consultarFuentesFuturasActual } from '../use-cases/observatorio/fuentes-futuras/consultar-fuentes-futuras-actual.usecase';
import {
  iniciarCargaFuentesFuturas,
  ErrorDeSubida,
  ErrorDeExcelFuentesFuturas,
} from '../use-cases/observatorio/fuentes-futuras/iniciar-carga-fuentes-futuras.usecase';
import { listarCargasFuentesFuturas } from '../use-cases/observatorio/fuentes-futuras/listar-cargas-fuentes-futuras.usecase';
import {
  eliminarCargaFuentesFuturas,
  ErrorAlEliminarCarga,
} from '../use-cases/observatorio/fuentes-futuras/eliminar-carga-fuentes-futuras.usecase';
import { idReferenciable } from '../shared/auditoria-request';

/**
 * "Fuentes futuras de empleo": una tarjeta de "Actualizaciones" y la sección pública que
 * alimenta. Su endpoint público no lleva sesión — es analítica agregada, como el resto
 * del observatorio.
 */
export const FuentesFuturasEmpleoController = {
  /** Los registros vigentes para el portal — público, sin sesión. */
  async obtenerActual(_req: Request, res: Response) {
    try {
      res.json(await consultarFuentesFuturasActual());
    } catch (error) {
      console.error('[fuentes-futuras-empleo] Error al consultar los datos actuales:', describirErrorParaLog(error));
      res.status(500).json({ error: 'Error al consultar los datos de fuentes futuras de empleo.' });
    }
  },

  /**
   * Sube el Excel y lo deja vigente en la misma petición: esta carga no pasa por la cola,
   * así que la respuesta es 201 con la carga ya completada, no un 202 "procesando".
   */
  async subir(req: Request, res: Response) {
    try {
      const archivo = (req as any).file as Express.Multer.File | undefined;
      if (!archivo) {
        return res.status(400).json({ error: 'No se envió ningún archivo.' });
      }

      // `idReferenciable` y no `req.user.id`: la cuenta maestra local lleva
      // `id: 'local-auth'`, que no es un UUID (ver `ObservatorioController.subir`).
      const { cargaId, filas } = await iniciarCargaFuentesFuturas(
        archivo.buffer,
        archivo.originalname,
        idReferenciable(req.user)
      );

      res.status(201).json({ cargaId, filas, message: 'Archivo publicado.' });
    } catch (error) {
      if (error instanceof ErrorDeSubida || error instanceof ErrorDeExcelFuentesFuturas) {
        return res.status(error.status).json({ error: error.message });
      }
      console.error('[fuentes-futuras-empleo] Error al subir el archivo:', describirErrorParaLog(error));
      res.status(500).json({ error: 'Error al procesar el archivo.' });
    }
  },

  async listarCargas(_req: Request, res: Response) {
    try {
      res.json(await listarCargasFuentesFuturas());
    } catch (error) {
      console.error('[fuentes-futuras-empleo] Error al listar cargas:', describirErrorParaLog(error));
      res.status(500).json({ error: 'Error al listar las cargas.' });
    }
  },

  /** Borra la carga, su Excel si queda suelto, y devuelve el portal a la carga anterior. */
  async eliminarCarga(req: Request, res: Response) {
    try {
      res.json(await eliminarCargaFuentesFuturas(req.params.id as string));
    } catch (error) {
      if (error instanceof ErrorAlEliminarCarga) {
        return res.status(error.status).json({ error: error.message });
      }
      console.error('[fuentes-futuras-empleo] Error al eliminar la carga:', describirErrorParaLog(error));
      res.status(500).json({ error: 'Error al eliminar la carga.' });
    }
  },
};

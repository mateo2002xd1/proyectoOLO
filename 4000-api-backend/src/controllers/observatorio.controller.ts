import { Request, Response } from 'express';
import { iniciarCargaObservatorio, ErrorDeSubida } from '../use-cases/observatorio/iniciar-carga.usecase';
import { listarCargasObservatorio, obtenerCargaObservatorio } from '../use-cases/observatorio/listar-cargas.usecase';
import { eliminarCargaObservatorio, ErrorAlEliminarCarga } from '../use-cases/observatorio/eliminar-carga.usecase';
import { consultarObservatorioActual } from '../use-cases/observatorio/consultar-actual.usecase';
import { resolverFormatoDeCarga, ErrorDeFormato } from '../use-cases/observatorio/formatos-de-carga';
import { idReferenciable } from '../shared/auditoria-request';

export const ObservatorioController = {
  /** Sube el Excel y arranca la carga de inmediato — sin paso de aprobación. */
  async subir(req: Request, res: Response) {
    try {
      const archivo = (req as any).file as Express.Multer.File | undefined;
      if (!archivo) {
        return res.status(400).json({ error: 'No se envió ningún archivo.' });
      }

      // `idReferenciable` y no `req.user.id`: la cuenta maestra local lleva
      // `id: 'local-auth'`, que no es un UUID, y la subida reventaba con un 500.
      const { cargaId } = await iniciarCargaObservatorio(
        archivo.buffer,
        archivo.originalname,
        idReferenciable(req.user)
      );

      res.status(202).json({ cargaId, message: 'Archivo recibido, procesando...' });
    } catch (error) {
      if (error instanceof ErrorDeSubida) {
        return res.status(error.status).json({ error: error.message });
      }
      console.error('[observatorio] Error al subir el archivo:', error);
      res.status(500).json({ error: 'Error al procesar el archivo.' });
    }
  },

  /** Historial de cargas — para el listado de la tarjeta "Programa + Sobresalientes". */
  async listarCargas(_req: Request, res: Response) {
    try {
      res.json(await listarCargasObservatorio());
    } catch (error) {
      console.error('[observatorio] Error al listar cargas:', error);
      res.status(500).json({ error: 'Error al listar las cargas.' });
    }
  },

  /** Estado de una carga puntual — para que el admin vea el resultado sin refrescar la lista. */
  async obtenerCarga(req: Request, res: Response) {
    try {
      const carga = await obtenerCargaObservatorio(req.params.id as string);
      if (!carga) return res.status(404).json({ error: 'Carga no encontrada.' });
      res.json(carga);
    } catch (error) {
      console.error('[observatorio] Error al consultar la carga:', error);
      res.status(500).json({ error: 'Error al consultar la carga.' });
    }
  },

  /** Borra la carga y, si nadie más comparte el archivo, también el Excel de disco. */
  async eliminarCarga(req: Request, res: Response) {
    try {
      await eliminarCargaObservatorio(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      if (error instanceof ErrorAlEliminarCarga) {
        return res.status(error.status).json({ error: error.message });
      }
      console.error('[observatorio] Error al eliminar la carga:', error);
      res.status(500).json({ error: 'Error al eliminar la carga.' });
    }
  },

  /** Excel de ejemplo de una tarjeta de "Actualizaciones" — las hojas y columnas que espera su carga. */
  async descargarFormato(req: Request, res: Response) {
    try {
      const { ruta, nombreDescarga } = await resolverFormatoDeCarga(req.params.formato as string);
      // Pide sesión de Administrador: que ningún intermediario guarde una copia.
      res.set('Cache-Control', 'private, no-cache');
      res.download(ruta, nombreDescarga, { cacheControl: false }, (error) => {
        if (!error) return;
        console.error('[observatorio] Error al enviar el formato de carga:', error);
        if (!res.headersSent) res.status(500).json({ error: 'Error al descargar el formato.' });
      });
    } catch (error) {
      if (error instanceof ErrorDeFormato) {
        return res.status(error.status).json({ error: error.message });
      }
      console.error('[observatorio] Error al descargar el formato de carga:', error);
      res.status(500).json({ error: 'Error al descargar el formato.' });
    }
  },

  /** Datos vigentes — público, sin sesión. Lo consume el mapa del sitio. */
  async obtenerActual(_req: Request, res: Response) {
    try {
      res.json(await consultarObservatorioActual());
    } catch (error) {
      console.error('[observatorio] Error al consultar los datos actuales:', error);
      res.status(500).json({ error: 'Error al consultar los datos.' });
    }
  },
};

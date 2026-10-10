import fs from 'fs/promises';
import type { Request, Response, NextFunction } from 'express';
import {
  actualizarIdentidadPanel,
  obtenerIdentidadPanel,
  restablecerImagenDeIdentidad,
  subirImagenDeIdentidad,
} from '../use-cases/configuracion/identidad-panel.usecase';
import { resolverArchivoDeIdentidad } from '../infrastructure/storage/filesystem';
import { datosDeAuditoria, idReferenciable } from '../shared/auditoria-request';
import type { PiezaDeIdentidad } from '../validators/configuracion.validators';

/** Configuración del panel. Hoy, su identidad visual (migración 044). */
export const ConfiguracionController = {
  /** `GET /api/configuracion/identidad-panel`. */
  async obtenerIdentidad(_req: Request, res: Response, next: NextFunction) {
    try {
      // Cambia cuando alguien la guarda y la lee el panel en cada carga: nada de caché.
      res.setHeader('Cache-Control', 'no-store');
      res.json(await obtenerIdentidadPanel());
    } catch (error) {
      next(error);
    }
  },

  /** `PATCH /api/configuracion/identidad-panel`: colores y logo en modo oscuro. */
  async actualizarIdentidad(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await actualizarIdentidadPanel(req.body, idReferenciable(req.user), datosDeAuditoria(req)));
    } catch (error) {
      next(error);
    }
  },

  /** `POST /api/configuracion/identidad-panel/{logo|icono}`. */
  subirImagen: (pieza: PiezaDeIdentidad) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No se envió ningún archivo.' });
      res.json(await subirImagenDeIdentidad(pieza, req.file.buffer, idReferenciable(req.user), datosDeAuditoria(req)));
    } catch (error) {
      next(error);
    }
  },

  /** `DELETE /api/configuracion/identidad-panel/{logo|icono}`: vuelve a la de fábrica. */
  restablecerImagen: (pieza: PiezaDeIdentidad) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await restablecerImagenDeIdentidad(pieza, idReferenciable(req.user), datosDeAuditoria(req)));
    } catch (error) {
      next(error);
    }
  },

  /**
   * `GET /api/configuracion/identidad-panel/archivos/{nombre}`.
   *
   * Caché de un año, `immutable`: el nombre es un UUID que pone la subida y un logo nuevo
   * trae otro nombre, así que esta URL nunca devuelve otra imagen. Mismo criterio que los
   * `uploads/` del sitio en `archivos.controller.ts`.
   */
  async servirArchivo(req: Request, res: Response) {
    const archivo = resolverArchivoDeIdentidad(String(req.params.nombre ?? ''));
    const esArchivo = archivo
      ? await fs.stat(archivo.rutaAbsoluta).then((info) => info.isFile(), () => false)
      : false;
    if (!archivo || !esArchivo) return res.status(404).end();

    res.setHeader('Content-Type', archivo.mime);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.sendFile(archivo.rutaAbsoluta, { dotfiles: 'deny', cacheControl: false }, (error) => {
      if (error && !res.headersSent) {
        res.removeHeader('Cache-Control');
        res.status(404).end();
      }
    });
  },
};

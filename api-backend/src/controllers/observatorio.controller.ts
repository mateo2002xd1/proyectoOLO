import { Request, Response, NextFunction } from 'express';
import { importarProgramasExcel } from '../use-cases/observatorio/importar-programas-excel.usecase';

export const ObservatorioController = {
  async importar(req: Request, res: Response, next: NextFunction) {
    try {
      // Validar que el cuerpo es un Buffer (vía express.raw)
      if (!Buffer.isBuffer(req.body)) {
        return res.status(400).json({ error: 'El cuerpo de la petición debe ser binario (application/octet-stream)' });
      }

      if (req.body.length === 0) {
        return res.status(400).json({ error: 'El archivo enviado está vacío.' });
      }

      const result = await importarProgramasExcel(req.body);
      res.json(result);
    } catch (err: any) {
      console.error('[ObservatorioController.importar] Error:', err);
      // Extraemos el mensaje original lanzado por la lógica del use-case si es conocido
      const mensaje = err instanceof Error ? err.message : 'Error interno al importar el archivo.';
      res.status(400).json({ error: mensaje });
    }
  },
};

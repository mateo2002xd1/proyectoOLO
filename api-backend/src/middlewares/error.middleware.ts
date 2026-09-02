import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const status = err.status || err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${status}: ${message}`);
    // if (status === 500) console.error(err.stack); // REGLA 95.3 BE: Desactivado para evitar volcar variables sensibles en la traza
  } else {
    // En producción, sanitizar errores 500 para no filtrar stack traces o detalles
    if (status === 500) {
      message = 'Error interno del servidor';
    }
  }

  res.status(status).json({ error: message });
}

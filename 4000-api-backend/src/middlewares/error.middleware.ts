import { Request, Response, NextFunction } from 'express';

/**
 * Único punto que convierte un error en respuesta HTTP (§6 de las convenciones): toma
 * el `status` que puso el caso de uso (500 si no trae) y en producción sustituye el
 * mensaje de los 500 por uno genérico, para no filtrar detalles internos.
 */
export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const status = err.status || err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${status}: ${message}`);
    // No se vuelca `err.stack` ni siquiera en desarrollo: la traza puede llevar
    // variables sensibles (regla 95.3 BE). Basta con el método, la ruta y el mensaje.
  } else {
    // En producción, sanitizar errores 500 para no filtrar stack traces o detalles
    if (status === 500) {
      message = 'Error interno del servidor';
    }
  }

  res.status(status).json({ 
    error: message,
    ...(err.code && { code: err.code }) 
  });
}

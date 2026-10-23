import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { describirErrorParaLog, esErrorDeDominio, MENSAJE_ERROR_INTERNO } from '../shared/errores';

/**
 * Único punto que convierte un error en respuesta HTTP (§6 de las convenciones).
 *
 * Al cliente solo le llega el texto de un **error de dominio** (`esErrorDeDominio`: el
 * código lo lanzó a propósito, con `status` 4xx). Cualquier otro error —Sequelize, disco,
 * Redis, un `TypeError`— sale como un 500 genérico **en producción**, sea cual sea el
 * `status` que traiga, y su `code` tampoco viaja: `ENOSPC` o `ECONNREFUSED` ya dicen
 * demasiado de la infraestructura. Antes se sustituía solo el `status === 500` exacto y el
 * `code` salía siempre.
 *
 * Fuera de producción el mensaje real sí se devuelve, para depurar. El fallo se registra
 * siempre —también en producción, donde antes un 500 no dejaba ni rastro—, en una línea
 * y sin `stack` (regla 95.3 BE: la traza puede llevar variables sensibles).
 */
export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const dominio = esErrorDeDominio(err);
  const esJsonRoto = err?.type === 'entity.parse.failed';
  const status: number = dominio ? err.status : 500;

  console.error(
    `[${new Date().toISOString()}] ${req.method} ${req.path} → ${status}: ${describirErrorParaLog(err)}`
  );

  // `body-parser` marca como 400 un JSON mal formado y pone en el mensaje el trozo que no
  // pudo leer («Unexpected token…»): es un error de librería, no un texto para el usuario.
  let message: string;
  if (esJsonRoto) message = 'El cuerpo de la petición no es un JSON válido.';
  else if (dominio) message = err.message;
  else if (!config.esProduccion) message = err?.message || MENSAJE_ERROR_INTERNO;
  else message = MENSAJE_ERROR_INTERNO;

  const code = dominio && !esJsonRoto && typeof err.code === 'string' ? err.code : undefined;

  res.status(esJsonRoto ? 400 : status).json({
    error: message,
    ...(code && { code }),
  });
}

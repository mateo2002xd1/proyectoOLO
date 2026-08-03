import type { Request } from 'express';

/**
 * Saca de la petición el "quién y desde dónde" de una entrada de bitácora.
 *
 * Vive aquí porque es lo único de la auditoría que necesita el objeto `Request`:
 * los use-cases no lo reciben ni deben recibirlo, así que la extracción ocurre en
 * el borde (el controlador) y hacia dentro solo viajan datos.
 *
 * `ip` y `userAgent` se rellenan aquí y no en el modelo porque hasta ahora nadie
 * los mandaba: las columnas existen desde la migración 006 y todas las filas las
 * habrían tenido en NULL.
 */
export const datosDeAuditoria = (req: Request) => ({
  usuarioId: req.user?.id ?? null,
  // El nombre se guarda junto al id a propósito (única desnormalización del
  // esquema): si el usuario se borra, la fila debe seguir siendo legible.
  usuarioNombre: req.user?.name ?? req.user?.email ?? null,
  ip: req.ip ?? null,
  userAgent: req.headers['user-agent'] ?? null,
});

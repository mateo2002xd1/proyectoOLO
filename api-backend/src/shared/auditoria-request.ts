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
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * El id solo viaja si de verdad apunta a una fila de `usuarios`.
 *
 * `usuario_id` tiene clave foránea contra esa tabla, y la **cuenta maestra local**
 * (`login.usecase.ts`) inicia sesión con `id: 'local-auth'`, que no está en la base
 * ni es un UUID. Mandarlo hacía que el INSERT reventara contra la foránea y que
 * `logAudit` se tragara el error: el administrador con más poder del sistema era
 * justo el único que no dejaba rastro.
 *
 * Con el id en `null` la fila sí se escribe, y `usuario_nombre` —que se guarda
 * precisamente para estos casos— deja dicho quién fue.
 */
const idReferenciable = (usuario: Request['user']) => {
  if (!usuario || usuario.isLocal) return null;
  return typeof usuario.id === 'string' && UUID.test(usuario.id) ? usuario.id : null;
};

/** El "desde dónde": lo único de la bitácora que no depende de quién es el actor. */
export const origenDeLaPeticion = (req: Request) => ({
  ip: req.ip ?? req.socket?.remoteAddress ?? null,
  userAgent: (req.headers['user-agent'] as string) ?? null,
});

/** El nombre se guarda junto al id a propósito (única desnormalización del esquema):
 *  si el usuario se borra, la fila debe seguir siendo legible. */
const nombreDe = (usuario: Request['user']) =>
  usuario?.name ? (usuario.apellidos ? `${usuario.name} ${usuario.apellidos}` : usuario.name) : (usuario?.email ?? null);

export const datosDeAuditoria = (req: Request) => ({
  usuarioId: idReferenciable(req.user),
  usuarioNombre: nombreDe(req.user),
  ...origenDeLaPeticion(req),
});

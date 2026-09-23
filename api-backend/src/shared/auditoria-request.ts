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

/** Las dos aplicaciones con pantalla de acceso propia. */
export const APLICACIONES_DE_ACCESO = ['sitio-web', 'intranet'] as const;

export type AplicacionDeAcceso = (typeof APLICACIONES_DE_ACCESO)[number];

/**
 * En cuál de los dos portales ocurre la petición, o `null` si no lo dice.
 *
 * Hace falta porque sitio-web e intranet entran por el **mismo** `POST /api/login`:
 * vistas desde la API las dos peticiones son idénticas —misma ruta, mismo cuerpo, y en
 * el sitio-web hasta la abre el servidor de Next, no el navegador—, así que la bitácora
 * no tenía forma de decir en cuál de los dos se inició sesión. Cada aplicación lo marca
 * en su propia llamada.
 *
 * **Se comprueba contra la lista en vez de guardarse tal cual.** Es un dato que manda el
 * cliente en una cabecera, y el login es la ruta más expuesta del sistema: cualquiera
 * puede escribir ahí lo que quiera, pero lo que escriba no puede acabar copiado dentro
 * de la tabla que sirve de evidencia.
 *
 * `null` tampoco es un fallo: una petición sin la cabecera —un script, una prueba, un
 * cliente viejo— se audita igual, solo que sin decir desde dónde.
 */
export const aplicacionDeLaPeticion = (req: Request): AplicacionDeAcceso | null => {
  const valor = String(req.headers['x-origen-app'] ?? '').trim().toLowerCase();

  return (APLICACIONES_DE_ACCESO as readonly string[]).includes(valor)
    ? (valor as AplicacionDeAcceso)
    : null;
};

/** El nombre se guarda junto al id a propósito (única desnormalización del esquema):
 *  si el usuario se borra, la fila debe seguir siendo legible. */
const nombreDe = (usuario: Request['user']) =>
  usuario?.name ? (usuario.apellidos ? `${usuario.name} ${usuario.apellidos}` : usuario.name) : (usuario?.email ?? null);

export const datosDeAuditoria = (req: Request) => ({
  usuarioId: idReferenciable(req.user),
  usuarioNombre: nombreDe(req.user),
  ...origenDeLaPeticion(req),
});

/**
 * Autorización a nivel de objeto (BOLA).
 *
 * El JWT dice **quién** eres; no dice **sobre qué** puedes actuar. Un token válido y
 * un rol suficiente siguen sin autorizar a tocar una fila concreta: eso solo se sabe
 * cargando la fila y comparando de quién es. Estas funciones son ese último paso, y
 * se llaman desde el caso de uso —no desde un middleware— porque es allí donde el
 * objeto ya está cargado y donde pasan **todos** los caminos que llegan a él, venga
 * la petición de un controlador, de un job o de otro caso de uso.
 *
 * El estilo de error es el del proyecto (`Object.assign(new Error(...), { status })`),
 * que `error.middleware.ts` ya traduce a JSON. Las clases de `shared/errors/` siguen
 * siendo un stub que no usa nadie; no se estrenan aquí.
 *
 * @see 3-seguridad-del-proyecto.md §S10
 */

const error = (mensaje: string, status: number) => Object.assign(new Error(mensaje), { status });

/**
 * Marca que distingue un middleware de autorización de cualquier otro.
 *
 * Existe para `scripts/verificar-propiedad.ts`, que recorre los routers de Express y
 * comprueba que ninguna ruta con `:id` llegue al controlador solo con `requireAuth`.
 * Los middlewares se construyen con fábricas que devuelven flechas anónimas, así que
 * por el nombre no se distinguen entre sí ni de un `cacheInterceptor`; identificarlos
 * por posición o por nombre habría dejado de funcionar en silencio al primer cambio.
 */
const MARCA = Symbol.for('olo.guardia-de-autorizacion');

/** Etiqueta un middleware como guardia de autorización. Devuelve el mismo middleware. */
export const marcarGuardia = <T extends Function>(middleware: T, detalle: string): T => {
  (middleware as any)[MARCA] = detalle;
  return middleware;
};

/** Qué comprueba este middleware, o `null` si no es un guardia de autorización. */
export const detalleDeGuardia = (middleware: unknown): string | null =>
  (middleware as any)?.[MARCA] ?? null;

/** Compara dos identificadores tolerando tipos distintos. Nulo nunca es dueño de nada. */
export const esDueno = (duenoId: unknown, actorId: unknown): boolean =>
  duenoId != null && actorId != null && String(duenoId) === String(actorId);

/**
 * Exige que el actor sea el dueño del recurso, salvo que un permiso lo exima.
 *
 * `ocultar` decide entre 403 y 404. Un 403 confirma que el objeto existe, lo que
 * convierte el endpoint en un enumerador: probando ids se averigua cuántos usuarios
 * o cuántos trabajos hay. Se usa 404 cuando el recurso no debería ni ser visible para
 * quien pregunta (trabajos en cola, contenido sin publicar), y 403 cuando su
 * existencia ya es pública para esa sesión y lo que falta es el derecho a actuar.
 */
export const exigirPropiedad = (opciones: {
  duenoId: unknown;
  actorId: unknown;
  /** `true` cuando el rol ya autoriza a actuar sobre lo ajeno (administración). */
  omitir?: boolean;
  /** Cómo se nombra el recurso en el mensaje de error. */
  recurso?: string;
  /** Responder 404 en vez de 403 para no delatar que el objeto existe. */
  ocultar?: boolean;
}): void => {
  const { duenoId, actorId, omitir = false, recurso = 'recurso', ocultar = false } = opciones;

  if (omitir) return;
  if (esDueno(duenoId, actorId)) return;

  throw ocultar
    ? error(`${recurso} no encontrado`, 404)
    : error(`No tienes permisos sobre este ${recurso}`, 403);
};

/**
 * Exige que un recurso anidado pertenezca de verdad al padre que dice la URL.
 *
 * `DELETE /api/contenidos/A/attachments/X` cargaba `X` por su id y borraba el fichero
 * del disco sin mirar si `X` era de `A`. Es el mismo agujero que `eliminar-version`
 * ya cierra a mano al comprobar `version.paginaId !== pagina.id`: la ruta declara una
 * jerarquía que nadie estaba verificando.
 *
 * Siempre 404: para quien pide por la ruta equivocada, ese hijo no existe ahí.
 */
export const exigirPertenencia = (opciones: {
  padreReal: unknown;
  padreEsperado: unknown;
  recurso?: string;
}): void => {
  const { padreReal, padreEsperado, recurso = 'recurso' } = opciones;

  if (esDueno(padreReal, padreEsperado)) return;

  throw error(`${recurso} no encontrado`, 404);
};

/**
 * Piezas comunes de autorización: de quién es un objeto, cómo se reconoce un guardia
 * y cómo se lee el rol de quien pide.
 *
 * El JWT dice **quién** eres; no dice **sobre qué** puedes actuar (BOLA). Un token
 * válido y un rol suficiente siguen sin autorizar a tocar una fila concreta: eso solo
 * se sabe cargando la fila y comparando de quién es, que es lo que hace `esDueno`
 * desde los routers de usuarios y roles y desde `listar-usuarios.usecase.ts`.
 *
 * @see 3-seguridad-del-proyecto.md §S10
 */

/**
 * Marca que distingue un middleware de autorización de cualquier otro.
 *
 * Existe para `scripts/verificaciones/verificar-propiedad.ts`, que recorre los routers de Express y
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
 * Lo que reciben las policies de `policies/*.ts` para decidir si un rol puede algo:
 * el nombre del rol a secas, o el objeto `{ role, permisos }` con el que
 * `req.user` (armado en `auth.middleware.ts`) y algunos casos de uso lo llevan.
 *
 * Existe porque las policies aceptaban antes solo un string, y al añadirles el
 * respaldo por `permisos` (para roles personalizados sin nombre fijo) pasaron a
 * esperar `{ role, permisos }` — pero no todas las llamadas se actualizaron. La
 * mitad del código seguía pasando el string suelto: `actor?.role`, `user.role?.name`,
 * `rolActual?.name`. Cada una de esas llamadas leía entonces `"Administrador".role`
 * (`undefined`) y la policy devolvía `false` en silencio, sin lanzar ningún error —
 * el mismo patrón que ya rompió `paginas.policies.ts` una vez (ver su comentario) y
 * que aquí volvió a colarse porque el cambio de forma no tocó todas las llamadas.
 * Normalizar aquí, en un solo sitio, es lo que hace que dé igual qué forma llegue.
 */
export type ActorDePolicy = string | null | undefined | { role?: string | null; permisos?: string[] | null };

/** El nombre de rol, venga el actor como string o como `{ role, permisos }`. */
export const rolDeActor = (actor: ActorDePolicy): string | null | undefined =>
  typeof actor === 'string' || actor == null ? actor : actor.role;

/** Los permisos del actor, o `undefined` si llegó como string suelto (no los lleva). */
export const permisosDeActor = (actor: ActorDePolicy): string[] | null | undefined =>
  typeof actor === 'string' || actor == null ? undefined : actor.permisos;

/**
 * El nombre de rol en minúsculas y sin espacios alrededor.
 *
 * En la tabla `roles` los nombres están capitalizados ('Editor', 'Superadmin') y el JWT
 * y `LOCAL_AUTH_ROLE` los llevan tal cual: comparar literal dejaría fuera a todo el
 * mundo sin fallar en ningún sitio. Antes cada policy tenía su propia copia de esto.
 */
export const normalizarRol = (rol: string | undefined | null): string => (rol ?? '').trim().toLowerCase();

/** ¿Está el rol entre los permitidos? La lista de permitidos se escribe en minúsculas. */
export const tieneRol = (rol: string | undefined | null, permitidos: readonly string[]): boolean =>
  permitidos.includes(normalizarRol(rol));

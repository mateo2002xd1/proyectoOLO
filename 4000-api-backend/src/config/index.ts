import dotenv from 'dotenv';
import type { Ambito } from '../shared/ambito';
dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const esProduccion = nodeEnv === 'production';

/**
 * Corta el arranque si falta `JWT_SECRET`: sin él no se puede firmar ni verificar ninguna sesión.
 */
function validateEnv() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
    throw new Error(
      'FATAL: JWT_SECRET es obligatoria. Defínela en el archivo .env'
    );
  }
}

validateEnv();

/**
 * La cuenta maestra local **no existe en producción**.
 *
 * Es una credencial fija en variables de entorno que emite un token de Superadmin sin
 * pasar por la base de datos. Eso significa que se salta todo lo que protege a las
 * cuentas de verdad: no tiene fila que desactivar, el contador de intentos fallidos no
 * se le aplica —`registrarFalloDeLogin` solo toca usuarios de la base— y
 * `auth.middleware.ts` corta antes de comprobar estado, bloqueo, caducidad e
 * inactividad porque el token lleva `isLocal`. Tampoco deja rastro en la bitácora que
 * la Ley 1581 obliga a poder consultar.
 *
 * Como atajo de desarrollo es útil y se conserva. En producción es una puerta trasera
 * con contraseña reutilizable, así que aquí se apaga de raíz en vez de confiar en que
 * nadie defina las variables: el `docker-compose.prod.yml` de entonces las definía.
 */
const localAuthHabilitado =
  !esProduccion &&
  Boolean(process.env.LOCAL_AUTH_EMAIL?.trim()) &&
  Boolean(process.env.LOCAL_AUTH_PASSWORD);

if (esProduccion && process.env.LOCAL_AUTH_EMAIL?.trim()) {
  console.warn(
    '[config] LOCAL_AUTH_EMAIL está definida pero NODE_ENV=production: ' +
      'la cuenta maestra local queda desactivada. Elimina la variable del entorno.'
  );
}

/**
 * La documentación interactiva de la API (Swagger UI) **no se publica sola en producción**.
 *
 * El documento OpenAPI describe la superficie entera: cada ruta, cada parámetro, qué
 * permiso exige y qué forma tiene el cuerpo que acepta. Es exactamente lo que se quiere
 * tener a mano mientras se desarrolla, y exactamente el mapa que no conviene regalar en
 * un portal institucional expuesto a internet. Publicarla no abre ningún endpoint que no
 * estuviera ya abierto —la autorización sigue viviendo en los middlewares—, pero ahorra
 * a quien busque huecos el trabajo de enumerarlos.
 *
 * De ahí la asimetría, que es la misma de `localAuthHabilitado`: fuera de producción está
 * encendida sin pedir nada, y en producción hay que decir que sí de forma explícita con
 * `SWAGGER_HABILITADO=true`. Detrás de una VPN o de una autenticación de nginx es una
 * decisión razonable; por eso se deja la puerta, en vez de apagarla de raíz.
 *
 * @see 3-seguridad-del-proyecto.md
 * @see docker/guia-bash.md
 */
const docsHabilitadas = esProduccion
  ? process.env.SWAGGER_HABILITADO === 'true'
  : process.env.SWAGGER_HABILITADO !== 'false';

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  /**
   * Interfaz en la que escucha la API.
   *
   * Sigue siendo `127.0.0.1` por defecto —solo el propio host—, que es lo correcto
   * cuando nginx corre en la misma maquina y es lo que habia fijo en el codigo.
   *
   * Se hizo configurable porque dentro de un contenedor esa direccion significa "solo
   * yo": nginx, el sitio y la intranet son contenedores distintos y la alcanzan por
   * nombre de red, asi que con el valor por defecto no la ven y la pila entera queda
   * incomunicada. `docker-compose.servidor.yml` pone `0.0.0.0` de forma explicita, y ahi
   * es seguro porque no publica el puerto 4000: solo nginx publica puertos (8080 y 8081),
   * y solo en 127.0.0.1, para el tunel que corre en el mismo equipo.
   *
   * @see 3-seguridad-del-proyecto.md 4.8 - "La API escucha en 127.0.0.1"
   */
  host: process.env.HOST || '127.0.0.1',
  databaseUrl: process.env.DATABASE_URL || '',
  /**
   * SSL con un Postgres normal. Va activo salvo que `DB_SSL` diga exactamente `false`
   * (un Postgres local o el de Docker, que no lo hablan). No afecta a Neon: su conector va
   * por WebSocket. Ver `config/database.ts`.
   */
  dbSsl: process.env.DB_SSL !== 'false',
  /**
   * Redis, tal cual está en el entorno: vacío si no hay `REDIS_URL`.
   *
   * Cada consumidor decide qué hacer sin ella, y no es lo mismo a propósito: la conexión
   * compartida (caché y cola, `infrastructure/redis`) prueba `redis://localhost:6379`, y los
   * limitadores (`rate-limit.middleware.ts`) cuentan en memoria. Por eso aquí no hay un
   * valor por defecto: pondría a los dos de acuerdo en algo que no quieren.
   */
  redisUrl: process.env.REDIS_URL || '',
  jwtSecret: process.env.JWT_SECRET!,
  // Una jornada, no una semana. Es el tiempo que un token robado sigue sirviendo, y
  // quien entra al panel administra usuarios y lee la bitácora. El uso diario no lo
  // nota: `@olo/inactividad` ya cierra la sesión a los 15 minutos sin actividad —esto
  // es el techo de la jornada, no el de la sesión activa. Debe ir a la par del
  // `COOKIE_MAX_AGE` del login de sitio-web.
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  intranetUrl: process.env.INTRANET_URL || 'http://localhost:3001',
  /**
   * Cómo avisar a los frontales de que el contenido publicado de una página cambió.
   *
   * Hace falta porque aprobar una página no la hacía visible: la base de datos quedaba
   * bien, pero Next seguía sirviendo su copia (`next: { revalidate }`) y el propio
   * `cacheInterceptor` la suya. Nadie tiraba ninguna de las dos — los oyentes de
   * `domain-events/paginas/` existían como `console.log` que nadie importaba.
   */
  revalidacion: {
    /**
     * Secreto compartido con los frontales. Sin él no se manda nada: la ruta de
     * revalidación es la única del sitio que no lleva sesión, y llamarla a ciegas
     * dejaría que cualquiera vaciara la caché a voluntad.
     */
    secreto: process.env.REVALIDAR_SECRET || '',
    urlPorAmbito: {
      /**
       * **No** es `frontendUrl`. Esa es la URL por la que el navegador llega al sitio y
       * sirve de origen CORS; esta es con la que la API llama al front desde el
       * servidor, que dentro de Docker es el nombre del servicio y no `localhost`.
       */
      sitio: process.env.SITIO_WEB_URL || process.env.FRONTEND_URL || 'http://localhost:3000',
      /**
       * Vacío a propósito: la intranet no guarda contenido publicado en la caché de
       * Next —`apiClient.get` es un `fetch` sin `revalidate`, y desde Next 15 eso no se
       * cachea—, así que allí no hay nada que revalidar y con vaciar Redis basta. El día
       * que alguna de sus páginas pase a ISR, se define `INTRANET_REVALIDAR_URL` y el
       * oyente empieza a llamarla sin tocar nada más.
       */
      intranet: process.env.INTRANET_REVALIDAR_URL || '',
    } as Record<Ambito, string>,
  },
  nodeEnv,
  esProduccion,
  /** Documentación OpenAPI servida por la propia API. Ver `docsHabilitadas` arriba. */
  docs: {
    habilitadas: docsHabilitadas,
    /** Punto de montaje de Swagger UI. El JSON crudo cuelga de aquí como `.json`. */
    ruta: process.env.SWAGGER_RUTA || '/api/docs',
  },
  localAuth: {
    habilitado: localAuthHabilitado,
    // Vacíos cuando está deshabilitada, para que ninguna comparación pueda acertar
    // aunque alguien se salte el flag por descuido.
    email: localAuthHabilitado ? process.env.LOCAL_AUTH_EMAIL!.trim().toLowerCase() : '',
    password: localAuthHabilitado ? process.env.LOCAL_AUTH_PASSWORD! : '',
    name: process.env.LOCAL_AUTH_NAME || 'Superadmin',
    role: process.env.LOCAL_AUTH_ROLE || 'Superadmin',
  },
};

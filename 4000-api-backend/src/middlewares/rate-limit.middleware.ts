/**
 * Limitadores de tasa — fábrica única para toda la API.
 *
 * Antes cada router construía su `rateLimit({...})` a mano y los tres compartían el
 * mismo defecto: contaban **por IP**, y la API nunca ve la IP de nadie. Detrás de
 * nginx el socket es el de nginx, y las llamadas del sitio web pasan por su BFF en el
 * servidor, así que llegaban todas con la IP del contenedor de Next. El resultado no
 * era un límite por cliente sino un cubo único compartido por toda la institución:
 * diez intentos fallidos de login dejaban a todo el mundo sin poder entrar durante
 * quince minutos, y a quien abusaba no lo frenaba nada.
 *
 * Lo que arregla esto son tres piezas que solo funcionan juntas:
 *
 *  1. `app.set('trust proxy', 1)` en `app.ts`, para que Express lea `X-Forwarded-For`.
 *  2. Los BFF de Next reenvían esa cabecera tal cual (`3000-sitio-web/src/shared/lib/
 *     backend-proxy.ts`), para que el salto extra no borre al cliente original.
 *  3. `claveDeSesionOIp`, que en rutas autenticadas cuenta **por usuario** y no por
 *     IP: es la única clave que no se puede rotar con un proxy ni compartir sin
 *     querer entre compañeros de oficina.
 *
 * @see 3-seguridad-del-proyecto.md §4.5
 */

import type { Request, Response } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import Redis from 'ioredis';
import { crearLoggerDeErrorConThrottle } from '../infrastructure/redis';
import { tieneRol } from '../shared/autorizacion';

/**
 * Conexión propia para los límites, separada de la que usan BullMQ y la caché.
 *
 * La compartida se abre con `maxRetriesPerRequest: null` porque BullMQ lo exige, y
 * eso significa que con Redis caído los comandos se encolan **para siempre** en vez
 * de fallar. Un limitador montado sobre esa conexión colgaría todas las peticiones de
 * la API en cuanto Redis parpadee: la protección saldría más cara que el ataque. Esta
 * falla rápido —acotado por `maxRetriesPerRequest: 1`— y `passOnStoreError` deja pasar
 * la petición.
 *
 * **`enableOfflineQueue` tiene que ser `true`, no `false`.** Los limitadores se crean
 * a nivel de módulo (`export const limitadorGlobal = crearLimitador(...)`, más abajo),
 * así que `RedisStore.init()` manda su primer comando (`SCRIPT LOAD`) en el mismo tick
 * en el que se acaba de construir este cliente — antes de que el socket llegue a abrir,
 * pase lo que pase de rápido que conteste Redis. Con la cola offline desactivada ese
 * primer comando fallaba siempre con "Stream isn't writeable", y `rate-limit-redis` dejó
 * la promesa de ese script en rechazada para siempre: cada petición volvía a intentar
 * leerla, volvía a fallar, y `passOnStoreError` dejaba pasar todo sin contar nada. El
 * limitador quedaba desactivado en silencio desde el primer arranque, sin ningún error
 * después del de inicio que lo delatara. Con la cola offline activada ese primer
 * comando simplemente espera a que abra el socket —en Docker, `depends_on: redis:
 * condition: service_healthy` ya garantiza que Redis está arriba— y sigue fallando
 * rápido si de verdad no hay Redis: `maxRetriesPerRequest: 1` vacía la cola con error
 * en cuanto se agota el primer reintento, así que una caída real se sigue notando igual
 * que antes.
 */
let clienteDeLimites: Redis | null | undefined;

/** Abre la conexión de límites la primera vez y la reutiliza; `null` si no hay `REDIS_URL`. */
function obtenerClienteDeLimites(): Redis | null {
  if (clienteDeLimites !== undefined) return clienteDeLimites;

  const url = process.env.REDIS_URL;
  if (!url) {
    clienteDeLimites = null;
    return null;
  }

  const cliente = new Redis(url, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: true,
    retryStrategy: (intentos) => Math.min(intentos * 500, 10000),
  });
  cliente.on('error', crearLoggerDeErrorConThrottle('Rate limit Redis'));

  clienteDeLimites = cliente;
  return cliente;
}

/**
 * Almacén compartido en Redis, o el de memoria si no hay Redis configurado.
 *
 * El de memoria pierde la cuenta en cada reinicio y no la comparte entre réplicas, así
 * que reiniciar el proceso limpiaba el castigo de quien estuviera abusando. Sirve para
 * desarrollo; en producción `REDIS_URL` siempre está.
 */
function crearAlmacen(prefijo: string) {
  const cliente = obtenerClienteDeLimites();
  if (!cliente) return undefined;

  return new RedisStore({
    prefix: `rl:${prefijo}:`,
    sendCommand: ((...args: string[]) =>
      cliente.call(args[0], ...args.slice(1))) as (...args: string[]) => Promise<any>,
  });
}

/**
 * Cuenta por usuario cuando hay sesión, y por IP cuando no la hay.
 *
 * `ipKeyGenerator` normaliza IPv6 a su prefijo /56: sin eso, a quien tenga un rango
 * IPv6 —que es cualquiera con fibra doméstica— le basta cambiar de dirección dentro
 * de su propio rango para tener un cubo nuevo en cada petición.
 */
export function claveDeSesionOIp(req: Request): string {
  const id = req.user?.id;
  if (id) return `u:${id}`;
  return `ip:${ipKeyGenerator(req.ip ?? '')}`;
}

/** Cuenta por correo del cuerpo, para los flujos que aún no tienen sesión. */
function claveDeCorreoOIp(req: Request): string {
  const correo = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (correo) return `mail:${correo}`;
  return `ip:${ipKeyGenerator(req.ip ?? '')}`;
}

interface OpcionesDeLimitador {
  /** Prefijo de la clave en Redis. Distingue los cubos entre sí. */
  nombre: string;
  ventanaMs: number;
  limite: number;
  mensaje: string;
  /** Por defecto, sesión o IP. */
  clave?: (req: Request) => string;
  skip?: (req: Request, res: Response) => boolean;
}

/**
 * Construye un limitador con las reglas comunes del proyecto: cabeceras estándar,
 * almacén en Redis y paso libre si Redis falla. Por defecto cuenta por sesión o IP.
 */
export function crearLimitador({
  nombre,
  ventanaMs,
  limite,
  mensaje,
  clave = claveDeSesionOIp,
  skip,
}: OpcionesDeLimitador) {
  return rateLimit({
    windowMs: ventanaMs,
    limit: limite,
    message: { error: mensaje },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: clave,
    store: crearAlmacen(nombre),
    // Con Redis caído se deja pasar la petición en vez de devolver 500. Perder el
    // límite es malo; convertir una caída de Redis en una caída de la API es peor.
    passOnStoreError: true,
    ...(skip ? { skip } : {}),
  });
}

// ---------------------------------------------------------------------------
// Limitadores concretos
// ---------------------------------------------------------------------------

/**
 * Techo general de la API. No sustituye a los específicos: es el suelo que impide que
 * una ruta sin limitador propio quede completamente abierta a un bucle.
 *
 * Va montado antes de `requireAuth`, así que aquí todavía no hay sesión y cuenta por
 * IP. El número es alto a propósito — una pantalla del panel dispara varias peticiones
 * y hay que dejar trabajar a la gente; lo que corta es la automatización, no el uso.
 *
 * **Se salta el tráfico interno entre servicios**, y esa exención necesita explicación
 * porque parece un agujero y no lo es:
 *
 * Los componentes y acciones de servidor de Next llaman a la API desde dentro de la
 * red de Docker. Esas peticiones no las abre ningún navegador, así que no llevan
 * `X-Forwarded-For` salvo que el llamador la reenvíe a mano —los BFF del sitio ya lo
 * hacen; las llamadas de servidor a servidor no—. Sin esta exención todas caerían en
 * el mismo cubo y el panel entero se quedaría sin cupo bajo carga: habríamos cambiado
 * un problema de seguridad por una caída.
 *
 * Que no haya cabecera **es** la señal de que la petición no viene de internet: nginx
 * la escribe siempre, con `$proxy_add_x_forwarded_for`, aunque el cliente no la mande.
 * Para llegar aquí sin ella hay que estar ya dentro de la red interna.
 *
 * Lo que esto exime es solo este techo genérico. Los límites que de verdad protegen
 * —login y recuperación por correo, escrituras por usuario— no dependen de
 * la IP y siguen aplicándose a todo el mundo, venga por donde venga.
 */
export const limitadorGlobal = crearLimitador({
  nombre: 'global',
  ventanaMs: 60 * 1000,
  limite: 300,
  mensaje: 'Demasiadas solicitudes. Espere un momento antes de continuar.',
  skip: (req) => !req.headers['x-forwarded-for'],
});

/** Login: por correo, para que atacar una cuenta no bloquee a las demás. */
export const limitadorDeLogin = crearLimitador({
  nombre: 'login',
  ventanaMs: 15 * 60 * 1000,
  limite: 10,
  mensaje: 'Demasiados intentos de inicio de sesión. Intente más tarde.',
  clave: claveDeCorreoOIp,
});

/** Cierre de sesión: techo holgado, solo para cortar bucles. */
export const limitadorDeLogout = crearLimitador({
  nombre: 'logout',
  ventanaMs: 15 * 60 * 1000,
  limite: 100,
  mensaje: 'Demasiadas solicitudes. Intente más tarde.',
});

/** Consulta de preguntas de seguridad: por correo, es el paso previo a recuperar. */
export const limitadorDePreguntas = crearLimitador({
  nombre: 'preguntas',
  ventanaMs: 15 * 60 * 1000,
  limite: 10,
  mensaje: 'Demasiadas solicitudes. Intente más tarde.',
  clave: claveDeCorreoOIp,
});

/** Verificación de respuestas: el umbral más bajo, es adivinable por fuerza bruta. */
export const limitadorDeVerificacion = crearLimitador({
  nombre: 'verificar',
  ventanaMs: 15 * 60 * 1000,
  limite: 5,
  mensaje: 'Demasiadas solicitudes. Intente más tarde.',
  clave: claveDeCorreoOIp,
});

/** Recuperación de contraseña: tres intentos por hora y por correo. */
export const limitadorDeRecuperacion = crearLimitador({
  nombre: 'recuperar',
  ventanaMs: 60 * 60 * 1000,
  limite: 3,
  mensaje: 'Demasiados intentos de recuperación. Intente más tarde.',
  clave: claveDeCorreoOIp,
});

/**
 * Escrituras del editor. Generoso porque el autoguardado dispara solo, pero ahora
 * cuenta por usuario: antes una sola IP compartida —toda una sede tras el mismo NAT—
 * agotaba el cupo de todos sus editores a la vez.
 *
 * Se conserva la exención del superadmin que ya existía.
 */
export const limitadorDeEscritura = crearLimitador({
  nombre: 'escritura',
  ventanaMs: 60 * 1000,
  limite: 30,
  mensaje: 'Demasiadas solicitudes de escritura. Espera un momento antes de continuar.',
  skip: (req) => tieneRol(req.user?.role, ['superadmin']),
});

/**
 * Visitas de páginas públicas. La ruta no tiene sesión y suma a un contador que sale
 * en el panel, así que sin esto un bucle de `curl` lo infla a voluntad: el techo
 * global (300/min por IP) dejaba subir miles de visitas por hora desde una sola IP.
 *
 * Dos cubos, porque protegen cosas distintas:
 *  - por IP y página: unas pocas visitas cada 10 minutos. El navegador ya cuenta una
 *    por sesión; más que eso desde la misma IP es recarga o automatización. Se deja
 *    margen (no 1) porque una sede entera comparte IP tras el mismo NAT.
 *  - por IP: techo general, para que rotar de slug no esquive el primero.
 */
const claveDeVisita = (req: Request): string => {
  const slug = typeof req.body?.slug === 'string' ? req.body.slug.trim().toLowerCase().slice(0, 100) : '';
  return `ip:${ipKeyGenerator(req.ip ?? '')}:${slug}`;
};

export const limitadorDeVisitasPorPagina = crearLimitador({
  nombre: 'visita-pagina',
  ventanaMs: 10 * 60 * 1000,
  limite: 5,
  mensaje: 'Visita ya registrada.',
  clave: claveDeVisita,
});

export const limitadorDeVisitas = crearLimitador({
  nombre: 'visita-ip',
  ventanaMs: 60 * 1000,
  limite: 30,
  mensaje: 'Demasiadas solicitudes. Espere un momento antes de continuar.',
});

/**
 * Cierra las conexiones de límites al apagar el proceso.
 *
 * Sin esto el proceso no termina de morir: ioredis mantiene el socket abierto y
 * `docker stop` acaba matándolo por timeout.
 */
export async function cerrarClienteDeLimites(): Promise<void> {
  if (clienteDeLimites) {
    await clienteDeLimites.quit().catch(() => undefined);
    clienteDeLimites = undefined;
  }
}

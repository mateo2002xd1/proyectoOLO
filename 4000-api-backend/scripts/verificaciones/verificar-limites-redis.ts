/**
 * Lo que `verificar-limites-de-tasa.ts` no puede probar con el almacén en memoria: que los
 * límites de tasa **sirven con varias réplicas de la API y sobreviven a Redis**.
 *
 * Monta el limitador real de login (`limitadorDeLogin`: 10 intentos por correo y 15 minutos)
 * sobre un Redis de verdad y comprueba cuatro cosas:
 *
 *  1. **Cubo compartido entre réplicas.** Dos procesos (este y un hijo) reciben peticiones
 *     alternadas para el mismo correo: entre los dos pasan exactamente 10 y la 11.ª recibe 429,
 *     venga de la réplica que venga. Con el almacén en memoria cada réplica tendría su propio
 *     cupo y el atacante tendría 10 × N intentos.
 *  2. **El castigo sobrevive a un reinicio.** Se mata al hijo y se levanta otro: el correo
 *     sigue bloqueado. Con memoria, reiniciar el proceso limpiaba la cuenta.
 *  3. **La clave vive en Redis** con el prefijo `rl:login:` y caducidad (la ventana de 15 min),
 *     no se queda para siempre.
 *  4. **Redis caído no tumba la API.** Una réplica cuyo Redis no responde (puerto cerrado)
 *     contesta 200 —`passOnStoreError`— y en tiempo razonable, en vez de 500 o de colgarse. Se
 *     pierde el límite, no la disponibilidad.
 *  5. **Redis que se queda sin contestar a mitad de camino no frena la API y se recupera.** Con
 *     `CLIENT PAUSE` (Redis vivo pero mudo, sin necesitar Docker) las peticiones siguen dando 200 y
 *     tardan lo que dura `COMANDO_TIMEOUT_MS`, no segundos; al acabar la pausa el correo
 *     bloqueado vuelve a recibir 429. Es el defecto RED-01: antes la espera crecía hasta 10 s por
 *     petición mientras Redis estaba caído.
 *
 * No toca la base de datos. **Escribe en Redis** (claves `rl:login:mail:…` con un correo único de
 * esta corrida, que se borran al terminar), así que se niega a correr salvo contra un Redis
 * local y fuera de la base 0 (la que usa el desarrollo). Nunca contra el Redis del servidor.
 *
 * Uso:
 *   REDIS_URL=redis://localhost:56379/7 JWT_SECRET=<uno de prueba> npm run limites:redis
 *
 * Sale con código 1 si algo falla. El apagado de Redis a mitad de una petición se probó a mano
 * con `docker stop`; ver `6-auditoria.md`.
 *
 * @see 3-seguridad-del-proyecto.md §4.5
 */
import 'dotenv/config';

import { spawn, type ChildProcess } from 'child_process';
import type { AddressInfo } from 'net';

// El middleware elige almacén al cargarse (una sola vez), con lo que haya en `REDIS_URL`;
// por eso `require` y no `import`, y por eso la salvaguarda va antes.
const abortar = (motivo: string): never => {
  console.error(`\nNO SE EJECUTA: ${motivo}\n`);
  process.exit(2);
};

const MODO_SERVIDOR = process.argv.includes('--servidor');
const urlRedis = (() => {
  try {
    return new URL(process.env.REDIS_URL ?? '');
  } catch {
    return abortar('REDIS_URL falta o no es una URL.');
  }
})();
if (!MODO_SERVIDOR) {
  if (process.env.NODE_ENV === 'production') abortar('NODE_ENV=production.');
  if (!['localhost', '127.0.0.1', '::1', '[::1]'].includes(urlRedis.hostname)) {
    abortar(`el Redis está en «${urlRedis.hostname}», no es local.`);
  }
  const baseDeRedis = urlRedis.pathname.replace(/^\//, '') || '0';
  if (baseDeRedis === '0') abortar('usa una base de Redis distinta de la 0 (la del desarrollo), p. ej. redis://localhost:6379/7.');
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require('express') as typeof import('express');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const http = require('http') as typeof import('http');
const { limitadorDeLogin } = require('../../src/middlewares/rate-limit.middleware') as typeof import('../../src/middlewares/rate-limit.middleware');

const LIMITE_DE_LOGIN = 10;

function construirApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json());
  app.post('/login', limitadorDeLogin, (_req, res) => res.status(200).json({ ok: true }));
  return app;
}

async function levantarServidor() {
  const servidor = http.createServer(construirApp());
  await new Promise<void>((resolve) => servidor.listen(0, '127.0.0.1', resolve));
  return { servidor, puerto: (servidor.address() as AddressInfo).port };
}

// ── Modo hijo: una réplica de la API que solo monta el limitador de login ───────────────

if (MODO_SERVIDOR) {
  levantarServidor().then(({ puerto }) => {
    console.log(`PUERTO ${puerto}`);
  });
} else {
  void principal();
}

// ── Modo principal ──────────────────────────────────────────────────────────────────────

interface Replica {
  proceso: ChildProcess;
  base: string;
}

/** Levanta una réplica en un proceso aparte, con el `REDIS_URL` dado, y espera su puerto. */
function levantarReplica(redisUrl: string): Promise<Replica> {
  return new Promise((resolve, reject) => {
    const proceso = spawn(process.execPath, ['-r', 'ts-node/register', __filename, '--servidor'], {
      env: { ...process.env, REDIS_URL: redisUrl, TS_NODE_TRANSPILE_ONLY: 'true' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let salida = '';
    const cortar = setTimeout(() => {
      proceso.kill();
      reject(new Error(`la réplica no arrancó en 30 s. Salida: ${salida.slice(0, 400)}`));
    }, 30_000);
    proceso.stdout?.on('data', (trozo: Buffer) => {
      salida += trozo.toString();
      const hallado = /PUERTO (\d+)/.exec(salida);
      if (hallado) {
        clearTimeout(cortar);
        resolve({ proceso, base: `http://127.0.0.1:${hallado[1]}` });
      }
    });
    proceso.stderr?.on('data', (trozo: Buffer) => {
      salida += trozo.toString();
    });
    proceso.on('exit', (codigo) => {
      clearTimeout(cortar);
      reject(new Error(`la réplica salió (${codigo}) antes de arrancar. Salida: ${salida.slice(0, 400)}`));
    });
  });
}

const detener = (replica: Replica) =>
  new Promise<void>((resolve) => {
    replica.proceso.removeAllListeners('exit');
    replica.proceso.once('exit', () => resolve());
    replica.proceso.kill();
  });

async function intentarLogin(base: string, correo: string): Promise<{ estado: number; ms: number }> {
  const inicio = Date.now();
  const respuesta = await fetch(`${base}/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.7' },
    body: JSON.stringify({ email: correo, password: 'x' }),
  });
  await respuesta.text();
  return { estado: respuesta.status, ms: Date.now() - inicio };
}

let fallos = 0;
let comprobaciones = 0;
const informar = (ok: boolean, descripcion: string, detalle = '') => {
  comprobaciones += 1;
  if (!ok) fallos += 1;
  console.log(`  ${ok ? 'OK  ' : 'FALLA'}  ${descripcion}${detalle ? ` → ${detalle}` : ''}`);
};

async function principal(): Promise<void> {
  const { default: Redis } = await import('ioredis');
  const redis = new Redis(process.env.REDIS_URL as string);
  const correo = `redis-${Date.now()}@sena.edu.co`;
  const clave = `rl:login:mail:${correo}`;

  const local = await levantarServidor();
  const baseLocal = `http://127.0.0.1:${local.puerto}`;
  let hijo: Replica | undefined;
  let sinRedis: Replica | undefined;

  try {
    console.log('\n=== 1. Cubo compartido entre dos réplicas ===');
    hijo = await levantarReplica(process.env.REDIS_URL as string);
    const estados: number[] = [];
    for (let i = 0; i < LIMITE_DE_LOGIN; i += 1) {
      estados.push((await intentarLogin(i % 2 === 0 ? baseLocal : hijo.base, correo)).estado);
    }
    informar(estados.every((e) => e === 200), `los ${LIMITE_DE_LOGIN} primeros intentos, alternados entre las dos réplicas, pasan`, estados.join(','));
    const siguiente = await intentarLogin(baseLocal, correo);
    informar(siguiente.estado === 429, 'el 11.º, pedido a la réplica local, recibe 429', String(siguiente.estado));
    const otraReplica = await intentarLogin(hijo.base, correo);
    informar(otraReplica.estado === 429, 'el 12.º, pedido a la otra réplica, también recibe 429 (cuenta compartida)', String(otraReplica.estado));

    console.log('\n=== 2. La clave vive en Redis y caduca ===');
    const valor = await redis.get(clave);
    const ttl = await redis.pttl(clave);
    informar(valor !== null && Number(valor) >= LIMITE_DE_LOGIN, `existe ${clave} con el contador`, `valor=${valor}`);
    informar(ttl > 0 && ttl <= 15 * 60 * 1000, 'la clave tiene caducidad dentro de la ventana de 15 min', `${ttl} ms`);

    console.log('\n=== 3. El castigo sobrevive a reiniciar una réplica ===');
    await detener(hijo);
    hijo = await levantarReplica(process.env.REDIS_URL as string);
    const trasReinicio = await intentarLogin(hijo.base, correo);
    informar(trasReinicio.estado === 429, 'la réplica nueva, recién arrancada, sigue bloqueando al correo', String(trasReinicio.estado));
    const otroCorreo = await intentarLogin(hijo.base, `otro-${Date.now()}@sena.edu.co`);
    informar(otroCorreo.estado === 200, 'control: otro correo no queda bloqueado por el castigo del primero', String(otroCorreo.estado));

    console.log('\n=== 4. Redis caído: la API sigue contestando (passOnStoreError) ===');
    sinRedis = await levantarReplica('redis://127.0.0.1:1');
    const resultados: { estado: number; ms: number }[] = [];
    for (let i = 0; i < LIMITE_DE_LOGIN + 3; i += 1) resultados.push(await intentarLogin(sinRedis.base, correo));
    informar(
      resultados.every((r) => r.estado === 200),
      `con el Redis inalcanzable, ${resultados.length} intentos del mismo correo pasan (200) y ninguno da 500`,
      resultados.map((r) => r.estado).join(',')
    );
    const peor = Math.max(...resultados.map((r) => r.ms));
    informar(peor < 1000, 'y ninguna petición se cuelga esperando a Redis (la conexión no está lista: se salta al instante)', `la más lenta: ${peor} ms`);

    console.log('\n=== 5. Redis mudo a mitad de camino: no frena la API y se recupera ===');
    const trasPausa = await intentarLogin(hijo.base, correo);
    informar(trasPausa.estado === 429, 'control: antes de la pausa el correo sigue bloqueado', String(trasPausa.estado));
    const PAUSA_MS = 3000;
    await redis.call('CLIENT', 'PAUSE', String(PAUSA_MS), 'ALL');
    const durantePausa: { estado: number; ms: number }[] = [];
    for (let i = 0; i < 4; i += 1) durantePausa.push(await intentarLogin(hijo.base, correo));
    informar(durantePausa.every((r) => r.estado === 200), 'con Redis sin contestar las peticiones pasan (200), no dan 500 ni 429', durantePausa.map((r) => r.estado).join(','));
    const lenta = Math.max(...durantePausa.map((r) => r.ms));
    informar(lenta < 1500, 'y cada una espera como mucho el tope por comando, no segundos', `la más lenta: ${lenta} ms (la pausa dura ${PAUSA_MS} ms)`);
    await new Promise((resolver) => setTimeout(resolver, PAUSA_MS + 500));
    const recuperado = await intentarLogin(hijo.base, correo);
    informar(recuperado.estado === 429, 'al acabar la pausa el límite vuelve a contar: el correo bloqueado recibe 429', String(recuperado.estado));
  } finally {
    await redis.del(clave).catch(() => undefined);
    await Promise.all([hijo && detener(hijo), sinRedis && detener(sinRedis)].filter(Boolean) as Promise<void>[]);
    local.servidor.close();
    await redis.quit().catch(() => undefined);
  }

  console.log(`\n${comprobaciones - fallos}/${comprobaciones} comprobaciones en orden.`);
  process.exit(fallos > 0 ? 1 : 0);
}

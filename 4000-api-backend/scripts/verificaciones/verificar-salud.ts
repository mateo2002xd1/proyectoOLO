/**
 * Comprueba que `/health` sea una sonda de vida y nada más, y que Docker la sondee de verdad
 * (SAL-01, SAL-02 y SAL-03 en `3-seguridad-del-proyecto.md` §4.10).
 *
 * Existe por la revisión del 2026-10-25. La sección 2.2.5.1 del manual describía `/api/health`
 * con el estado de cada dependencia y un 503 si Postgres caía; el código hace otra cosa, a
 * propósito. Si alguien «arregla» el código para que cuadre con el manual, una ruta pública y
 * anterior al limitador general empezaría a consultar la base por cada petición anónima y a
 * decirle a cualquiera qué componente falla. Esta prueba rompe antes de que eso llegue a un
 * servidor.
 *
 * Con la `app` real, sin tocar ninguna base ni Redis (la base apunta a un puerto donde no
 * escucha nadie, Redis no se configura y `sequelize` y la conexión compartida a Redis se
 * cambian por trampas que anotan y fallan si alguien las usa):
 *
 *  - `/health` responde 200 con solo `status` y `timestamp`, sin `X-Powered-By`, no refleja la
 *    query y solo atiende GET;
 *  - responde con la base y Redis inalcanzables, deprisa y sin llamar a ninguno de los dos;
 *  - sigue respondiendo con el cupo del limitador general ya agotado (va antes de él);
 *  - la sonda del propio contenedor no llena el log, pero un error, o una consulta que llega
 *    por otro socket (nginx) o que solo dice venir de dentro (`X-Forwarded-For`), sí se anotan.
 *
 * Y sobre `docker/docker-compose.servidor.yml` (lectura de texto):
 *
 *  - `api-backend` declara su `healthcheck` sobre `/health`;
 *  - todos los servicios llevan el tope de logs;
 *  - solo nginx publica puertos, y solo en 127.0.0.1: el 4000 no se alcanza sin pasar por nginx.
 *
 * Uso:  npm run salud:verificar     (sale con código 1 si algo falla)
 *
 * @see 3-seguridad-del-proyecto.md (registro de hallazgos, SAL-01 a SAL-03)
 */
import fs from 'fs';
import http from 'http';
import path from 'path';
import type { AddressInfo } from 'net';
import type { Request, Response } from 'express';

// Nada de esta prueba puede llegar a una base o a un Redis reales, ni siquiera si el entorno
// de quien la corre apunta a uno: se pisa. Sin REDIS_URL los limitadores cuentan en memoria.
process.env.JWT_SECRET ||= 'secreto-solo-para-esta-verificacion';
process.env.DATABASE_URL = 'postgres://nadie:nadie@127.0.0.1:1/nada';
process.env.DB_SSL = 'false';
process.env.REDIS_URL = '';

// `require` y no `import`: así `app.ts` lee el entorno de arriba y no el que había antes.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { app, esSondaDelPropioContenedor } = require('../../src/app') as typeof import('../../src/app');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sequelize = (require('../../src/config/database') as typeof import('../../src/config/database')).default;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const redis = require('../../src/infrastructure/redis') as typeof import('../../src/infrastructure/redis');

let fallos = 0;
let comprobaciones = 0;
const informar = (ok: boolean, descripcion: string, detalle = '') => {
  comprobaciones += 1;
  if (!ok) fallos += 1;
  console.log(`  ${ok ? 'OK  ' : 'FALLA'}  ${descripcion}${detalle ? ` → ${detalle}` : ''}`);
};
const avisar = (mensaje: string) => console.log(`  AVISO  ${mensaje}`);

// ── Trampas: lo que /health no debe tocar ──────────────────────────────────────────────────

const usos: string[] = [];
const trampa = (nombre: string) => () => {
  usos.push(nombre);
  throw new Error(`/health no debe tocar ${nombre}`);
};
(sequelize as any).query = trampa('sequelize.query');
(sequelize as any).authenticate = trampa('sequelize.authenticate');
(redis as any).getRedis = trampa('getRedis (la conexión compartida a Redis)');

// ── Cliente HTTP mínimo contra la app real ─────────────────────────────────────────────────

interface Respuesta {
  status: number;
  cabeceras: http.IncomingHttpHeaders;
  cuerpo: string;
}

interface Peticion {
  metodo?: string;
  cabeceras?: Record<string, string>;
  /** Cuerpo JSON ya serializado (a propósito puede venir roto). */
  cuerpo?: string;
}

const pedir = (puerto: number, ruta: string, { metodo = 'GET', cabeceras = {}, cuerpo }: Peticion = {}) =>
  new Promise<Respuesta>((resolver, rechazar) => {
    const cabecerasFinales = cuerpo === undefined
      ? cabeceras
      : { 'content-type': 'application/json', 'content-length': String(Buffer.byteLength(cuerpo)), ...cabeceras };
    const req = http.request(
      { host: '127.0.0.1', port: puerto, path: ruta, method: metodo, headers: cabecerasFinales, timeout: 3000, agent: false },
      (res) => {
        let texto = '';
        res.setEncoding('utf8');
        res.on('data', (trozo) => (texto += trozo));
        res.on('end', () => resolver({ status: res.statusCode ?? 0, cabeceras: res.headers, cuerpo: texto }));
      }
    );
    req.on('timeout', () => req.destroy(new Error(`sin respuesta en 3 s a ${metodo} ${ruta}`)));
    req.on('error', rechazar);
    if (cuerpo !== undefined) req.write(cuerpo);
    req.end();
  });

/** Ejecuta `accion` y devuelve lo que `morgan` escribió en la salida estándar mientras tanto. */
const capturarSalida = async (accion: () => Promise<void>): Promise<string> => {
  const original = process.stdout.write;
  let texto = '';
  (process.stdout as any).write = (trozo: unknown, ...resto: unknown[]) => {
    texto += String(trozo);
    const aviso = resto.find((r) => typeof r === 'function') as (() => void) | undefined;
    aviso?.();
    return true;
  };
  try {
    await accion();
  } finally {
    process.stdout.write = original;
  }
  return texto;
};

// ── 1. La forma de la respuesta ────────────────────────────────────────────────────────────

const verificarLaRespuesta = async (puerto: number): Promise<void> => {
  console.log('\n=== 1. /health: solo la sonda, nada más ===');
  const inicio = Date.now();
  const r = await pedir(puerto, '/health');
  const tardo = Date.now() - inicio;
  const cuerpo = JSON.parse(r.cuerpo) as Record<string, unknown>;

  informar(r.status === 200, 'GET /health responde 200', String(r.status));
  informar(/application\/json/.test(String(r.cabeceras['content-type'])), 'y es JSON', String(r.cabeceras['content-type']));
  informar(
    JSON.stringify(Object.keys(cuerpo).sort()) === JSON.stringify(['status', 'timestamp']),
    'el cuerpo trae solo `status` y `timestamp` (ni dependencias, ni versión, ni uptime)',
    Object.keys(cuerpo).join(', ')
  );
  informar(cuerpo.status === 'ok', '`status` es «ok»', String(cuerpo.status));
  const fecha = Date.parse(String(cuerpo.timestamp));
  informar(!Number.isNaN(fecha) && Math.abs(Date.now() - fecha) < 5000, '`timestamp` es una fecha ISO reciente', String(cuerpo.timestamp));
  informar(!('x-powered-by' in r.cabeceras), 'no delata el framework con `X-Powered-By`');

  const post = await pedir(puerto, '/health', { metodo: 'POST' });
  informar(post.status === 404, 'POST /health → 404: solo atiende GET', String(post.status));

  const conQuery = await pedir(puerto, '/health?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E&dependencia=postgres');
  informar(
    conQuery.status === 200 && !/script|postgres/i.test(conQuery.cuerpo),
    'no refleja ni interpreta la query',
    conQuery.cuerpo
  );

  console.log('\n=== 2. Con la base y Redis caídos sigue en pie, sin tocarlos ===');
  informar(tardo < 2000, 'responde deprisa con Postgres inalcanzable (el pool espera 30 s si alguien lo usara)', `${tardo} ms`);
  informar(usos.length === 0, 'no llamó a la base ni a Redis', usos.join(', ') || 'ninguna llamada');
};

// ── 3. Antes del limitador general ─────────────────────────────────────────────────────────

const verificarElLimitador = async (puerto: number): Promise<void> => {
  console.log('\n=== 3. Va antes del limitador general ===');
  // Sin `X-Forwarded-For` el limitador exime el tráfico interno: con él, cuenta como un visitante.
  const visitante = { 'x-forwarded-for': '203.0.113.7' };
  let primer429 = 0;
  await capturarSalida(async () => {
    for (let i = 1; i <= 400 && primer429 === 0; i += 1) {
      if ((await pedir(puerto, '/ruta-de-control-que-no-existe', { cabeceras: visitante })).status === 429) primer429 = i;
    }
  });
  informar(primer429 > 0, 'control: una ruta normal agota el cupo del limitador general y recibe 429', primer429 ? `desde la petición ${primer429}` : 'nunca');

  let distintasDe200 = 0;
  await capturarSalida(async () => {
    for (let i = 0; i < 350; i += 1) {
      if ((await pedir(puerto, '/health', { cabeceras: visitante })).status !== 200) distintasDe200 += 1;
    }
  });
  informar(distintasDe200 === 0, '350 consultas a /health del mismo visitante, con su cupo agotado: todas 200', `${distintasDe200} distintas de 200`);

  const despues = await capturarSalida(async () => {
    const control = await pedir(puerto, '/ruta-de-control-que-no-existe', { cabeceras: visitante });
    informar(control.status === 429, 'y el limitador seguía activo para el resto', String(control.status));
  });
  void despues;
};

// ── 4. El log ──────────────────────────────────────────────────────────────────────────────

const peticionSimulada = (ruta: string, direccionDelSocket: string | undefined, cabeceras: Record<string, string> = {}) =>
  ({ path: ruta, headers: cabeceras, ip: cabeceras['x-forwarded-for'], socket: { remoteAddress: direccionDelSocket } }) as unknown as Request;
const respuestaSimulada = (status: number) => ({ statusCode: status }) as unknown as Response;

const verificarElLog = async (puerto: number): Promise<void> => {
  console.log('\n=== 4. La sonda del contenedor no llena el log; lo demás sí se anota ===');

  const deLaSonda = await capturarSalida(async () => {
    await pedir(puerto, '/health');
  });
  informar(!/health/.test(deLaSonda), 'GET /health desde el propio contenedor, con 200: sin línea en el log', deLaSonda.trim() || '(vacío)');

  const deOtraRuta = await capturarSalida(async () => {
    await pedir(puerto, '/ruta-que-no-existe');
  });
  informar(/\/ruta-que-no-existe/.test(deOtraRuta) && /404/.test(deOtraRuta), 'control: otra ruta sí se anota', deOtraRuta.trim().replace(/\u001b\[\d+m/g, ''));

  // El manejador de errores anota este 400 provocado a propósito en `console.error`; aquí no es un fallo.
  const consoleError = console.error;
  console.error = () => undefined;
  let fallida: string;
  try {
    fallida = await capturarSalida(async () => {
      await pedir(puerto, '/health', { cuerpo: '{' });
    });
  } finally {
    console.error = consoleError;
  }
  informar(/health/.test(fallida) && /400/.test(fallida), 'un /health que falla (cuerpo JSON roto → 400) sí se anota', fallida.trim().replace(/\u001b\[\d+m/g, ''));

  const sonda = (ruta: string, socket: string | undefined, status: number, cabeceras?: Record<string, string>) =>
    esSondaDelPropioContenedor(peticionSimulada(ruta, socket, cabeceras), respuestaSimulada(status));
  informar(sonda('/health', '127.0.0.1', 200) === true, 'se salta: /health, 200, socket 127.0.0.1');
  informar(sonda('/health', '::1', 200) === true, 'se salta: /health, 200, socket ::1');
  informar(sonda('/health', '::ffff:127.0.0.1', 200) === true, 'se salta: /health, 200, socket ::ffff:127.0.0.1');
  informar(sonda('/health', '172.18.0.5', 200) === false, 'se anota: /health que llega por el socket de nginx (172.18.0.5)');
  informar(
    sonda('/health', '172.18.0.5', 200, { 'x-forwarded-for': '127.0.0.1' }) === false,
    'se anota: /health de fuera que dice ser 127.0.0.1 con X-Forwarded-For (el criterio es el socket, no la cabecera)'
  );
  informar(sonda('/health', '127.0.0.1', 503) === false, 'se anota: una sonda que falla (503)');
  informar(sonda('/health', '127.0.0.1', 400) === false, 'se anota: una sonda con 400');
  informar(sonda('/api/users', '127.0.0.1', 200) === false, 'se anota: cualquier otra ruta, aunque venga de dentro');
  informar(sonda('/health', undefined, 200) === false, 'se anota: sin dirección de socket no se asume que sea local');
};

// ── 5. El compose ──────────────────────────────────────────────────────────────────────────

const RUTA_COMPOSE = path.resolve(__dirname, '../../../docker/docker-compose.servidor.yml');

/** Los bloques de `services:` por nombre, para mirarlos de uno en uno. */
const serviciosDelCompose = (texto: string): Map<string, string> => {
  const servicios = new Map<string, string>();
  const marca = '\nservices:\n';
  const desde = texto.indexOf(marca);
  if (desde === -1) return servicios;
  const resto = texto.slice(desde + marca.length);
  const siguienteSeccion = resto.search(/^(?:volumes|networks|x-[\w-]+):/m);
  const cuerpo = siguienteSeccion === -1 ? resto : resto.slice(0, siguienteSeccion);
  const cabeceras = [...cuerpo.matchAll(/^ {2}([a-z][\w-]*):[ \t]*$/gm)];
  cabeceras.forEach((cabecera, i) => {
    const fin = i + 1 < cabeceras.length ? (cabeceras[i + 1].index as number) : cuerpo.length;
    servicios.set(cabecera[1], cuerpo.slice(cabecera.index as number, fin));
  });
  return servicios;
};

const verificarElCompose = (): void => {
  console.log('\n=== 5. docker-compose.servidor.yml ===');
  if (!fs.existsSync(RUTA_COMPOSE)) {
    avisar(`no se encuentra ${RUTA_COMPOSE}: esta copia de la API no trae la carpeta docker/, se omite esta parte`);
    return;
  }
  const texto = fs.readFileSync(RUTA_COMPOSE, 'utf8').replace(/\r\n/g, '\n');
  const servicios = serviciosDelCompose(texto);
  informar(servicios.size >= 6, 'se leen los servicios del compose', [...servicios.keys()].join(', '));

  const api = servicios.get('api-backend') ?? '';
  informar(/^ {4}healthcheck:[ \t]*$/m.test(api), '`api-backend` declara su `healthcheck`');
  // La ruta que sondea: lo que sigue a `http://127.0.0.1:<puerto>`, con el puerto fijo o leído de PORT.
  const lineaDelTest = /^ {6}test:.*$/m.exec(api)?.[0] ?? '';
  const rutaSondeada = /http:\/\/127\.0\.0\.1:(?:\d+|'\+\(process\.env\.PORT\|\|\d+\)\+')(\/[\w/-]*)/.exec(lineaDelTest)?.[1];
  informar(rutaSondeada === '/health', 'y sondea exactamente `/health`, no otra ruta', rutaSondeada ?? '(no se pudo leer la ruta del test)');
  informar(/^ {6}interval:\s*\d+s/m.test(api) && /^ {6}start_period:\s*\d+s/m.test(api), 'con `interval` y `start_period` (la API necesita unos segundos para arrancar)');

  const ancla = /^x-logging:[^\n]*\n(?:(?: {2}[^\n]*)?\n)+/m.exec(texto)?.[0] ?? '';
  informar(/max-size:\s*"?\d+[kmg]"?/i.test(ancla) && /max-file:\s*"?\d+"?/.test(ancla), 'existe el tope de logs (`x-logging`: `max-size` y `max-file`)');
  const sinTope = [...servicios].filter(([, bloque]) => !/^ {4}logging:\s*\*logging\s*$/m.test(bloque)).map(([nombre]) => nombre);
  informar(sinTope.length === 0, 'todos los servicios llevan `logging: *logging`', sinTope.length ? `sin tope: ${sinTope.join(', ')}` : `${servicios.size} servicios`);

  const publicanPuertos = [...servicios].filter(([nombre, bloque]) => nombre !== 'nginx' && /^ {4}ports:/m.test(bloque)).map(([nombre]) => nombre);
  informar(publicanPuertos.length === 0, 'ningún servicio salvo nginx publica puertos (el 4000 no se alcanza sin pasar por nginx)', publicanPuertos.join(', ') || 'ninguno');
  const mapeosDeNginx = [...(servicios.get('nginx') ?? '').matchAll(/^ {6}- "([^"]+)"[ \t]*$/gm)].map((m) => m[1]);
  informar(
    mapeosDeNginx.length > 0 && mapeosDeNginx.every((m) => m.startsWith('127.0.0.1:')),
    'y nginx solo los publica en 127.0.0.1 (la única entrada es el túnel, que corre en el mismo equipo)',
    mapeosDeNginx.join(' · ') || '(ninguno)'
  );
};

// ── Ejecución ──────────────────────────────────────────────────────────────────────────────

async function principal(): Promise<void> {
  const servidor = http.createServer(app);
  await new Promise<void>((resolver) => servidor.listen(0, '127.0.0.1', resolver));
  const puerto = (servidor.address() as AddressInfo).port;
  try {
    await verificarLaRespuesta(puerto);
    await verificarElLimitador(puerto);
    await verificarElLog(puerto);
    verificarElCompose();
  } finally {
    servidor.close();
  }
}

principal()
  .catch((error) => {
    fallos += 1;
    console.error(error);
  })
  .finally(() => {
    console.log(`\n${comprobaciones - fallos}/${comprobaciones} comprobaciones en orden.`);
    process.exit(fallos > 0 ? 1 : 0);
  });

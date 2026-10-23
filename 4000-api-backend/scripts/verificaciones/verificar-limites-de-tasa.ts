/**
 * Comprueba que cada limitador de tasa de `rate-limit.middleware.ts` haga lo que su
 * comentario promete: el techo exacto, la clave correcta (usuario, correo o IP,
 * nunca lo que no toca), el `skip` de cada excepción documentada, y el mensaje que
 * devuelve al bloquear.
 *
 * Monta las instancias **reales** exportadas de `rate-limit.middleware.ts` —no una
 * copia con números más pequeños— en una app de Express mínima, levantada en un
 * puerto suelto de `127.0.0.1`, y las golpea con peticiones HTTP de verdad (`fetch`
 * del propio Node, sin dependencias nuevas). Cada bloque de prueba usa una clave
 * nueva (un correo o un id de usuario con la hora en milisegundos) para no heredar
 * el cupo gastado por el bloque anterior ni por una corrida previa del script.
 *
 * **Fuerza el almacén en memoria** (`process.env.REDIS_URL = ''`, antes de cargar el
 * middleware) para no tocar el Redis de desarrollo del usuario: los limitadores se
 * construyen una sola vez, al cargar el módulo, así que el almacén real o el de
 * memoria se decide aquí y no puede cambiar a mitad de script. `require` y no
 * `import` por lo mismo que en `verificar-propiedad.ts` — las importaciones se
 * elevan y el middleware se cargaría antes de que `REDIS_URL` quedara vacía.
 *
 * **Lo que esto NO prueba**, con `REDIS_URL` vacía a propósito:
 *   - Que `RedisStore` cuente igual que `MemoryStore` (son dos implementaciones de la
 *     misma interfaz de `express-rate-limit`; la lógica de ventana/clave/skip que se
 *     prueba aquí es la misma para las dos).
 *   - `passOnStoreError`: que una caída de Redis deje pasar la petición en vez de
 *     devolver 500. Hace falta un Redis de verdad para apagarlo a mitad de prueba.
 *     Se prueba aparte, a mano, con un Redis desechable (ver `6-auditoria.md`).
 *
 * No toca la base de datos ni el Redis de desarrollo. Sale con código 1 si algo falla.
 *
 * @see 3-seguridad-del-proyecto.md §4.5
 */
import 'dotenv/config';

process.env.REDIS_URL = '';

import type { Request, Response, NextFunction } from 'express';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require('express') as typeof import('express');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const http = require('http') as typeof import('http');
const {
  limitadorGlobal,
  limitadorDeLogin,
  limitadorDeLogout,
  limitadorDePreguntas,
  limitadorDeVerificacion,
  limitadorDeRecuperacion,
  limitadorDeEscritura,
  limitadorDeVisitasPorPagina,
  limitadorDeVisitas,
  claveDeSesionOIp,
} = require('../../src/middlewares/rate-limit.middleware') as typeof import('../../src/middlewares/rate-limit.middleware');

let fallos = 0;
let comprobaciones = 0;

const informar = (ok: boolean, descripcion: string, detalle = '') => {
  comprobaciones += 1;
  if (!ok) fallos += 1;
  console.log(`  ${ok ? 'OK  ' : 'FALLA'}  ${descripcion}${detalle ? ` → ${detalle}` : ''}`);
};

// ── 1. claveDeSesionOIp: función pura, sin HTTP ─────────────────────────────

function verificarClaveDeSesionOIp(): void {
  console.log('\n=== claveDeSesionOIp: por usuario si hay sesión, por IP (normalizada) si no ===');

  const conUsuario = (id: string) => ({ user: { id }, ip: '198.51.100.9' }) as unknown as Request;
  const sinUsuario = (ip: string) => ({ user: undefined, ip }) as unknown as Request;

  informar(claveDeSesionOIp(conUsuario('abc-123')) === 'u:abc-123', 'con sesión usa u:<id>, no la IP');
  informar(
    claveDeSesionOIp(conUsuario('abc-123')) === claveDeSesionOIp(conUsuario('abc-123')),
    'el mismo usuario siempre da la misma clave'
  );

  const ipA1 = claveDeSesionOIp(sinUsuario('203.0.113.5'));
  const ipA2 = claveDeSesionOIp(sinUsuario('203.0.113.5'));
  const ipB = claveDeSesionOIp(sinUsuario('203.0.113.9'));
  informar(ipA1 === ipA2, 'sin sesión, la misma IPv4 da la misma clave');
  informar(ipA1 !== ipB, 'sin sesión, distinta IPv4 da distinta clave');

  // Dos direcciones del mismo /56 (comprobado contra `ipKeyGenerator` antes de escribir
  // esto): comparten cubo, que es justo lo que evita que una fibra doméstica con un
  // rango IPv6 entero esquive el límite cambiando de dirección en su propio rango.
  const v6MismoRangoA = claveDeSesionOIp(sinUsuario('2001:db8:aaaa:bb00::1'));
  const v6MismoRangoB = claveDeSesionOIp(sinUsuario('2001:db8:aaaa:bbff::1'));
  const v6OtroRango = claveDeSesionOIp(sinUsuario('2001:db8:cccc:bb00::1'));
  informar(v6MismoRangoA === v6MismoRangoB, 'dos IPv6 del mismo /56 comparten cubo', v6MismoRangoA);
  informar(v6MismoRangoA !== v6OtroRango, 'dos IPv6 de /56 distinto no comparten cubo');
}

// ── 2. Arnés HTTP: las instancias reales, en una app mínima ─────────────────

const ok = (_req: Request, res: Response) => res.status(200).json({ ok: true });

/**
 * Deja entrar `req.user` por una cabecera de prueba, antes de cualquier limitador.
 * Solo existe en este arnés — en la API real lo pone `requireAuth` tras verificar el
 * JWT; aquí no hace falta un login de verdad para probar la clave y el `skip`.
 */
const inyectarUsuarioDePrueba = (req: Request, _res: Response, next: NextFunction) => {
  const id = req.header('x-test-user-id');
  const role = req.header('x-test-user-role');
  if (id) req.user = { id, email: '', name: '', role: role || undefined } as Request['user'];
  next();
};

function construirApp() {
  const app = express();
  // Igual que `app.ts`: sin esto, `req.ip` sería el socket del arnés (siempre el
  // mismo) y `X-Forwarded-For` no serviría para simular clientes distintos.
  app.set('trust proxy', 1);
  app.use(express.json());
  app.use(inyectarUsuarioDePrueba);

  app.get('/global', limitadorGlobal, ok);
  app.post('/login', limitadorDeLogin, ok);
  app.post('/logout', limitadorDeLogout, ok);
  app.post('/preguntas', limitadorDePreguntas, ok);
  app.post('/verificar', limitadorDeVerificacion, ok);
  app.post('/recuperar', limitadorDeRecuperacion, ok);
  app.post('/escritura', limitadorDeEscritura, ok);
  app.post('/visita-pagina', limitadorDeVisitasPorPagina, ok);
  app.get('/visita', limitadorDeVisitas, ok);
  // Mismo orden que `pagina.routes.ts`: el techo por IP primero, el de IP+página después.
  app.post('/visitas/registrar', limitadorDeVisitas, limitadorDeVisitasPorPagina, ok);

  return app;
}

async function levantarServidor() {
  const servidor = http.createServer(construirApp());
  await new Promise<void>((resolve) => servidor.listen(0, '127.0.0.1', resolve));
  const direccion = servidor.address();
  const puerto = typeof direccion === 'object' && direccion ? direccion.port : 0;
  return { servidor, base: `http://127.0.0.1:${puerto}` };
}

interface OpcionesDePeticion {
  metodo?: string;
  ip?: string;
  body?: unknown;
  userId?: string;
  userRole?: string;
}

async function pedir(base: string, ruta: string, opciones: OpcionesDePeticion = {}) {
  const cabeceras: Record<string, string> = {};
  if (opciones.ip) cabeceras['X-Forwarded-For'] = opciones.ip;
  if (opciones.userId) cabeceras['x-test-user-id'] = opciones.userId;
  if (opciones.userRole) cabeceras['x-test-user-role'] = opciones.userRole;

  const metodo = opciones.metodo ?? (opciones.body !== undefined ? 'POST' : 'GET');
  const llevaCuerpo = metodo !== 'GET' && metodo !== 'HEAD';
  if (llevaCuerpo) cabeceras['Content-Type'] = 'application/json';

  const respuesta = await fetch(`${base}${ruta}`, {
    method: metodo,
    headers: cabeceras,
    body: llevaCuerpo ? JSON.stringify(opciones.body ?? {}) : undefined,
  });
  const cuerpo = await respuesta.json().catch(() => undefined);
  return { status: respuesta.status, headers: respuesta.headers, cuerpo };
}

/** Pide `veces` seguidas y cuenta cuántas dieron 429. Secuencial, para que el orden sea exacto. */
async function pedirVarias(base: string, ruta: string, veces: number, opciones: OpcionesDePeticion = {}) {
  let bloqueadas = 0;
  for (let i = 0; i < veces; i++) {
    const r = await pedir(base, ruta, opciones);
    if (r.status === 429) bloqueadas += 1;
  }
  return bloqueadas;
}

const correoDePrueba = (etiqueta: string) => `prueba-limites-${Date.now()}-${Math.random().toString(36).slice(2)}-${etiqueta}@sena.edu.co`;
const idDePrueba = (etiqueta: string) => `prueba-${etiqueta}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

async function verificarLimitadorPorCorreo(
  base: string,
  ruta: string,
  limite: number,
  mensaje: string,
  descripcion: string
): Promise<void> {
  console.log(`\n=== ${descripcion}: ${limite} por correo, no por IP ===`);
  const correoA = correoDePrueba('a');
  const correoB = correoDePrueba('b');

  const bloqueadasDentroDelCupo = await pedirVarias(base, ruta, limite, { body: { email: correoA }, ip: '10.1.0.1' });
  informar(bloqueadasDentroDelCupo === 0, `los primeros ${limite} intentos de un correo pasan`);

  const siguiente = await pedir(base, ruta, { body: { email: correoA }, ip: '10.1.0.1' });
  informar(siguiente.status === 429, `el intento número ${limite + 1} del mismo correo se bloquea`, String(siguiente.status));
  informar((siguiente.cuerpo as { error?: string } | undefined)?.error === mensaje, 'con el mensaje documentado');

  const otroCorreo = await pedir(base, ruta, { body: { email: correoB }, ip: '10.1.0.1' });
  informar(otroCorreo.status !== 429, 'otro correo desde la misma IP no está bloqueado', String(otroCorreo.status));

  const otraIp = await pedir(base, ruta, { body: { email: correoA }, ip: '10.1.0.2' });
  informar(otraIp.status === 429, 'el mismo correo desde otra IP sigue bloqueado (cuenta por correo, no por IP)', String(otraIp.status));

  const sinCorreo = await pedir(base, ruta, { body: {}, ip: '10.1.0.3' });
  informar(sinCorreo.status !== 429, 'sin correo en el cuerpo, cae a un cubo por IP (nuevo, sin gastar)', String(sinCorreo.status));
}

async function verificarLimitadorGlobal(base: string): Promise<void> {
  console.log('\n=== limitadorGlobal: 300/min por IP, exento el tráfico sin X-Forwarded-For ===');

  // Sin la cabecera, `skip` debe dejar pasar MÁS peticiones que el límite: si contara
  // igual, la número 301 se bloquearía.
  const sinCabecera = await pedirVarias(base, '/global', 301, {});
  informar(sinCabecera === 0, '301 peticiones sin X-Forwarded-For pasan todas (tráfico interno exento)');

  const conCabecera = await pedirVarias(base, '/global', 300, { metodo: 'GET', ip: '172.16.0.1' });
  informar(conCabecera === 0, 'con la cabecera, las primeras 300 de una IP pasan');
  const siguiente = await pedir(base, '/global', { metodo: 'GET', ip: '172.16.0.1' });
  informar(siguiente.status === 429, 'la 301.ª de esa IP se bloquea', String(siguiente.status));
  informar(
    (siguiente.cuerpo as { error?: string } | undefined)?.error === 'Demasiadas solicitudes. Espere un momento antes de continuar.',
    'con el mensaje documentado'
  );

  const otraIp = await pedir(base, '/global', { metodo: 'GET', ip: '172.16.0.2' });
  informar(otraIp.status !== 429, 'otra IP tiene su propio cupo', String(otraIp.status));
}

async function verificarLimitadorDeEscritura(base: string): Promise<void> {
  console.log('\n=== limitadorDeEscritura: 30 por usuario/min, exento el superadmin ===');

  const usuarioA = idDePrueba('escritura-a');
  const usuarioB = idDePrueba('escritura-b');

  const bloqueadas = await pedirVarias(base, '/escritura', 30, { metodo: 'POST', userId: usuarioA, userRole: 'Editor' });
  informar(bloqueadas === 0, 'las primeras 30 escrituras de un usuario pasan');
  const siguiente = await pedir(base, '/escritura', { metodo: 'POST', userId: usuarioA, userRole: 'Editor' });
  informar(siguiente.status === 429, 'la 31.ª se bloquea', String(siguiente.status));

  const otroUsuario = await pedir(base, '/escritura', { metodo: 'POST', userId: usuarioB, userRole: 'Editor' });
  informar(otroUsuario.status !== 429, 'otro usuario tiene su propio cupo', String(otroUsuario.status));

  const admin = idDePrueba('escritura-admin');
  const bloqueadasAdmin = await pedirVarias(base, '/escritura', 40, { metodo: 'POST', userId: admin, userRole: 'Superadmin' });
  informar(bloqueadasAdmin === 0, 'el superadmin no se bloquea ni pasadas 40 peticiones (exento por skip)');
}

async function verificarLimitadoresDeVisitas(base: string): Promise<void> {
  console.log('\n=== limitadorDeVisitasPorPagina: 5 por IP+página cada 10 min ===');

  const ipVisita = '192.0.2.10';
  const bloqueadas = await pedirVarias(base, '/visita-pagina', 5, { body: { slug: 'estudios' }, ip: ipVisita });
  informar(bloqueadas === 0, 'las primeras 5 visitas a una página desde una IP pasan');
  const siguiente = await pedir(base, '/visita-pagina', { body: { slug: 'estudios' }, ip: ipVisita });
  informar(siguiente.status === 429, 'la 6.ª visita a la misma página se bloquea', String(siguiente.status));
  informar((siguiente.cuerpo as { error?: string } | undefined)?.error === 'Visita ya registrada.', 'con el mensaje documentado');

  const otraPagina = await pedir(base, '/visita-pagina', { body: { slug: 'becas' }, ip: ipVisita });
  informar(otraPagina.status !== 429, 'otra página desde la misma IP tiene su propio cupo', String(otraPagina.status));

  console.log('\n=== limitadorDeVisitas: 30 por IP/min (el techo general de las visitas) ===');
  const ipGeneral = '192.0.2.20';
  const bloqueadasGeneral = await pedirVarias(base, '/visita', 30, { metodo: 'GET', ip: ipGeneral });
  informar(bloqueadasGeneral === 0, 'las primeras 30 visitas de una IP (a cualquier página) pasan');
  const siguienteGeneral = await pedir(base, '/visita', { metodo: 'GET', ip: ipGeneral });
  informar(siguienteGeneral.status === 429, 'la 31.ª visita de esa IP se bloquea aunque cada página tenga cupo propio', String(siguienteGeneral.status));

  console.log('\n=== Los dos juntos, en el mismo orden que pagina.routes.ts ===');
  const ipCombinada = '192.0.2.30';
  const bloqueadasCombinadas = await pedirVarias(base, '/visitas/registrar', 5, { body: { slug: 'convocatorias' }, ip: ipCombinada });
  informar(bloqueadasCombinadas === 0, 'las primeras 5 (el menor de los dos techos) pasan');
  const siguienteCombinada = await pedir(base, '/visitas/registrar', { body: { slug: 'convocatorias' }, ip: ipCombinada });
  informar(
    siguienteCombinada.status === 429 &&
      (siguienteCombinada.cuerpo as { error?: string } | undefined)?.error === 'Visita ya registrada.',
    'la 6.ª la bloquea el de IP+página, que es el más estrecho de los dos',
    `${siguienteCombinada.status} ${JSON.stringify(siguienteCombinada.cuerpo)}`
  );
}

async function verificarLimitadorDeLogout(base: string): Promise<void> {
  console.log('\n=== limitadorDeLogout: 100 por sesión/IP cada 15 min (techo holgado) ===');
  const usuario = idDePrueba('logout');
  const bloqueadas = await pedirVarias(base, '/logout', 100, { metodo: 'POST', userId: usuario });
  informar(bloqueadas === 0, 'las primeras 100 pasan');
  const siguiente = await pedir(base, '/logout', { metodo: 'POST', userId: usuario });
  informar(siguiente.status === 429, 'la 101.ª se bloquea', String(siguiente.status));
}

async function main() {
  verificarClaveDeSesionOIp();

  const { servidor, base } = await levantarServidor();
  try {
    await verificarLimitadorPorCorreo(base, '/preguntas', 10, 'Demasiadas solicitudes. Intente más tarde.', 'limitadorDePreguntas');
    await verificarLimitadorPorCorreo(base, '/verificar', 5, 'Demasiadas solicitudes. Intente más tarde.', 'limitadorDeVerificacion');
    await verificarLimitadorPorCorreo(
      base,
      '/recuperar',
      3,
      'Demasiados intentos de recuperación. Intente más tarde.',
      'limitadorDeRecuperacion'
    );
    await verificarLimitadorPorCorreo(
      base,
      '/login',
      10,
      'Demasiados intentos de inicio de sesión. Intente más tarde.',
      'limitadorDeLogin'
    );
    await verificarLimitadorDeLogout(base);
    await verificarLimitadorDeEscritura(base);
    await verificarLimitadoresDeVisitas(base);
    await verificarLimitadorGlobal(base);
  } finally {
    await new Promise((resolve) => servidor.close(resolve));
  }

  console.log(`\n${comprobaciones} comprobaciones · ${fallos === 0 ? 'Todo correcto.' : `${fallos} fallaron.`}\n`);
  process.exit(fallos === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('El script falló:', err instanceof Error ? err.stack : err);
  process.exit(1);
});

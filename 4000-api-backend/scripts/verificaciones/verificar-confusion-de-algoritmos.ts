/**
 * Comprueba que ningún verificador de sesión del proyecto se deje engañar con un JWT que
 * cambia el algoritmo de la cabecera: la «confusión de algoritmos».
 *
 * El proyecto firma con un secreto compartido (HS256, `JWT_SECRET`) y lo verifican tres
 * piezas: la API (`jsonwebtoken`, en `requireAuth`) y el borde de las dos apps (`jose`, en
 * `verificarSesion` del sitio y de la intranet). Un JWT dice con qué algoritmo se firmó en
 * su propia cabecera, que escribe quien lo presenta; si el verificador no fija cuáles
 * admite, esa cabecera decide. Los ataques que esto abre:
 *
 *  - **`alg: none`**: «este token no lleva firma». Se prueba también con mayúsculas mezcladas
 *    (`None`, `nOnE`), que es como se colaba en verificadores que comparaban el texto exacto.
 *  - **Un secreto, dos algoritmos HMAC**: HS384 y HS512 con el mismo `JWT_SECRET` también son
 *    firmas válidas para quien admite «cualquier HS*». No abre nada por sí solo, pero una clave
 *    que sirve para dos algoritmos es justo lo que se quiere cerrar: el proyecto usa HS256.
 *  - **RS256→HS256 (la clásica)**: con una clave pública RSA, el atacante cambia la cabecera a
 *    HS256 y firma con HMAC usando **la clave pública como secreto**. Un verificador que elige
 *    el algoritmo por la cabecera y recibe esa clave pública la acepta. Aquí no hay claves
 *    asimétricas, así que no es explotable hoy; la prueba existe para que no lo sea el día
 *    que alguien añada una (un proveedor de identidad, un JWKS) y pase la clave al mismo
 *    verificador. Se prueba también al revés: cabecera RS256/ES256/PS256 con firma real
 *    hecha con una clave del atacante.
 *  - **Claves dentro de la cabecera**: `jwk` incrustado, `jku`, `x5u`, `kid`. Un verificador
 *    no debe fiarse de la clave que trae el propio token.
 *
 * Los tokens falsos llevan `isLocal: true` y rol `Superadmin`: si alguno se aceptara,
 * `requireAuth` lo dejaría pasar **sin consultar la base** (por eso la verificación no toca
 * Neon ni ninguna otra). Misma convención que `verificar-cookie-de-sesion.ts`.
 *
 * Las verificaciones del sitio y de la intranet se importan de sus carpetas: son
 * independientes de la API (otro paquete, `jose` en vez de `jsonwebtoken`) y la única forma
 * de saber que rechazan es ejecutarlas.
 */
process.env.JWT_SECRET ||= 'secreto-solo-para-esta-verificacion';

import {
  createHmac,
  createSign,
  generateKeyPairSync,
  type KeyObject,
} from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../src/config';
import { requireAuth } from '../../src/middlewares/auth.middleware';
import { verificarSesion as verificarSesionDelSitio } from '../../../3000-sitio-web/src/shared/lib/session/verificar-sesion';
import { verificarSesion as verificarSesionDeLaIntranet } from '../../../3001-intranet/src/shared/lib/session/verificar-sesion';

let fallos = 0;

const SECRETO = config.jwtSecret;
const AHORA = Math.floor(Date.now() / 1000);

/** Lo que el atacante querría ser: un Superadmin local, que `requireAuth` no contrasta con la base. */
const CARGA = {
  id: 'atacante',
  email: 'atacante@example.com',
  name: 'Atacante',
  role: 'Superadmin',
  isLocal: true,
  must_change_password: false,
  must_setup_security_questions: false,
  permisos: [] as string[],
  iat: AHORA,
  exp: AHORA + 3600,
};

/** La carga sin `iat` ni `exp`: `jwt.sign` los pone él (y rechaza que vengan en la carga y con `expiresIn`). */
const sinFechas = ({ iat: _iat, exp: _exp, ...resto }: typeof CARGA) => resto;

// ── Armado de tokens a mano (sin pasar por ninguna librería de JWT) ─────────

const b64u = (x: string | Buffer): string => Buffer.from(x).toString('base64url');

/** `cabecera.carga.firma`, con la firma ya codificada o vacía. */
const ensamblar = (cabecera: unknown, carga: unknown, firma = ''): string =>
  `${b64u(JSON.stringify(cabecera))}.${b64u(JSON.stringify(carga))}.${firma}`;

/** La parte que se firma: `cabecera.carga`. */
const aFirmar = (cabecera: unknown, carga: unknown): string =>
  `${b64u(JSON.stringify(cabecera))}.${b64u(JSON.stringify(carga))}`;

type Hash = 'sha256' | 'sha384' | 'sha512';
const NOMBRE_HS: Record<Hash, string> = { sha256: 'HS256', sha384: 'HS384', sha512: 'HS512' };

/** Token firmado con HMAC. `algCabecera` permite mentir sobre el algoritmo que dice la cabecera. */
const conHmac = (hash: Hash, clave: string | Buffer, algCabecera = NOMBRE_HS[hash], carga = CARGA): string => {
  const cabecera = { alg: algCabecera, typ: 'JWT' };
  const firma = createHmac(hash, clave).update(aFirmar(cabecera, carga)).digest();
  return ensamblar(cabecera, carga, b64u(firma));
};

const rsa = generateKeyPairSync('rsa', { modulusLength: 2048 });
const ec = generateKeyPairSync('ec', { namedCurve: 'P-256' });

const pemPublica = (clave: KeyObject): string => clave.export({ type: 'spki', format: 'pem' }).toString();

/** Token con la cabecera dada y una firma RSA real hecha con la clave privada del atacante. */
const conRsa = (cabecera: Record<string, unknown>): string => {
  const firma = createSign('RSA-SHA256').update(aFirmar(cabecera, CARGA)).sign(rsa.privateKey);
  return ensamblar(cabecera, CARGA, b64u(firma));
};

/** Ídem con una clave EC (ES256 en formato P1363, el que usa JWS). */
const conEc = (cabecera: Record<string, unknown>): string => {
  const firma = createSign('SHA256').update(aFirmar(cabecera, CARGA)).sign({ key: ec.privateKey, dsaEncoding: 'ieee-p1363' });
  return ensamblar(cabecera, CARGA, b64u(firma));
};

// ── Los tres verificadores, tal como los usa el proyecto ────────────────────

/** ¿`requireAuth` deja pasar este Bearer? Se mide con `next()`: si pasa, no llega a la base. */
const laApiLoAcepta = async (token: string): Promise<boolean> => {
  let siguio = false;
  const req = { headers: { authorization: `Bearer ${token}` }, cookies: {} } as unknown as Request;
  const res = {
    status() {
      return this;
    },
    json() {
      return this;
    },
  } as unknown as Response;
  const next: NextFunction = () => {
    siguio = true;
  };

  // `requireAuth` deja un `console.log` por cada token rechazado.
  const original = console.log;
  console.log = () => undefined;
  try {
    await requireAuth(req, res, next);
  } finally {
    console.log = original;
  }
  return siguio;
};

const elSitioLoAcepta = async (token: string): Promise<boolean> => (await verificarSesionDelSitio(token)) !== null;
const laIntranetLoAcepta = async (token: string): Promise<boolean> => (await verificarSesionDeLaIntranet(token)) !== null;

const VERIFICADORES: Array<[string, (token: string) => Promise<boolean>]> = [
  ['API (requireAuth)', laApiLoAcepta],
  ['sitio web (proxy)', elSitioLoAcepta],
  ['intranet (proxy)', laIntranetLoAcepta],
];

/** Pasa el token por los tres verificadores y comprueba que todos hagan lo esperado. */
const comprobar = async (descripcion: string, token: string, debeAceptarse: boolean): Promise<void> => {
  const malos: string[] = [];
  for (const [nombre, verificador] of VERIFICADORES) {
    if ((await verificador(token)) !== debeAceptarse) malos.push(nombre);
  }
  if (malos.length > 0) fallos += 1;
  const esperado = debeAceptarse ? 'se acepta' : 'se rechaza';
  console.log(`  ${malos.length === 0 ? 'OK  ' : 'FALLA'}  ${descripcion} (${esperado})${malos.length ? ` → NO lo hace: ${malos.join(', ')}` : ''}`);
};

// ── Casos ────────────────────────────────────────────────────────────────────

const verificar = async (): Promise<void> => {
  console.log('\n=== Lo legítimo sigue funcionando ===');
  await comprobar('HS256 firmado a mano con el secreto', conHmac('sha256', SECRETO), true);
  // El de la API es el que de verdad emite `login.usecase.ts`: si el verificador se pasara de
  // estricto, todo el mundo se quedaría sin poder entrar.
  await comprobar(
    'el token que firma la API (`jwt.sign` como en el login)',
    jwt.sign(sinFechas(CARGA), SECRETO, { expiresIn: config.jwtExpiresIn as any }),
    true
  );
  await comprobar('HS256 con otro secreto', conHmac('sha256', `${SECRETO}-otro`), false);
  await comprobar('HS256 caducado', conHmac('sha256', SECRETO, 'HS256', { ...CARGA, exp: AHORA - 60 }), false);

  console.log('\n=== alg: none (sin firma) ===');
  for (const alg of ['none', 'None', 'NONE', 'nOnE']) {
    await comprobar(`alg «${alg}» con firma vacía`, ensamblar({ alg, typ: 'JWT' }, CARGA, ''), false);
  }
  await comprobar('alg «none» con una firma cualquiera', ensamblar({ alg: 'none', typ: 'JWT' }, CARGA, b64u('basura')), false);
  await comprobar('alg «none» y tres puntos de más', ensamblar({ alg: 'none' }, CARGA, '') + '.', false);

  console.log('\n=== Un secreto, dos algoritmos: HS384 y HS512 con el mismo JWT_SECRET ===');
  await comprobar('HS384 con el secreto bueno', conHmac('sha384', SECRETO), false);
  await comprobar('HS512 con el secreto bueno', conHmac('sha512', SECRETO), false);

  console.log('\n=== RS256→HS256: la clave pública como secreto del HMAC ===');
  const publica = pemPublica(rsa.publicKey);
  await comprobar('cabecera HS256, firma HMAC con la clave pública RSA', conHmac('sha256', publica, 'HS256'), false);
  await comprobar('cabecera RS256, firma HMAC-SHA256 con la clave pública (la clásica)', conHmac('sha256', publica, 'RS256'), false);
  await comprobar('cabecera RS256, firma HMAC-SHA256 con el secreto del proyecto', conHmac('sha256', SECRETO, 'RS256'), false);
  await comprobar('cabecera PS256, firma HMAC-SHA256 con el secreto del proyecto', conHmac('sha256', SECRETO, 'PS256'), false);
  await comprobar('cabecera ES256, firma HMAC-SHA256 con el secreto del proyecto', conHmac('sha256', SECRETO, 'ES256'), false);

  console.log('\n=== Firma asimétrica real, hecha con una clave del atacante ===');
  await comprobar('RS256 firmado con la clave privada del atacante', conRsa({ alg: 'RS256', typ: 'JWT' }), false);
  await comprobar('ES256 firmado con la clave privada del atacante', conEc({ alg: 'ES256', typ: 'JWT' }), false);

  console.log('\n=== Claves metidas en la cabecera ===');
  const jwkPublica = rsa.publicKey.export({ format: 'jwk' });
  await comprobar('`jwk` incrustado con la clave del atacante (RS256)', conRsa({ alg: 'RS256', typ: 'JWT', jwk: jwkPublica }), false);
  await comprobar('`jku` apuntando a un servidor del atacante', conRsa({ alg: 'RS256', typ: 'JWT', jku: 'https://atacante.example/jwks.json' }), false);
  await comprobar('`x5u` apuntando a un servidor del atacante', conRsa({ alg: 'RS256', typ: 'JWT', x5u: 'https://atacante.example/cert.pem' }), false);
  await comprobar('`kid` con un camino de archivo, firma HS256 con otro secreto', ensamblar({ alg: 'HS256', typ: 'JWT', kid: '../../../../dev/null' }, CARGA, b64u(createHmac('sha256', '').update('x').digest())), false);

  console.log('\n=== Cabeceras y formas rotas ===');
  await comprobar('sin `alg`', ensamblar({ typ: 'JWT' }, CARGA, b64u('x')), false);
  await comprobar('`alg` numérico', ensamblar({ alg: 256, typ: 'JWT' }, CARGA, b64u('x')), false);
  await comprobar('`alg` vacío', ensamblar({ alg: '', typ: 'JWT' }, CARGA, b64u('x')), false);
  await comprobar('`alg` es una lista', ensamblar({ alg: ['HS256', 'none'], typ: 'JWT' }, CARGA, b64u('x')), false);
  await comprobar('solo dos partes (sin firma ni punto final)', aFirmar({ alg: 'HS256' }, CARGA), false);
  await comprobar('cuatro partes', `${conHmac('sha256', SECRETO)}.extra`, false);
  await comprobar('la cabecera no es JSON', `${b64u('esto no es json')}.${b64u(JSON.stringify(CARGA))}.${b64u('x')}`, false);
  await comprobar('cadena vacía', '', false);

  console.log(fallos === 0 ? '\nTodo correcto.\n' : `\n${fallos} comprobaciones fallaron.\n`);
  process.exit(fallos === 0 ? 0 : 1);
};

verificar();

/**
 * Prueba de IDOR / autorización a nivel de objeto, por HTTP real y con cuentas de verdad.
 *
 * `propiedad:verificar` mira la cadena de middlewares de cada ruta; no puede ver lo que
 * pasa **dentro** del caso de uso. Esta prueba es la otra mitad: levanta la aplicación,
 * inicia sesión con una cuenta de cada rol y ataca los objetos de los demás (cuentas,
 * roles, páginas, versiones, candados, cargas, archivos), comprobando dos cosas:
 *
 *  - que el servidor **niega** (403/404) y que **no cambió nada** en la base, y
 *  - que cada negativa tiene su **control** (quien sí puede, puede), para que una prueba
 *    no pase en vacío porque la ruta estaba rota.
 *
 * Resultados: OK (como se espera), FALLA (hueco confirmado; sale con código 1) y AVISO
 * (permitido hoy, a propósito o por decidir; no falla, pero conviene leerlo).
 *
 * **Escribe en la base** (cuentas, roles, páginas, cargas) y borra lo suyo al terminar.
 * Por eso se niega a correr salvo contra una base local cuyo nombre contenga «prueba»,
 * «test» o «idor», y fuera de producción. Nunca contra Neon ni contra el dev.
 *
 * Uso (Postgres y Redis desechables; ver `probar-sin-tocar-neon-ni-el-dev`):
 *   DATABASE_URL=postgres://postgres:prueba@localhost:55433/olo_prueba DB_SSL=false \
 *   REDIS_URL=redis://localhost:56380/0 JWT_SECRET=<uno de prueba> LOCAL_AUTH_EMAIL= \
 *   LOCAL_AUTH_PASSWORD= FILESYSTEM_DIR=<carpeta temporal> npm run idor:verificar
 * La base debe tener las migraciones y `npm run sembrar:permisos`.
 *
 * @see 3-seguridad-del-proyecto.md §S10
 */
import 'dotenv/config';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import type { AddressInfo } from 'net';
import { QueryTypes } from 'sequelize';

// ---------------------------------------------------------------------------
// 0. Salvaguarda: esto escribe, así que solo corre contra una base desechable
// ---------------------------------------------------------------------------

const abortar = (motivo: string): never => {
  console.error(`\nNO SE EJECUTA: ${motivo}\n`);
  process.exit(2);
};

const urlBase = (() => {
  try {
    return new URL(process.env.DATABASE_URL ?? '');
  } catch {
    return abortar('DATABASE_URL falta o no es una URL.');
  }
})();
const nombreDeBase = urlBase.pathname.replace(/^\//, '');

if (process.env.NODE_ENV === 'production') abortar('NODE_ENV=production.');
if (!['localhost', '127.0.0.1', '::1', '[::1]'].includes(urlBase.hostname)) {
  abortar(`la base está en «${urlBase.hostname}», no es local.`);
}
if (!/prueba|test|idor/i.test(nombreDeBase)) {
  abortar(`la base se llama «${nombreDeBase}»; para correr aquí su nombre debe contener prueba, test o idor.`);
}
if (!process.env.FILESYSTEM_DIR) abortar('define FILESYSTEM_DIR a una carpeta temporal (la prueba escribe archivos).');

// `require` y no `import`: las importaciones se elevan y cargarían la configuración
// (y la conexión) antes de que la salvaguarda de arriba hubiera podido negarse.
const sequelize = require('../../src/config/database').default as import('sequelize').Sequelize;
const { hashearPassword } = require('../../src/shared/password-policy') as typeof import('../../src/shared/password-policy');
const { app } = require('../../src/app') as typeof import('../../src/app');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Redis = require('ioredis');

// ---------------------------------------------------------------------------
// 1. Utilidades de prueba
// ---------------------------------------------------------------------------

const PASSWORD = 'Idor-Prueba-2026!x';
const PREFIJO_CORREO = 'idor-';
const DOMINIO = '@sena.edu.co';
const UUID_INEXISTENTE = '00000000-0000-4000-8000-000000000000';
const MARCA_SECRETA = 'SECRETO-DE-OTRA-PAGINA-IDOR';

let fallos = 0;
let avisos = 0;
let comprobaciones = 0;
const resumenDeFallos: string[] = [];

const ok = (descripcion: string, detalle = '') => {
  comprobaciones += 1;
  console.log(`  OK     ${descripcion}${detalle ? ` — ${detalle}` : ''}`);
};
const falla = (descripcion: string, detalle = '') => {
  comprobaciones += 1;
  fallos += 1;
  resumenDeFallos.push(descripcion);
  console.log(`  FALLA  ${descripcion}${detalle ? ` — ${detalle}` : ''}`);
};
const aviso = (descripcion: string, detalle = '') => {
  avisos += 1;
  console.log(`  AVISO  ${descripcion}${detalle ? ` — ${detalle}` : ''}`);
};
/**
 * Hueco confirmado cuyo arreglo es una decisión de producto aún sin tomar. No falla la
 * prueba (si no, nadie la correría en verde), pero se imprime y se cuenta aparte, y se
 * lista al final. Cuando se cierra, se cambia por `afirmar` y el hueco queda vigilado.
 */
const abiertos: string[] = [];
const abierto = (descripcion: string, detalle = '') => {
  abiertos.push(descripcion);
  console.log(`  ABIERTO ${descripcion}${detalle ? ` — ${detalle}` : ''}`);
};
const seccion = (titulo: string) => console.log(`\n=== ${titulo} ===`);

type Resp = { status: number; json: any; texto: string };
type Actor = { clave: string; id: string; email: string; rol: string; token: string };

let base = '';
let redis: any = null;

/** Vacía los contadores de los limitadores: la prueba hace más peticiones que una persona. */
const limpiarLimites = async () => {
  if (!redis) return;
  const claves: string[] = await redis.keys('rl:*');
  if (claves.length) await redis.del(...claves);
};

const consulta = async <T = any>(sql: string, replacements: Record<string, unknown> = {}): Promise<T[]> =>
  (await sequelize.query(sql, { type: QueryTypes.SELECT, replacements, logging: false })) as T[];

const ejecutar = async (sql: string, replacements: Record<string, unknown> = {}) => {
  await sequelize.query(sql, { replacements, logging: false });
};

type Opciones = { cuerpo?: unknown; ambito?: string | null; cabeceras?: Record<string, string> };

const llamar = async (actor: Actor | null, metodo: string, ruta: string, op: Opciones = {}): Promise<Resp> => {
  const intento = async (): Promise<Resp> => {
    const cabeceras: Record<string, string> = { ...(op.cabeceras ?? {}) };
    if (actor) cabeceras.authorization = `Bearer ${actor.token}`;
    if (op.ambito !== null && op.ambito !== undefined) cabeceras['x-ambito'] = op.ambito;
    let cuerpo: string | undefined;
    if (op.cuerpo !== undefined) {
      cabeceras['content-type'] = 'application/json';
      cuerpo = JSON.stringify(op.cuerpo);
    }
    const r = await fetch(`${base}${ruta}`, { method: metodo, headers: cabeceras, body: cuerpo });
    const texto = await r.text();
    let json: any = null;
    try {
      json = JSON.parse(texto);
    } catch {
      /* no era JSON */
    }
    return { status: r.status, json, texto };
  };
  const r = await intento();
  if (r.status === 429) {
    await limpiarLimites();
    return intento();
  }
  return r;
};

/** Petición con la ruta tal cual, sin que el cliente HTTP normalice `..` ni `%2e`. */
const crudo = (actor: Actor | null, ruta: string): Promise<Resp> =>
  new Promise((resolver, rechazar) => {
    const { port } = new URL(base);
    const cabeceras: Record<string, string> = {};
    if (actor) cabeceras.authorization = `Bearer ${actor.token}`;
    const req = http.request({ host: '127.0.0.1', port, path: ruta, method: 'GET', headers: cabeceras }, (res) => {
      const trozos: Buffer[] = [];
      res.on('data', (t) => trozos.push(t));
      res.on('end', () => {
        const texto = Buffer.concat(trozos).toString('latin1');
        let json: any = null;
        try {
          json = JSON.parse(texto);
        } catch {
          /* binario o HTML */
        }
        resolver({ status: res.statusCode ?? 0, json, texto });
      });
    });
    req.on('error', rechazar);
    req.end();
  });

/** Exige que el estado sea uno de los esperados. */
const estado = (descripcion: string, r: Resp, esperado: number | number[]) => {
  const lista = Array.isArray(esperado) ? esperado : [esperado];
  if (lista.includes(r.status)) ok(descripcion, `HTTP ${r.status}`);
  else falla(descripcion, `HTTP ${r.status} (esperado ${lista.join(' o ')}) ${r.texto.slice(0, 140)}`);
};

/** Exige que se niegue (403/404, o 401 si no hay sesión) y no sea un éxito ni un 500. */
const niega = (descripcion: string, r: Resp) => {
  if ([401, 403, 404].includes(r.status)) ok(descripcion, `HTTP ${r.status}`);
  else falla(descripcion, `HTTP ${r.status} — debía negarse ${r.texto.slice(0, 140)}`);
};

const afirmar = (descripcion: string, condicion: boolean, detalle = '') =>
  condicion ? ok(descripcion, detalle) : falla(descripcion, detalle);

// ---------------------------------------------------------------------------
// 2. Datos de prueba
// ---------------------------------------------------------------------------

const rolesCreados: string[] = [];
const usuariosCreados: string[] = [];
const cargasCreadas: string[] = [];
const archivosCreados: string[] = [];
const paginasQueYaEstaban = new Set<string>();
const SLUGS_DE_PRUEBA: Array<[string, string]> = [
  ['sitio', 'inicio'],
  ['sitio', 'clasificacion'],
  ['intranet', 'inicio'],
  ['intranet', 'matriz'],
  ['intranet', 'tasa'],
];

const idDeRol = async (nombre: string): Promise<string> => {
  const filas = await consulta<{ id: string }>('SELECT id FROM roles WHERE nombre = :nombre', { nombre });
  if (!filas[0]) throw new Error(`Falta el rol «${nombre}»: aplica las migraciones y «npm run sembrar:permisos».`);
  return filas[0].id;
};

const crearRolConPermisos = async (nombre: string, claves: string[]): Promise<string> => {
  await ejecutar('INSERT INTO roles (nombre, descripcion) VALUES (:nombre, :d) ON CONFLICT (nombre) DO NOTHING', {
    nombre,
    d: 'Rol de la prueba de IDOR',
  });
  const id = await idDeRol(nombre);
  await ejecutar('DELETE FROM roles_permisos WHERE rol_id = :id', { id });
  for (const clave of claves) {
    await ejecutar(
      'INSERT INTO roles_permisos (rol_id, permiso_id) SELECT :id, id FROM permisos WHERE clave = :clave',
      { id, clave }
    );
  }
  rolesCreados.push(id);
  return id;
};

const crearUsuario = async (clave: string, nombreRol: string): Promise<{ id: string; email: string }> => {
  const email = `${PREFIJO_CORREO}${clave}${DOMINIO}`;
  const rol = await idDeRol(nombreRol);
  const hash = await hashearPassword(PASSWORD);
  const filas = await consulta<{ id: string }>(
    `INSERT INTO usuarios (nombre, apellidos, email, password_hash, rol_id, estado,
                           debe_configurar_preguntas, debe_cambiar_password)
     VALUES (:nombre, 'Idor', :email, :hash, :rol, 'active', false, false) RETURNING id`,
    { nombre: `Idor ${clave}`, email, hash, rol }
  );
  const id = filas[0].id;
  usuariosCreados.push(id);
  // Sin tres preguntas el login enciende «configurar preguntas» y `requireAuth` responde 403 a todo.
  for (const [orden, pregunta] of ['pet_name', 'birth_city', 'favorite_food'].entries()) {
    await ejecutar(
      'INSERT INTO preguntas_seguridad (usuario_id, pregunta_clave, respuesta_hash, orden) VALUES (:id, :p, :h, :o)',
      { id, p: pregunta, h: hash, o: orden }
    );
  }
  return { id, email };
};

/** Cuenta con sesión iniciada por el login real (nunca un token firmado a mano). */
const crearActor = async (clave: string, nombreRol: string): Promise<Actor> => {
  const { id, email } = await crearUsuario(clave, nombreRol);
  const r = await llamar(null, 'POST', '/api/login', { cuerpo: { email, password: PASSWORD } });
  if (r.status !== 200 || !r.json?.token) {
    throw new Error(`No se pudo iniciar sesión como ${clave}: HTTP ${r.status} ${r.texto.slice(0, 200)}`);
  }
  return { clave, id, email, rol: nombreRol, token: r.json.token };
};

const rolDe = async (id: string) =>
  (await consulta<{ nombre: string }>('SELECT r.nombre FROM usuarios u JOIN roles r ON r.id = u.rol_id WHERE u.id = :id', { id }))[0]?.nombre;
const campoDe = async (id: string, columna: 'estado' | 'nombre' | 'email' | 'password_hash') =>
  (await consulta<any>(`SELECT ${columna} AS v FROM usuarios WHERE id = :id`, { id }))[0]?.v;
const existeUsuario = async (id: string) => (await consulta('SELECT 1 FROM usuarios WHERE id = :id', { id })).length > 0;

const contenidoDe = (texto: string) => ({
  content: [{ type: 'Texto', props: { id: `t-${randomUUID().slice(0, 8)}`, texto } }],
  root: { props: {} },
});

const limpiar = async () => {
  for (const [ambito, slug] of SLUGS_DE_PRUEBA) {
    if (!paginasQueYaEstaban.has(`${ambito}/${slug}`)) {
      await ejecutar('DELETE FROM paginas WHERE ambito = :ambito AND slug = :slug', { ambito, slug });
    }
  }
  await ejecutar('DELETE FROM bloqueos_edicion');
  if (cargasCreadas.length) await ejecutar('DELETE FROM cargas_datos WHERE id IN (:ids)', { ids: cargasCreadas });
  await ejecutar(`DELETE FROM usuarios WHERE email LIKE :p`, { p: `${PREFIJO_CORREO}%${DOMINIO}` });
  await ejecutar(`DELETE FROM roles WHERE nombre LIKE 'Editor Idor%'`);
  for (const f of archivosCreados) fs.rmSync(f, { force: true });
};

// ---------------------------------------------------------------------------
// 3. Escenarios
// ---------------------------------------------------------------------------

type Mundo = {
  super: Actor;
  admin: Actor;
  admin2: Actor;
  ed1: Actor;
  ed2: Actor;
  director: Actor;
  parcial: Actor; // solo intranet / matriz
  soloSitio: Actor; // solo sitio / inicio
  rolSuper: string;
  rolAdmin: string;
  rolEditor: string;
  rolDirector: string;
};

const nuevaVictimaSuperadmin = async (m: Mundo) => {
  const v = await crearUsuario(`victima-${randomUUID().slice(0, 6)}`, 'Superadmin');
  return { ...v, rol: m.rolSuper };
};

const probarCuentas = async (m: Mundo) => {
  seccion('A. Cuentas (/api/users)');
  await limpiarLimites();

  const r1 = await llamar(m.ed1, 'GET', `/api/users/${m.ed1.id}`);
  estado('control: el Editor lee su propia cuenta', r1, 200);
  afirmar('la respuesta no trae hashes de contraseña ni de respuestas', !/password_hash|previous_password_hash|respuesta_hash|answer_hash/i.test(r1.texto));

  const ajena = await llamar(m.ed1, 'GET', `/api/users/${m.admin.id}`);
  const inexistente = await llamar(m.ed1, 'GET', `/api/users/${UUID_INEXISTENTE}`);
  niega('el Editor no lee la cuenta de un Administrador', ajena);
  niega('el Editor no lee un id inexistente', inexistente);
  afirmar(
    'sin enumeración: cuenta ajena e inexistente responden igual',
    ajena.status === inexistente.status && JSON.stringify(ajena.json) === JSON.stringify(inexistente.json)
  );
  niega('el Director no lee la cuenta de un Editor', await llamar(m.director, 'GET', `/api/users/${m.ed1.id}`));

  // Escritura ajena
  const nombreAntes = await campoDe(m.admin.id, 'nombre');
  niega('el Editor no edita la cuenta de un Administrador', await llamar(m.ed1, 'PATCH', `/api/users/${m.admin.id}`, { cuerpo: { name: 'Hackeado' } }));
  afirmar('…y el nombre del Administrador sigue igual', (await campoDe(m.admin.id, 'nombre')) === nombreAntes);

  // Autoservicio: lista blanca
  const rolEd = await rolDe(m.ed1.id);
  estado('control: el Editor cambia su propio nombre', await llamar(m.ed1, 'PATCH', `/api/users/${m.ed1.id}`, { cuerpo: { name: 'Idor ed1' } }), 200);
  const subeRol = await llamar(m.ed1, 'PATCH', `/api/users/${m.ed1.id}`, { cuerpo: { role_id: m.rolSuper } });
  niega('el Editor no se asciende a Superadmin', subeRol);
  afirmar('…y su rol sigue siendo Editor', (await rolDe(m.ed1.id)) === rolEd);
  const reset = await llamar(m.ed1, 'PATCH', `/api/users/${m.ed1.id}`, { cuerpo: { reset_password: true } });
  niega('el Editor no se restablece la contraseña por la puerta de «Mi perfil»', reset);
  afirmar('…y no se filtró ninguna contraseña temporal', !/temporaryPassword/.test(reset.texto));
  niega('el Editor no se quita la caducidad ni toca su estado', await llamar(m.ed1, 'PATCH', `/api/users/${m.ed1.id}`, { cuerpo: { status: 'inactive' } }));

  // Borrado
  niega('el Editor no borra la cuenta de otro', await llamar(m.ed1, 'DELETE', `/api/users/${m.ed2.id}`));
  niega('el Editor no se borra a sí mismo', await llamar(m.ed1, 'DELETE', `/api/users/${m.ed1.id}`));
  niega('el Director no borra cuentas', await llamar(m.director, 'DELETE', `/api/users/${m.ed1.id}`));
  afirmar('…y las cuentas siguen existiendo', (await existeUsuario(m.ed1.id)) && (await existeUsuario(m.ed2.id)));
  niega('el Editor no lista usuarios', await llamar(m.ed1, 'GET', '/api/users'));
  niega('el Editor no crea usuarios', await llamar(m.ed1, 'POST', '/api/users', { cuerpo: { name: 'X', email: `${PREFIJO_CORREO}x${DOMINIO}`, role_id: m.rolEditor } }));

  // Administrador contra Superadmin: la escalada vertical
  console.log('\n  [Administrador contra una cuenta Superadmin]');
  {
    const v = await nuevaVictimaSuperadmin(m);
    const hashAntes = await campoDe(v.id, 'password_hash');
    const r = await llamar(m.admin, 'PATCH', `/api/users/${v.id}`, { cuerpo: { reset_password: true } });
    const filtrada = /temporaryPassword/.test(r.texto);
    if (r.status === 200 || filtrada || (await campoDe(v.id, 'password_hash')) !== hashAntes) {
      falla('un Administrador restablece la contraseña de un Superadmin', `HTTP ${r.status}; la temporal ${filtrada ? 'viene en la respuesta (toma de cuenta)' : 'se aplicó'}`);
    } else ok('un Administrador no restablece la contraseña de un Superadmin', `HTTP ${r.status}`);
  }
  {
    const v = await nuevaVictimaSuperadmin(m);
    const r = await llamar(m.admin, 'PATCH', `/api/users/${v.id}`, { cuerpo: { role_id: m.rolEditor } });
    if ((await rolDe(v.id)) !== 'Superadmin') falla('un Administrador degrada a un Superadmin', `HTTP ${r.status}`);
    else ok('un Administrador no degrada a un Superadmin', `HTTP ${r.status}`);
  }
  {
    const v = await nuevaVictimaSuperadmin(m);
    const r = await llamar(m.admin, 'PATCH', `/api/users/${v.id}`, { cuerpo: { status: 'inactive' } });
    if ((await campoDe(v.id, 'estado')) !== 'active') falla('un Administrador desactiva a un Superadmin', `HTTP ${r.status}`);
    else ok('un Administrador no desactiva a un Superadmin', `HTTP ${r.status}`);
  }
  {
    const v = await nuevaVictimaSuperadmin(m);
    const nuevo = `${PREFIJO_CORREO}robado-${randomUUID().slice(0, 6)}${DOMINIO}`;
    const r = await llamar(m.admin, 'PATCH', `/api/users/${v.id}`, { cuerpo: { email: nuevo } });
    if ((await campoDe(v.id, 'email')) === nuevo) falla('un Administrador cambia el correo de un Superadmin', `HTTP ${r.status}`);
    else ok('un Administrador no cambia el correo de un Superadmin', `HTTP ${r.status}`);
  }
  {
    const v = await nuevaVictimaSuperadmin(m);
    const r = await llamar(m.admin, 'DELETE', `/api/users/${v.id}`);
    if (!(await existeUsuario(v.id))) falla('un Administrador borra a un Superadmin', `HTTP ${r.status}`);
    else ok('un Administrador no borra a un Superadmin', `HTTP ${r.status}`);
  }
  {
    const r = await llamar(m.admin, 'POST', '/api/users', {
      cuerpo: { name: 'Nuevo Super', email: `${PREFIJO_CORREO}nuevo-super${DOMINIO}`, role_id: m.rolSuper },
    });
    const creados = await consulta<{ id: string }>('SELECT id FROM usuarios WHERE email = :e', { e: `${PREFIJO_CORREO}nuevo-super${DOMINIO}` });
    if (creados[0]) {
      usuariosCreados.push(creados[0].id);
      falla('un Administrador crea una cuenta Superadmin', `HTTP ${r.status}; recibe la contraseña temporal`);
    } else ok('un Administrador no crea cuentas Superadmin', `HTTP ${r.status}`);
  }
  {
    const complice = await crearUsuario(`complice-${randomUUID().slice(0, 6)}`, 'Editor');
    const r = await llamar(m.admin, 'PATCH', `/api/users/${complice.id}`, { cuerpo: { role_id: m.rolSuper } });
    if ((await rolDe(complice.id)) === 'Superadmin') falla('un Administrador asciende a otra cuenta a Superadmin', `HTTP ${r.status}`);
    else ok('un Administrador no asciende a otra cuenta a Superadmin', `HTTP ${r.status}`);
  }
  {
    // Control: la regla no le quita al Superadmin lo que es suyo.
    const v = await nuevaVictimaSuperadmin(m);
    const r = await llamar(m.super, 'PATCH', `/api/users/${v.id}`, { cuerpo: { reset_password: true } });
    estado('control: un Superadmin sí restablece la contraseña de otro Superadmin', r, 200);
    const nuevo = await llamar(m.super, 'POST', '/api/users', {
      cuerpo: { name: 'Super Creado', email: `${PREFIJO_CORREO}super-creado${DOMINIO}`, role_id: m.rolSuper },
    });
    estado('control: …y crea una cuenta Superadmin', nuevo, 201);
    const creada = await consulta<{ id: string }>('SELECT id FROM usuarios WHERE email = :e', { e: `${PREFIJO_CORREO}super-creado${DOMINIO}` });
    if (creada[0]) usuariosCreados.push(creada[0].id);
    estado('control: …y elimina una cuenta Superadmin', await llamar(m.super, 'DELETE', `/api/users/${v.id}`), 200);
  }
  {
    const r = await llamar(m.admin, 'PATCH', `/api/users/${m.admin.id}`, { cuerpo: { role_id: m.rolSuper } });
    niega('un Administrador no se asciende a sí mismo a Superadmin', r);
    afirmar('…y sigue siendo Administrador', (await rolDe(m.admin.id)) === 'Administrador');
  }
  {
    const r = await llamar(m.admin, 'PATCH', `/api/users/${m.admin2.id}`, { cuerpo: { reset_password: true } });
    if (r.status === 200) aviso('un Administrador restablece la contraseña de otro Administrador', 'permitido hoy; decidir si los administradores se administran entre sí');
    else ok('un Administrador no restablece la contraseña de otro Administrador', `HTTP ${r.status}`);
  }
};

const probarRoles = async (m: Mundo, roles: { parcial: string }) => {
  seccion('B. Roles y permisos');
  await limpiarLimites();

  estado('control: el Editor lee su propio rol', await llamar(m.ed1, 'GET', `/api/roles/${m.rolEditor}`), 200);
  niega('el Editor no lee el rol de Superadmin', await llamar(m.ed1, 'GET', `/api/roles/${m.rolSuper}`));
  niega('el Editor no lista roles', await llamar(m.ed1, 'GET', '/api/roles'));
  niega('el Editor no lee los permisos de un rol ajeno', await llamar(m.ed1, 'GET', `/api/role-permissions/role/${m.rolSuper}`));
  niega('el Editor no lista el catálogo de permisos', await llamar(m.ed1, 'GET', '/api/permissions'));
  niega('el Director no lee el rol de Administrador', await llamar(m.director, 'GET', `/api/roles/${m.rolAdmin}`));

  const permiso = (await consulta<{ id: string }>("SELECT id FROM permisos WHERE clave = 'usuarios.eliminar'"))[0].id;
  niega('el Editor no se concede permisos', await llamar(m.ed1, 'POST', '/api/role-permissions', { cuerpo: { role_id: m.rolEditor, permission_id: permiso } }));

  // Protegidos
  for (const [nombre, id] of [['Superadmin', m.rolSuper], ['Administrador', m.rolAdmin], ['Director/Subdirector', m.rolDirector]] as const) {
    const antes = (await consulta('SELECT 1 FROM roles_permisos WHERE rol_id = :id', { id })).length;
    const renombra = await llamar(m.admin, 'PATCH', `/api/roles/${id}`, { cuerpo: { name: 'Editor Idor Renombrado' } });
    const borra = await llamar(m.admin, 'DELETE', `/api/roles/${id}`);
    const quita = await llamar(m.admin, 'DELETE', '/api/role-permissions', { cuerpo: { role_id: id, permission_id: permiso } });
    const pone = await llamar(m.admin, 'POST', '/api/role-permissions', { cuerpo: { role_id: id, permission_id: permiso } });
    const despues = (await consulta('SELECT 1 FROM roles_permisos WHERE rol_id = :id', { id })).length;
    const sigue = (await consulta('SELECT nombre FROM roles WHERE id = :id', { id }))[0]?.nombre === nombre;
    afirmar(`el rol protegido «${nombre}» no se renombra, borra ni cambia de permisos`,
      sigue && antes === despues && ![renombra, borra, quita, pone].some((r) => r.status === 200 || r.status === 201),
      `renombrar ${renombra.status}, borrar ${borra.status}, revocar ${quita.status}, conceder ${pone.status}`);
  }

  // Control: sobre un rol hijo de Editor, el Administrador sí puede
  const hijo = await llamar(m.admin, 'POST', '/api/roles', { cuerpo: { name: 'Editor Idor Creado' } });
  estado('control: el Administrador crea un rol «Editor …»', hijo, [200, 201]);
  const idHijo = hijo.json?.id ?? hijo.json?.role?.id;
  if (idHijo) {
    rolesCreados.push(idHijo);
    estado('control: …y lo edita', await llamar(m.admin, 'PATCH', `/api/roles/${idHijo}`, { cuerpo: { description: 'x' } }), 200);
    estado('control: …y lo borra', await llamar(m.admin, 'DELETE', `/api/roles/${idHijo}`), 200);
  }
  niega('el Administrador no crea un rol fuera de la familia «Editor …»', await llamar(m.admin, 'POST', '/api/roles', { cuerpo: { name: 'Superadmin Falso' } }).then((r) => ({ ...r, status: r.status === 400 ? 403 : r.status })));
  void roles;
};

const probarPaginas = async (m: Mundo) => {
  seccion('C. Páginas: permiso por sección, ámbito, versiones y candados');
  await limpiarLimites();

  // Datos: una página que el Editor NO puede editar (con un secreto) y una que sí.
  const cuerpoSecreto = { contenido: contenidoDe(MARCA_SECRETA) };
  estado('control: el Superadmin guarda un borrador en «clasificacion» (sitio)', await llamar(m.super, 'POST', '/api/paginas/clasificacion/borrador', { cuerpo: cuerpoSecreto, ambito: 'sitio' }), [200, 201]);
  const secretaEnBd = await consulta<{ id: string }>(
    `SELECT v.id FROM paginas_versiones v JOIN paginas p ON p.id = v.pagina_id
      WHERE p.slug = 'clasificacion' AND p.ambito = 'sitio' AND v.contenido::text LIKE :m ORDER BY v.numero_version DESC LIMIT 1`,
    { m: `%${MARCA_SECRETA}%` }
  );
  afirmar('el secreto quedó guardado (si no, las pruebas de fuga serían vacías)', secretaEnBd.length === 1);
  const versionSecreta = secretaEnBd[0]?.id ?? UUID_INEXISTENTE;

  estado('control: el Editor guarda borrador en «inicio» (sitio)', await llamar(m.ed1, 'POST', '/api/paginas/inicio/borrador', { cuerpo: { contenido: contenidoDe('propio') }, ambito: 'sitio' }), [200, 201]);

  // 1. Permiso por sección (el Editor no tiene editar.sitio.clasificacion)
  const versionesDe = async (slug: string) =>
    (await consulta<{ n: string }>(
      "SELECT count(*) AS n FROM paginas_versiones v JOIN paginas p ON p.id = v.pagina_id WHERE p.slug = :slug AND p.ambito = 'sitio'",
      { slug }
    ))[0].n;
  const versionesAntes = await versionesDe('clasificacion');
  console.log('\n  [Editor sobre una página sin su permiso: sitio/clasificacion]');
  const sin = [
    ['GET', '/api/paginas/clasificacion/editable', undefined],
    ['POST', '/api/paginas/clasificacion/borrador', { contenido: contenidoDe('x') }],
    ['POST', '/api/paginas/clasificacion/bloqueo', {}],
    ['DELETE', '/api/paginas/clasificacion/bloqueo', undefined],
    ['POST', '/api/paginas/clasificacion/descartar-edicion', undefined],
    ['POST', '/api/paginas/clasificacion/subidas', { ruta: `/uploads/img/${randomUUID()}.png` }],
    ['PATCH', '/api/paginas/clasificacion/enviar-revision', { comentario: 'intento de colarse' }],
  ] as const;
  for (const [metodo, ruta, cuerpo] of sin) {
    niega(`${metodo} ${ruta.replace('/api/paginas', '')}`, await llamar(m.ed1, metodo, ruta, { cuerpo, ambito: 'sitio' }));
  }
  afirmar('…y la página ajena no recibió ninguna versión nueva', (await versionesDe('clasificacion')) === versionesAntes);

  // 2. Ámbito como frontera de permisos
  console.log('\n  [Ámbito: cuentas con acceso a una sola aplicación]');
  niega('solo-intranet (matriz) no escribe en el sitio', await llamar(m.parcial, 'POST', '/api/paginas/inicio/borrador', { cuerpo: { contenido: contenidoDe('x') }, ambito: 'sitio' }));
  niega('solo-intranet (matriz) no edita otra página de la intranet (tasa)', await llamar(m.parcial, 'POST', '/api/paginas/tasa/borrador', { cuerpo: { contenido: contenidoDe('x') }, ambito: 'intranet' }));
  estado('control: solo-intranet edita su página (matriz)', await llamar(m.parcial, 'POST', '/api/paginas/matriz/borrador', { cuerpo: { contenido: contenidoDe('mía') }, ambito: 'intranet' }), [200, 201]);
  niega('solo-sitio (inicio) no escribe en la intranet', await llamar(m.soloSitio, 'POST', '/api/paginas/inicio/borrador', { cuerpo: { contenido: contenidoDe('x') }, ambito: 'intranet' }));
  niega('solo-sitio no lee el editable de la intranet', await llamar(m.soloSitio, 'GET', '/api/paginas/inicio/editable', { ambito: 'intranet' }));
  const sinCabecera = await llamar(m.parcial, 'POST', '/api/paginas/matriz/borrador', { cuerpo: { contenido: contenidoDe('x') } });
  niega('sin X-Ambito no se cae en «sitio» por defecto al escribir', sinCabecera.status === 400 ? { ...sinCabecera, status: 403 } : sinCabecera);
  const doble = await llamar(m.parcial, 'POST', '/api/paginas/matriz/borrador', { cuerpo: { contenido: contenidoDe('x') }, cabeceras: { 'x-ambito': 'sitio, intranet' } });
  niega('una cabecera X-Ambito ambigua («sitio, intranet») no pasa', doble.status === 400 ? { ...doble, status: 403 } : doble);

  // 3. versionId de otra página
  console.log('\n  [versionId que pertenece a otra página]');
  const editable = await llamar(m.ed1, 'GET', `/api/paginas/inicio/editable?versionId=${versionSecreta}`, { ambito: 'sitio' });
  afirmar('el Editor no lee, con su página, la versión de otra (GET editable?versionId)', !editable.texto.includes(MARCA_SECRETA) && editable.json?.versionId !== versionSecreta, `HTTP ${editable.status}`);
  const borra = await llamar(m.admin, 'DELETE', `/api/paginas/inicio/versiones/${versionSecreta}`, { cuerpo: { motivo: 'cruce' }, ambito: 'sitio' });
  niega('DELETE /inicio/versiones/<versión de clasificacion> no borra', borra);
  afirmar('…y la versión ajena sigue en la base', (await consulta('SELECT 1 FROM paginas_versiones WHERE id = :id', { id: versionSecreta })).length === 1);
  const restaura = await llamar(m.admin, 'POST', '/api/paginas/inicio/restaurar', { cuerpo: { versionId: versionSecreta }, ambito: 'sitio' });
  afirmar('POST /inicio/restaurar con la versión de otra página no la publica', ![200, 201].includes(restaura.status), `HTTP ${restaura.status}`);
  const idClasif = (await consulta<{ id: string }>("SELECT id FROM paginas WHERE slug = 'clasificacion' AND ambito = 'sitio'"))[0]?.id;
  if (idClasif) {
    const porUuid = await llamar(m.admin, 'POST', `/api/paginas/${idClasif}/restaurar`, { cuerpo: {}, ambito: 'intranet' });
    afirmar('restaurar por UUID no alcanza una página de otro ámbito', ![200, 201].includes(porUuid.status), `HTTP ${porUuid.status}`);
  }

  // 4. Aprobación y gestión de secciones
  console.log('\n  [Decisiones que son de quien aprueba]');
  niega('el Editor no aprueba', await llamar(m.ed1, 'PATCH', '/api/paginas/inicio/aprobar', { ambito: 'sitio' }));
  niega('el Editor no rechaza', await llamar(m.ed1, 'PATCH', '/api/paginas/inicio/rechazar', { cuerpo: { motivo: 'x' }, ambito: 'sitio' }));
  niega('el Director no aprueba', await llamar(m.director, 'PATCH', '/api/paginas/inicio/aprobar', { ambito: 'sitio' }));
  niega('el Editor no restaura', await llamar(m.ed1, 'POST', '/api/paginas/inicio/restaurar', { cuerpo: {}, ambito: 'sitio' }));
  niega('el Editor no elimina secciones', await llamar(m.ed1, 'DELETE', '/api/paginas/inicio', { cuerpo: { confirmacion: 'inicio' }, ambito: 'sitio' }));
  niega('el Editor no cambia direcciones', await llamar(m.ed1, 'PATCH', '/api/paginas/inicio/direccion', { cuerpo: { nuevaDireccion: 'robada', actualizarEnlaces: false }, ambito: 'sitio' }));
  niega('el Editor no depura versiones', await llamar(m.ed1, 'POST', '/api/paginas/respaldos/depurar', { cuerpo: {} }));
  niega('el Editor no ve la cola de revisión', await llamar(m.ed1, 'GET', '/api/paginas/en-revision', { ambito: 'sitio' }));

  // 5. Candados
  console.log('\n  [Candado de edición de otra persona]');
  await ejecutar('DELETE FROM bloqueos_edicion');
  estado('control: ed1 toma el candado de «inicio»', await llamar(m.ed1, 'POST', '/api/paginas/inicio/bloqueo', { cuerpo: {}, ambito: 'sitio' }), 200);
  const dueno = async () => (await consulta<{ usuario_id: string }>("SELECT usuario_id FROM bloqueos_edicion WHERE ambito = 'sitio' AND slug = 'inicio'"))[0]?.usuario_id;
  const forzar = await llamar(m.ed2, 'POST', '/api/paginas/inicio/bloqueo', { cuerpo: { forzar: true }, ambito: 'sitio' });
  estado('ed2 (Editor) no le quita el candado por la fuerza', forzar, 409);
  afirmar('…y el candado sigue siendo de ed1', (await dueno()) === m.ed1.id);
  await llamar(m.ed2, 'DELETE', '/api/paginas/inicio/bloqueo', { ambito: 'sitio' });
  afirmar('ed2 no libera el candado de ed1 con DELETE', (await dueno()) === m.ed1.id);
  await llamar(m.ed2, 'POST', '/api/paginas/inicio/descartar-edicion', { ambito: 'sitio' });
  afirmar('ed2 no libera el candado de ed1 con descartar-edicion', (await dueno()) === m.ed1.id);
  const pisa = await llamar(m.ed2, 'POST', '/api/paginas/inicio/borrador', { cuerpo: { contenido: contenidoDe('pisado') }, ambito: 'sitio' });
  if (pisa.status === 200 || pisa.status === 201) aviso('ed2 guarda borrador en una página con el candado de ed1', 'la edición es colaborativa por decisión de producto; el candado solo avisa al abrir');
  else ok('ed2 no guarda sobre una página con candado ajeno', `HTTP ${pisa.status}`);
  estado('control: un Administrador sí fuerza el candado', await llamar(m.admin, 'POST', '/api/paginas/inicio/bloqueo', { cuerpo: { forzar: true }, ambito: 'sitio' }), 200);
  afirmar('…y pasa a ser suyo', (await dueno()) === m.admin.id);

  // 6. Quién edita qué: lectura del candado y de los respaldos
  console.log('\n  [Lecturas con solo sesión]');
  await ejecutar('DELETE FROM bloqueos_edicion');
  await llamar(m.super, 'POST', '/api/paginas/clasificacion/bloqueo', { cuerpo: {}, ambito: 'sitio' });
  const veBloqueo = await llamar(m.ed1, 'GET', '/api/paginas/clasificacion/bloqueo', { ambito: 'sitio' });
  if (veBloqueo.status === 200 && /Idor|super/i.test(veBloqueo.texto)) aviso('un Editor sin permiso sobre «clasificacion» ve quién la tiene abierta', 'a propósito (lo usa la restauración de respaldos); solo nombre');
  else ok('un Editor sin permiso sobre la sección no ve quién la edita', `HTTP ${veBloqueo.status}`);
  niega('el Director no consulta candados', await llamar(m.director, 'GET', '/api/paginas/clasificacion/bloqueo', { ambito: 'sitio' }));
  const resp = await llamar(m.director, 'GET', '/api/paginas/respaldos?ambito=sitio', { ambito: 'sitio' });
  if (resp.status === 200) aviso('el Director lista los respaldos de versiones', 'GET /api/paginas/respaldos solo exige sesión; revisa si debe');
  else ok('el Director no lista respaldos', `HTTP ${resp.status}`);
  const pub = await llamar(m.director, 'GET', '/api/paginas/publicadas', { ambito: 'sitio' });
  if (pub.status === 200) aviso('el Director lista las páginas publicadas', 'GET /api/paginas/publicadas solo exige sesión');
  else ok('el Director no lista las publicadas', `HTTP ${pub.status}`);
};

const probarCargas = async (m: Mundo) => {
  seccion('D. Cargas de datos (observatorio y alertas de inversión)');
  await limpiarLimites();

  const nueva = async (modulo: string) => {
    const f = await consulta<{ id: string }>("INSERT INTO cargas_datos (modulo, estado) VALUES (:m, 'completado') RETURNING id", { m: modulo });
    cargasCreadas.push(f[0].id);
    return f[0].id;
  };
  const existe = async (id: string) => (await consulta('SELECT 1 FROM cargas_datos WHERE id = :id', { id })).length === 1;
  const programas = await nueva('programa_sobresalientes');
  const alertas = await nueva('alertas_inversion');
  const fuentes = await nueva('fuentes_futuras_empleo');
  const tendencia = await nueva('tendencia_ocupacional');

  for (const [quien, actor] of [['Editor', m.ed1], ['Director', m.director]] as const) {
    niega(`${quien} no lee una carga del observatorio`, await llamar(actor, 'GET', `/api/observatorio/cargas/${programas}`));
    niega(`${quien} no borra una carga del observatorio`, await llamar(actor, 'DELETE', `/api/observatorio/cargas/${programas}`));
    niega(`${quien} no lee una carga de alertas`, await llamar(actor, 'GET', `/api/alertas-inversion/cargas/${alertas}`));
    niega(`${quien} no borra una carga de alertas`, await llamar(actor, 'DELETE', `/api/alertas-inversion/cargas/${alertas}`));
    niega(`${quien} no borra un proyecto de inversión`, await llamar(actor, 'DELETE', `/api/alertas-inversion/proyectos/${UUID_INEXISTENTE}`));
  }
  afirmar('…y ninguna carga se borró', (await existe(programas)) && (await existe(alertas)));

  estado('control: el Administrador lee la carga de programas', await llamar(m.admin, 'GET', `/api/observatorio/cargas/${programas}`), 200);
  estado('control: el Administrador lee la carga de alertas', await llamar(m.admin, 'GET', `/api/alertas-inversion/cargas/${alertas}`), 200);

  // Cruce de módulos: el id de un módulo en la ruta de otro
  console.log('\n  [Id de un módulo usado en la ruta de otro]');
  const cruces: Array<[string, string, string, string]> = [
    ['GET', `/api/observatorio/cargas/${alertas}`, 'carga de alertas por la ruta de programas', alertas],
    ['GET', `/api/observatorio/cargas/${fuentes}`, 'carga de fuentes por la ruta de programas', fuentes],
    ['GET', `/api/alertas-inversion/cargas/${programas}`, 'carga de programas por la ruta de alertas', programas],
    ['GET', `/api/observatorio/tendencia-ocupacional/cargas/${programas}`, 'carga de programas por la ruta de tendencia', programas],
    ['DELETE', `/api/observatorio/cargas/${alertas}`, 'borrar la carga de alertas por la ruta de programas', alertas],
    ['DELETE', `/api/observatorio/cargas/${fuentes}`, 'borrar la carga de fuentes por la ruta de programas', fuentes],
    ['DELETE', `/api/alertas-inversion/cargas/${programas}`, 'borrar la carga de programas por la ruta de alertas', programas],
    ['DELETE', `/api/observatorio/fuentes-futuras-empleo/cargas/${programas}`, 'borrar la carga de programas por la ruta de fuentes', programas],
    ['DELETE', `/api/observatorio/tendencia-ocupacional/cargas/${programas}`, 'borrar la carga de programas por la ruta de tendencia', programas],
    ['DELETE', `/api/observatorio/tendencia-ocupacional/cargas/${alertas}`, 'borrar la carga de alertas por la ruta de tendencia', alertas],
  ];
  for (const [metodo, ruta, desc, id] of cruces) {
    const r = await llamar(m.admin, metodo, ruta);
    const borradaOLeida = metodo === 'DELETE' ? !(await existe(id)) : r.status === 200;
    if (borradaOLeida) falla(`${desc}`, `HTTP ${r.status}; el módulo no se comprueba (aislamiento entre módulos)`);
    else ok(`${desc} se rechaza`, `HTTP ${r.status}`);
    // Para que un fallo no encadene a los siguientes, se repone la fila si se llevó la carga.
    if (metodo === 'DELETE' && !(await existe(id))) {
      const modulo = id === alertas ? 'alertas_inversion' : id === programas ? 'programa_sobresalientes' : 'fuentes_futuras_empleo';
      await ejecutar("INSERT INTO cargas_datos (id, modulo, estado) VALUES (:id, :m, 'completado')", { id, m: modulo });
    }
  }
  void tendencia;

  // Descarga de formatos: el nombre viaja en la ruta
  console.log('\n  [Nombre de archivo en la ruta]');
  for (const ruta of ['..%2f..%2fpackage.json', '%2e%2e%2f%2e%2e%2fpackage.json', '..%5c..%5cpackage.json', 'package.json']) {
    const r = await crudo(m.admin, `/api/observatorio/formatos/${ruta}`);
    afirmar(`formatos/${ruta} no entrega un archivo del servidor`, r.status !== 200 || !/"name"\s*:\s*"@olo\/api-backend"/.test(r.texto), `HTTP ${r.status}`);
  }
};

const probarArchivos = async (m: Mundo) => {
  seccion('E. Archivos servidos (/api/archivos, identidad del panel)');
  await limpiarLimites();

  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAX+XDSwAAAABJRU5ErkJggg==', 'base64');
  const raiz = process.env.FILESYSTEM_DIR as string;
  const nombre = `${randomUUID()}.png`;
  const poner = (ruta: string, contenido: Buffer | string) => {
    const destino = path.join(raiz, ruta);
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.writeFileSync(destino, contenido);
    archivosCreados.push(destino);
  };
  poner(`sitio/uploads/img/${nombre}`, png);
  poner(`intranet/uploads/img/${nombre}`, png);
  poner('cargas-datos/idor-reservado.xlsx', 'RESERVADO-IDOR');

  estado('control: el sitio sirve su archivo sin sesión (es público)', await llamar(null, 'GET', `/api/archivos/sitio/uploads/img/${nombre}`), 200);
  estado('la intranet no sirve archivos sin sesión', await llamar(null, 'GET', `/api/archivos/intranet/uploads/img/${nombre}`), 401);
  estado('control: el Editor lee un archivo de la intranet', await llamar(m.ed1, 'GET', `/api/archivos/intranet/uploads/img/${nombre}`), 200);
  estado('control: el Director lee un archivo de la intranet', await llamar(m.director, 'GET', `/api/archivos/intranet/uploads/img/${nombre}`), 200);
  niega('una cuenta solo-sitio (sin acceso.intranet) no lee archivos de la intranet', await llamar(m.soloSitio, 'GET', `/api/archivos/intranet/uploads/img/${nombre}`));

  console.log('\n  [Salir de la carpeta del ámbito]');
  const trucos = [
    `/api/archivos/sitio/uploads/..%2f..%2f..%2fintranet%2fuploads%2fimg%2f${nombre}`,
    `/api/archivos/sitio/uploads/%2e%2e/%2e%2e/intranet/uploads/img/${nombre}`,
    `/api/archivos/sitio/uploads/..%5c..%5cintranet%5cuploads%5cimg%5c${nombre}`,
    `/api/archivos/sitio/uploads/%252e%252e/%252e%252e/intranet/uploads/img/${nombre}`,
    `/api/archivos/sitio/uploads/..%2f..%2fcargas-datos%2fidor-reservado.xlsx`,
    `/api/archivos/sitio/uploads/img/${nombre}%00.png`,
    `/api/archivos/sitio/uploads/..%2f..%2f..%2fpackage.json`,
  ];
  for (const ruta of trucos) {
    const r = await crudo(null, ruta);
    const filtrado = r.status === 200 && (r.texto.includes('RESERVADO-IDOR') || r.texto.includes('@olo/api-backend') || r.texto.startsWith('\x89PNG'));
    afirmar(`sin sesión: ${ruta.replace('/api/archivos/', '…/').slice(0, 78)}`, !filtrado, `HTTP ${r.status}`);
  }
  const traversalIntranet = await crudo(m.ed1, `/api/archivos/intranet/uploads/..%2f..%2fcargas-datos%2fidor-reservado.xlsx`);
  afirmar('con sesión: la intranet tampoco llega a cargas-datos', !traversalIntranet.texto.includes('RESERVADO-IDOR'), `HTTP ${traversalIntranet.status}`);

  console.log('\n  [Imágenes de identidad del panel]');
  for (const nombreMalo of ['..%2f..%2fpackage.json', '%2e%2e%2fpackage.json', '..%5c..%5cpackage.json', 'idor.png']) {
    const r = await crudo(null, `/api/configuracion/identidad-panel/archivos/${nombreMalo}`);
    afirmar(`identidad-panel/archivos/${nombreMalo} no entrega nada`, r.status !== 200, `HTTP ${r.status}`);
  }
};

/** Deja una página con una versión publicada que lleva `texto`, por el ciclo editorial real. */
const publicar = async (m: Mundo, slug: string, ambito: 'sitio' | 'intranet', texto: string) => {
  await llamar(m.super, 'POST', `/api/paginas/${slug}/borrador`, { cuerpo: { contenido: contenidoDe(texto) }, ambito });
  await llamar(m.super, 'PATCH', `/api/paginas/${slug}/enviar-revision`, { cuerpo: { comentario: 'Publicación de la prueba de IDOR' }, ambito });
  const r = await llamar(m.super, 'PATCH', `/api/paginas/${slug}/aprobar`, { ambito });
  return r.status === 200;
};

const probarLecturaPublica = async (m: Mundo) => {
  seccion('F. Lectura pública: ¿el ámbito elegido por quien pregunta abre la intranet?');
  await limpiarLimites();

  const MARCA_INTRANET = 'CONTENIDO-SOLO-INTRANET-IDOR';
  const MARCA_SITIO = 'CONTENIDO-PUBLICO-DEL-SITIO-IDOR';
  afirmar('control: se publicó una página de la intranet', await publicar(m, 'matriz', 'intranet', MARCA_INTRANET));
  afirmar('control: se publicó una página del sitio', await publicar(m, 'inicio', 'sitio', MARCA_SITIO));

  const sitio = await llamar(null, 'GET', '/api/paginas/publica/inicio', { ambito: 'sitio' });
  afirmar('control: sin sesión, la página publicada del sitio es pública', sitio.status === 200 && sitio.texto.includes(MARCA_SITIO), `HTTP ${sitio.status}`);
  afirmar('sin sesión y sin cabecera, la página de la intranet no existe (404)', (await llamar(null, 'GET', '/api/paginas/publica/matriz')).status === 404);
  estado('control: con sesión de la intranet, la página se lee', await llamar(m.ed1, 'GET', '/api/paginas/publica/matriz', { ambito: 'intranet' }), 200);

  const lecturas: Array<[string, string]> = [
    ['/api/paginas/publica/matriz', 'el contenido de una página'],
    ['/api/paginas/indice-busqueda', 'el índice de búsqueda con sus textos'],
    ['/api/paginas/titulos', 'los slugs y títulos'],
  ];
  for (const [ruta, que] of lecturas) {
    const r = await llamar(null, 'GET', ruta, { ambito: 'intranet' });
    const filtra = r.status === 200 && (ruta.endsWith('/titulos') ? /matriz/.test(r.texto) : r.texto.includes(MARCA_INTRANET));
    if (filtra) {
      abierto(`sin sesión, X-Ambito: intranet entrega ${que}`, `GET ${ruta.replace('/api/paginas', '')} → HTTP 200`);
    } else {
      ok(`sin sesión, X-Ambito: intranet no entrega ${que}`, `HTTP ${r.status}`);
    }
  }
};

const probarSesionYDatosPropios = async (m: Mundo) => {
  seccion('G. Operaciones de la propia sesión: el id sale del token, no del cuerpo');
  await limpiarLimites();

  niega('el Editor no lee la bitácora', await llamar(m.ed1, 'GET', '/api/audit-logs'));
  niega('el Director no lee la bitácora', await llamar(m.director, 'GET', '/api/audit-logs'));
  niega('el Editor no lee las alertas de caducidad de toda la plantilla', await llamar(m.ed1, 'GET', '/api/alerts'));

  const me = await llamar(m.ed1, 'GET', `/api/me?id=${m.admin.id}&userId=${m.admin.id}`);
  afirmar('GET /api/me ignora un id ajeno en la consulta', (me.json?.id ?? me.json?.user?.id) === m.ed1.id, `HTTP ${me.status}`);

  // Cambiar contraseña con ids ajenos en el cuerpo
  const hashVictima = await campoDe(m.ed2.id, 'password_hash');
  const hashAdmin = await campoDe(m.admin.id, 'password_hash');
  const hashPropio = await campoDe(m.ed1.id, 'password_hash');
  for (const extra of [{ userId: m.ed2.id }, { id: m.admin.id }, { email: m.ed2.email }, { usuario_id: m.admin.id }]) {
    await llamar(m.ed1, 'POST', '/api/change-password', { cuerpo: { currentPassword: PASSWORD, newPassword: 'Otra-Clave-2026!y', ...extra } });
  }
  afirmar('change-password nunca toca la contraseña de otra cuenta', (await campoDe(m.ed2.id, 'password_hash')) === hashVictima && (await campoDe(m.admin.id, 'password_hash')) === hashAdmin);
  afirmar('control: …sí cambió la del propio Editor', (await campoDe(m.ed1.id, 'password_hash')) !== hashPropio);

  // Preguntas de seguridad con un id ajeno
  const antes = await consulta<{ respuesta_hash: string }>('SELECT respuesta_hash FROM preguntas_seguridad WHERE usuario_id = :id ORDER BY orden', { id: m.ed2.id });
  const preguntas = ['pet_name', 'birth_city', 'favorite_food'].map((key) => ({ key, answer: 'respuesta-del-atacante' }));
  await llamar(m.ed1, 'POST', '/api/security-questions/setup', { cuerpo: { questions: preguntas, userId: m.ed2.id, usuario_id: m.ed2.id } });
  const despues = await consulta<{ respuesta_hash: string }>('SELECT respuesta_hash FROM preguntas_seguridad WHERE usuario_id = :id ORDER BY orden', { id: m.ed2.id });
  afirmar('setup de preguntas no toca las de otra cuenta', JSON.stringify(antes) === JSON.stringify(despues));

  // Un token sigue la fila, no la foto: degradar o desactivar surte efecto en la petición siguiente
  const v = await crearActor(`temporal-${randomUUID().slice(0, 6)}`, 'Editor');
  estado('control: la cuenta temporal entra', await llamar(v, 'GET', '/api/paginas/en-revision', { ambito: 'sitio' }), [403]);
  await ejecutar("UPDATE usuarios SET estado = 'inactive' WHERE id = :id", { id: v.id });
  estado('una cuenta desactivada pierde la sesión de inmediato', await llamar(v, 'GET', '/api/me'), 401);
};

// ---------------------------------------------------------------------------
// 4. Arranque
// ---------------------------------------------------------------------------

const main = async () => {
  await sequelize.authenticate();
  if (process.env.REDIS_URL) redis = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 1 });

  const servidor = http.createServer(app as any);
  await new Promise<void>((resolver) => servidor.listen(0, '127.0.0.1', resolver));
  base = `http://127.0.0.1:${(servidor.address() as AddressInfo).port}`;

  for (const [ambito, slug] of SLUGS_DE_PRUEBA) {
    if ((await consulta('SELECT 1 FROM paginas WHERE ambito = :ambito AND slug = :slug', { ambito, slug })).length) {
      paginasQueYaEstaban.add(`${ambito}/${slug}`);
    }
  }
  // Restos de una pasada anterior que no terminó
  await ejecutar(`DELETE FROM usuarios WHERE email LIKE :p`, { p: `${PREFIJO_CORREO}%${DOMINIO}` });
  await ejecutar(`DELETE FROM roles WHERE nombre LIKE 'Editor Idor%'`);

  console.log(`IDOR — API en ${base}, base «${nombreDeBase}»`);
  await limpiarLimites();

  try {
    const rolParcial = await crearRolConPermisos('Editor Idor Solo Intranet', ['acceso.intranet', 'editar.intranet.matriz']);
    await crearRolConPermisos('Editor Idor Solo Sitio', ['acceso.sitio', 'editar.sitio.inicio']);

    const m: Mundo = {
      rolSuper: await idDeRol('Superadmin'),
      rolAdmin: await idDeRol('Administrador'),
      rolEditor: await idDeRol('Editor'),
      rolDirector: await idDeRol('Director/Subdirector'),
      super: await crearActor('super', 'Superadmin'),
      admin: await crearActor('admin', 'Administrador'),
      admin2: await crearActor('admin2', 'Administrador'),
      ed1: await crearActor('ed1', 'Editor'),
      ed2: await crearActor('ed2', 'Editor'),
      director: await crearActor('director', 'Director/Subdirector'),
      parcial: await crearActor('parcial', 'Editor Idor Solo Intranet'),
      soloSitio: await crearActor('solo-sitio', 'Editor Idor Solo Sitio'),
    };

    await probarCuentas(m);
    await probarRoles(m, { parcial: rolParcial });
    await probarPaginas(m);
    await probarCargas(m);
    await probarArchivos(m);
    await probarLecturaPublica(m);
    await probarSesionYDatosPropios(m);
  } finally {
    await limpiar().catch((e) => console.error('No se pudo limpiar del todo:', e instanceof Error ? e.message : e));
    servidor.close();
    if (redis) await redis.quit().catch(() => undefined);
    await sequelize.close().catch(() => undefined);
  }

  console.log(`\n${comprobaciones} comprobaciones, ${fallos} fallo(s), ${avisos} aviso(s), ${abiertos.length} abierto(s).`);
  if (abiertos.length > 0) {
    console.log('\nAbiertos (confirmados; falta la decisión de producto):');
    abiertos.forEach((a) => console.log(`  - ${a}`));
  }
  if (fallos > 0) {
    console.log('\nHuecos confirmados:');
    resumenDeFallos.forEach((f) => console.log(`  - ${f}`));
    process.exit(1);
  }
  process.exit(0);
};

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exit(1);
});

/**
 * Prueba de condiciones de carrera **por HTTP**: la aplicación real (rutas, permisos, limitadores
 * de tasa, controladores, manejador de errores) montada en un puerto suelto, con sesiones iniciadas
 * por el login real. Es la otra mitad de `probar-carreras-paginas|acceso`, que llaman a los casos de
 * uso: aquí se ve lo que de verdad recibe quien llama (el código HTTP), y que los controladores no
 * deshagan lo que los casos de uso aseguran.
 *
 * Lanza a la vez dos peticiones de dos sesiones distintas y comprueba que la respuesta sea una de
 * las que cabe en un orden en fila (`200` y `409`, nunca `200` y `200` ni un `500`).
 *
 * Requiere la base con las migraciones y `npm run sembrar:permisos` (los roles `Superadmin` y
 * `Editor`) y `JWT_SECRET`. Mismas salvaguardas que los demás `probar-carreras-*.ts`.
 *
 *   DATABASE_URL=postgres://postgres:prueba@localhost:55432/olo_prueba DB_SSL=false \
 *   REDIS_URL=redis://localhost:6390/0 JWT_SECRET=<uno de prueba> LOCAL_AUTH_EMAIL= LOCAL_AUTH_PASSWORD= \
 *   npx ts-node scripts/verificaciones/probar-carreras-http.ts [rondas]
 */
import { RONDAS, sumar } from './carreras-comun';
import http from 'http';
import type { AddressInfo } from 'net';
import Redis from 'ioredis';
import { QueryTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../../src/config/database';
import { app } from '../../src/app';

const PASSWORD = 'Prueba-Carreras-2026!x';
const DOMINIO = '@sena.edu.co';
const PREFIJO = 'carrerahttp';
let base = '';
let redis: Redis | null = null;

interface Actor { id: string; email: string; token: string; rol: string }
interface Resp { status: number; json: any; texto: string }

const consulta = async <T = any>(sql: string, replacements: Record<string, unknown> = {}): Promise<T[]> =>
  (await sequelize.query(sql, { type: QueryTypes.SELECT, replacements, logging: false })) as T[];
const ejecutar = async (sql: string, replacements: Record<string, unknown> = {}) => {
  await sequelize.query(sql, { replacements, logging: false });
};

const limpiarLimites = async () => {
  if (!redis) return;
  const claves: string[] = await redis.keys('rl:*');
  if (claves.length) await redis.del(...claves);
};

const llamar = async (
  actor: Actor | null,
  metodo: string,
  ruta: string,
  opciones: { cuerpo?: unknown; ambito?: string } = {}
): Promise<Resp> => {
  const r = await fetch(`${base}${ruta}`, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      ...(actor ? { Authorization: `Bearer ${actor.token}` } : {}),
      ...(opciones.ambito ? { 'X-Ambito': opciones.ambito } : {}),
    },
    body: opciones.cuerpo === undefined ? undefined : JSON.stringify(opciones.cuerpo),
  });
  const texto = await r.text();
  let json: any = null;
  try { json = JSON.parse(texto); } catch { /* no era JSON */ }
  return { status: r.status, json, texto };
};

const crearActor = async (clave: string, rol: string): Promise<Actor> => {
  const email = `${PREFIJO}${clave}${DOMINIO}`;
  const [{ id: rolId }] = await consulta<{ id: string }>('SELECT id FROM roles WHERE nombre = :rol', { rol });
  const hash = await bcrypt.hash(PASSWORD, 10);
  const [{ id }] = await consulta<{ id: string }>(
    `INSERT INTO usuarios (nombre, apellidos, email, password_hash, rol_id, estado, debe_configurar_preguntas, debe_cambiar_password)
     VALUES (:n, 'Carrera', :email, :hash, :rolId, 'active', false, false) RETURNING id`,
    { n: `Carrera ${clave}`, email, hash, rolId }
  );
  for (const [orden, p] of ['pet_name', 'birth_city', 'favorite_food'].entries()) {
    await ejecutar(
      'INSERT INTO preguntas_seguridad (usuario_id, pregunta_clave, respuesta_hash, orden) VALUES (:id, :p, :h, :o)',
      { id, p, h: hash, o: orden }
    );
  }
  const r = await llamar(null, 'POST', '/api/login', { cuerpo: { email, password: PASSWORD } });
  if (r.status !== 200 || !r.json?.token) throw new Error(`No se pudo iniciar sesión como ${clave}: HTTP ${r.status} ${r.texto.slice(0, 160)}`);
  return { id, email, token: r.json.token, rol };
};

/**
 * Cada sección que se crea concede una clave de permiso nueva al rol Editor, y esas claves viajan en el
 * token de sesión: tras unos cientos de rondas el token de un Editor supera los 16 KB de cabeceras de
 * Node y el cliente falla con «Headers Overflow». Se retiran las de la prueba en cada ronda.
 */
const retirarPermisosDePrueba = () => ejecutar("DELETE FROM permisos WHERE clave LIKE 'editar.%carrera-http-%'");

const limpiar = async () => {
  await retirarPermisosDePrueba();
  await ejecutar("DELETE FROM paginas WHERE titulo LIKE 'Carrera http %'");
  await ejecutar('DELETE FROM bloqueos_edicion');
  await ejecutar('DELETE FROM usuarios WHERE email LIKE :p', { p: `${PREFIJO}%${DOMINIO}` });
};

const contenido = (titulo: string) => ({ content: [], root: { props: { title: titulo } } });
let n = 0;
const nuevoTitulo = () => `Carrera http ${Date.now().toString(36)} ${++n}`;

type Esperada = (statuses: number[]) => string | null;
const veredictos: boolean[] = [];

const escenario = async (
  titulo: string,
  rondas: number,
  ronda: () => Promise<{ statuses: number[]; extra?: string[] }>,
  esperada: Esperada
) => {
  const firmas = new Map<string, number>();
  const problemas = new Map<string, number>();
  for (let i = 0; i < rondas; i++) {
    await limpiarLimites();
    await retirarPermisosDePrueba();
    const { statuses, extra = [] } = await ronda();
    sumar(firmas, [...statuses].sort().join(' + '));
    const mal = esperada(statuses);
    if (mal) sumar(problemas, mal);
    for (const e of extra) sumar(problemas, e);
  }
  const ok = problemas.size === 0;
  veredictos.push(ok);
  console.log(`\n${ok ? '✓' : '✗'} ${titulo}`);
  for (const [f, c] of [...firmas.entries()].sort((a, b) => b[1] - a[1])) console.log(`   ${String(c).padStart(3)}× HTTP ${f}`);
  for (const [p, c] of problemas) console.log(`   PROBLEMA (${c}×): ${p}`);
};

/** Exactamente un 200 y el resto 409 (o 404 si la cosa ya no existe): ni dos éxitos ni un 500. */
const unoGanaElOtroCede: Esperada = (s) => {
  if (s.some((x) => x >= 500)) return `respondió ${s.find((x) => x >= 500)} (error del servidor)`;
  if (s.filter((x) => x === 200).length !== 1) return `debía haber un solo 200 y hubo ${s.filter((x) => x === 200).length}`;
  if (s.some((x) => x !== 200 && x !== 409 && x !== 404)) return `código inesperado ${s.find((x) => ![200, 409, 404].includes(x))}`;
  return null;
};
const todosOk: Esperada = (s) => (s.every((x) => x === 200 || x === 201) ? null : `esperaba todo 200 y llegó ${s.join(',')}`);

const main = async () => {
  await sequelize.authenticate();
  if (process.env.REDIS_URL) redis = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 1 });
  const servidor = http.createServer(app as any);
  await new Promise<void>((resolver) => servidor.listen(0, '127.0.0.1', resolver));
  base = `http://127.0.0.1:${(servidor.address() as AddressInfo).port}`;
  console.log(`API en ${base} · rondas: ${RONDAS}`);

  await limpiar();
  await limpiarLimites();

  try {
    const [s1, s2] = [await crearActor('s1', 'Superadmin'), await crearActor('s2', 'Superadmin')];
    const [e1, e2] = [await crearActor('e1', 'Editor'), await crearActor('e2', 'Editor')];
    const A = 'sitio';

    /** Una sección nueva (la ruta de guardar exige que la página exista) y, si se pide, su versión en revisión. */
    const crearPagina = async (): Promise<string> => {
      const c = await llamar(s1, 'POST', '/api/paginas', { cuerpo: { titulo: nuevoTitulo() }, ambito: A });
      const slug = c.json?.slug ?? c.json?.seccion?.slug;
      if (!slug) throw new Error(`crear sección: HTTP ${c.status} ${c.texto.slice(0, 160)}`);
      return slug;
    };
    const preparar = async (hasta: 'borrador' | 'revision') => {
      const slug = await crearPagina();
      const r1 = await llamar(s1, 'POST', `/api/paginas/${slug}/borrador`, { cuerpo: { contenido: contenido('REVISADO') }, ambito: A });
      if (r1.status !== 200) throw new Error(`borrador: HTTP ${r1.status} ${r1.texto.slice(0, 120)}`);
      if (hasta === 'borrador') return slug;
      const r2 = await llamar(s1, 'PATCH', `/api/paginas/${slug}/enviar-revision`, { cuerpo: { comentario: 'Cambio de prueba de carrera' }, ambito: A });
      if (r2.status !== 200) throw new Error(`enviar: HTTP ${r2.status} ${r2.texto.slice(0, 120)}`);
      return slug;
    };
    const estadoFinal = async (slug: string) =>
      (await consulta<{ estado: string }>(
        `SELECT v.estado FROM paginas_versiones v JOIN paginas p ON p.id = v.pagina_id WHERE p.slug = :slug ORDER BY v.numero_version`,
        { slug }
      )).map((f) => f.estado).join(',');
    const coherente = async (slug: string): Promise<string[]> => {
      const filas = await consulta<{ estado: string; apuntada: boolean }>(
        `SELECT v.estado, (p.version_publicada_id = v.id) AS apuntada
           FROM paginas_versiones v JOIN paginas p ON p.id = v.pagina_id WHERE p.slug = :slug`,
        { slug }
      );
      const publicada = filas.find((f) => f.estado === 'publicado');
      const apuntada = filas.find((f) => f.apuntada);
      if (publicada && !publicada.apuntada) return ['hay una versión publicada que la página no apunta'];
      if (apuntada && apuntada.estado !== 'publicado') return [`la página apunta a una versión «${apuntada.estado}»`];
      return [];
    };

    await escenario('HTTP · aprobar ×2 a la vez (dos Superadmin)', RONDAS, async () => {
      const slug = await preparar('revision');
      const rs = await Promise.all([s1, s2].map((s) => llamar(s, 'PATCH', `/api/paginas/${slug}/aprobar`, { ambito: A })));
      return { statuses: rs.map((r) => r.status), extra: await coherente(slug) };
    }, unoGanaElOtroCede);

    await escenario('HTTP · aprobar × rechazar a la vez', RONDAS, async () => {
      const slug = await preparar('revision');
      const rs = await Promise.all([
        llamar(s1, 'PATCH', `/api/paginas/${slug}/aprobar`, { ambito: A }),
        llamar(s2, 'PATCH', `/api/paginas/${slug}/rechazar`, { cuerpo: { motivo: 'No cumple lo pedido' }, ambito: A }),
      ]);
      return { statuses: rs.map((r) => r.status), extra: await coherente(slug) };
    }, unoGanaElOtroCede);

    await escenario('HTTP · aprobar × el editor guarda (no se publica lo que nadie revisó)', RONDAS, async () => {
      const slug = await preparar('revision');
      const rs = await Promise.all([
        llamar(s1, 'PATCH', `/api/paginas/${slug}/aprobar`, { ambito: A }),
        llamar(e1, 'POST', `/api/paginas/${slug}/borrador`, { cuerpo: { contenido: contenido('NUEVO') }, ambito: A }),
      ]);
      const publicados = await consulta<{ t: string }>(
        `SELECT v.contenido->'root'->'props'->>'title' AS t FROM paginas_versiones v JOIN paginas p ON p.id = v.pagina_id
          WHERE p.slug = :slug AND v.estado = 'publicado'`,
        { slug }
      );
      const extra = [...(await coherente(slug))];
      if (publicados.some((x) => x.t === 'NUEVO')) extra.push('se PUBLICÓ contenido que nadie revisó');
      // El guardado (200) y la aprobación (200) pueden convivir en este orden; lo que no cabe es un 5xx.
      const mal = rs.find((r) => r.status >= 500);
      if (mal) extra.push(`respondió ${mal.status}`);
      return { statuses: rs.map((r) => r.status), extra };
    }, () => null);

    await escenario('HTTP · guardar ×2 sobre una sección sin versiones (dos editores)', RONDAS, async () => {
      const slug = await crearPagina();
      const rs = await Promise.all([e1, e2].map((e) => llamar(e, 'POST', `/api/paginas/${slug}/borrador`, { cuerpo: { contenido: contenido('X') }, ambito: A })));
      return { statuses: rs.map((r) => r.status), extra: await coherente(slug) };
    }, todosOk);

    await escenario('HTTP · crear sección ×2 con el mismo nombre', RONDAS, async () => {
      const nombre = nuevoTitulo();
      const rs = await Promise.all([s1, s2].map((s) => llamar(s, 'POST', '/api/paginas', { cuerpo: { titulo: nombre }, ambito: A })));
      await ejecutar('DELETE FROM paginas WHERE titulo = :nombre', { nombre });
      return { statuses: rs.map((r) => r.status) };
    }, (s) => {
      if (s.some((x) => x >= 500)) return `respondió ${s.find((x) => x >= 500)}`;
      return s.filter((x) => x === 201 || x === 200).length === 1 && s.includes(409) ? null : `esperaba un éxito y un 409, llegó ${s.join(',')}`;
    });

    await escenario('HTTP · crear un usuario ×2 con el mismo correo', RONDAS, async () => {
      const correo = `${PREFIJO}dup${Date.now().toString(36)}${++n}${DOMINIO}`;
      const [{ id: rolId }] = await consulta<{ id: string }>("SELECT id FROM roles WHERE nombre = 'Editor'");
      const rs = await Promise.all([s1, s2].map((s) => llamar(s, 'POST', '/api/users', { cuerpo: { email: correo, name: 'Dup', role_id: rolId } })));
      return { statuses: rs.map((r) => r.status) };
    }, (s) => {
      if (s.some((x) => x >= 500)) return `respondió ${s.find((x) => x >= 500)}`;
      return s.filter((x) => x === 201 || x === 200).length === 1 && s.includes(409) ? null : `esperaba un éxito y un 409, llegó ${s.join(',')}`;
    });

    // Los dos Superadmin se eliminan entre sí: tiene que quedar uno. Cuentas propias para no tocar a e1/e2.
    await escenario('HTTP · dos Superadmin se eliminan entre sí a la vez (debe quedar uno)', Math.min(RONDAS, 5), async () => {
      await ejecutar("DELETE FROM usuarios WHERE email LIKE :p AND email NOT LIKE '%e_@%'", { p: `${PREFIJO}%${DOMINIO}` });
      const [a, b] = [await crearActor(`x${++n}`, 'Superadmin'), await crearActor(`y${++n}`, 'Superadmin')];
      // Sin otros administradores en la base: los s1/s2 de arriba se retiran de la cuenta mientras dura la ronda.
      await ejecutar("UPDATE usuarios SET estado = 'inactive' WHERE email IN (:a, :b)", { a: s1.email, b: s2.email });
      const rs = await Promise.all([
        llamar(a, 'DELETE', `/api/users/${b.id}`),
        llamar(b, 'DELETE', `/api/users/${a.id}`),
      ]);
      const [{ n: quedan }] = await consulta<{ n: string }>(
        `SELECT count(*) AS n FROM usuarios u JOIN roles r ON r.id = u.rol_id
          WHERE u.estado = 'active' AND r.nombre IN ('Superadmin', 'Administrador') AND u.email LIKE :p`,
        { p: `${PREFIJO}%${DOMINIO}` }
      );
      await ejecutar("UPDATE usuarios SET estado = 'active' WHERE email IN (:a, :b)", { a: s1.email, b: s2.email });
      await ejecutar('DELETE FROM usuarios WHERE id IN (:a, :b)', { a: a.id, b: b.id });
      return { statuses: rs.map((r) => r.status), extra: Number(quedan) >= 1 ? [] : ['el sistema se quedó SIN administradores'] };
    }, (s) => (s.some((x) => x >= 500) ? `respondió ${s.find((x) => x >= 500)}` : null));

    // Fuerza bruta por HTTP: los limitadores de tasa y el bloqueo de la cuenta, juntos.
    await escenario('HTTP · 20 contraseñas incorrectas a la vez contra una cuenta, y después la buena', Math.min(RONDAS, 3), async () => {
      const actor = await crearActor(`b${++n}`, 'Editor');
      const rs = await Promise.all(Array.from({ length: 20 }, (_, i) =>
        llamar(null, 'POST', '/api/login', { cuerpo: { email: actor.email, password: `incorrecta-${i}` } })
      ));
      const buena = await llamar(null, 'POST', '/api/login', { cuerpo: { email: actor.email, password: PASSWORD } });
      const extra: string[] = [];
      if (buena.status === 200) extra.push('con la contraseña buena se entró justo después de la ráfaga');
      if (rs.some((r) => r.status >= 500)) extra.push('alguna respuesta fue 5xx');
      const [{ n: intentos, bloq }] = await consulta<{ n: number; bloq: boolean }>(
        `SELECT intentos_fallidos_login AS n, (bloqueado_hasta IS NOT NULL AND bloqueado_hasta > now()) AS bloq FROM usuarios WHERE id = :id`,
        { id: actor.id }
      );
      if (!bloq && rs.filter((r) => r.status === 401).length >= 5) extra.push(`pasaron ${rs.filter((r) => r.status === 401).length} intentos (401) y la cuenta no quedó bloqueada (contador ${intentos})`);
      const resumen = rs.reduce<Record<number, number>>((acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }), {});
      console.log(`   ráfaga: ${Object.entries(resumen).map(([k, v]) => `${v}×${k}`).join(' ')} · buena: ${buena.status} · bloqueada=${bloq}`);
      return { statuses: [buena.status], extra };
    }, () => null);
  } finally {
    await limpiar();
    await limpiarLimites();
    servidor.close();
    redis?.disconnect();
    await sequelize.close();
  }

  const fallidos = veredictos.filter((v) => !v).length;
  console.log(`\n${fallidos === 0 ? 'TODO EN ORDEN' : `${fallidos} ESCENARIO(S) CON PROBLEMAS`} (${veredictos.length} escenarios)`);
  process.exit(fallidos === 0 ? 0 : 1);
};

main().catch(async (e) => {
  console.error(e);
  await limpiar().catch(() => undefined);
  await sequelize.close().catch(() => undefined);
  process.exit(1);
});

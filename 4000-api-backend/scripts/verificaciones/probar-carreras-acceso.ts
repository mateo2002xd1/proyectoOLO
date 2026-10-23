/**
 * Prueba de condiciones de carrera en cuentas y acceso: alta de usuarios, bloqueo por
 * intentos fallidos (login y preguntas de seguridad), primer ingreso, protección del último
 * administrador y restablecimiento de contraseña.
 *
 * Mismo método y mismas reglas que `probar-carreras-paginas.ts` (ver `carreras-comun.ts`):
 * solo contra una base local desechable, las operaciones reales lanzadas a la vez, y un
 * veredicto por la coherencia de la base y por los fallos sin `status` 4xx.
 *
 * Los escenarios de fuerza bruta (`login`, `preguntas`) comparan con un control en fila: lo
 * que el bloqueo consigue con N intentos uno tras otro frente a lo que consigue con los
 * mismos N intentos a la vez. Cada intento cuesta un bcrypt de 12 rondas, por eso usan
 * menos rondas que el resto.
 *
 *   DATABASE_URL=postgres://postgres:prueba@localhost:55432/olo_prueba DB_SSL=false \
 *   REDIS_URL=redis://localhost:6390/0 \
 *   npx ts-node scripts/verificaciones/probar-carreras-acceso.ts [rondas]
 */
import { RONDAS, enTx, intentar, correrRondas, type Accion, type Resultado } from './carreras-comun';
import { QueryTypes } from 'sequelize';
import sequelize from '../../src/config/database';
import { createUser, updateUser, deleteUser } from '../../src/use-cases/usuarios/listar-usuarios.usecase';
import { loginUseCase } from '../../src/use-cases/auth/login.usecase';
import { firstLoginUseCase } from '../../src/use-cases/auth/first-login.usecase';
import { verifyAnswers } from '../../src/use-cases/auth/security-questions.usecase';
import { compararPassword } from '../../src/shared/password-policy';

void enTx;

const RONDAS_BCRYPT = Math.min(RONDAS, 5);
const INTENTOS_EN_RAFAGA = 20;
const CLAVES = ['k1', 'k2', 'k3'];
const NUEVA = 'Nueva-Clave-2026-xQ!';

let contador = 0;
const correo = (p: string) => `${p}${Date.now().toString(36)}${++contador}@sena.edu.co`;

const crearRoles = async () => {
  for (const nombre of ['Administrador', 'Editor']) {
    await sequelize.query(
      'INSERT INTO roles (nombre) VALUES (:nombre) ON CONFLICT (nombre) DO NOTHING',
      { replacements: { nombre } }
    );
  }
};
const rolId = async (nombre: string) =>
  (await sequelize.query<{ id: string }>('SELECT id FROM roles WHERE nombre = :nombre', {
    replacements: { nombre },
    type: QueryTypes.SELECT,
  }))[0].id;

const nuevaCuenta = async (rol: 'Administrador' | 'Editor', prefijo = 'u') => {
  const email = correo(prefijo);
  const u: any = await createUser({ email, name: prefijo, role_id: await rolId(rol) });
  return { id: String(u.id), email, temporal: String(u.temporaryPassword) };
};

/** Deja la cuenta con sus tres preguntas ya configuradas y la contraseña elegida (`NUEVA`). */
const cuentaConPreguntas = async () => {
  const c = await nuevaCuenta('Editor', 'q');
  await firstLoginUseCase(c.id, c.temporal, NUEVA, CLAVES.map((key) => ({ key, answer: `respuesta-${key}` })));
  return c;
};

const estadoDeBloqueo = async (id: string) =>
  (await sequelize.query<{ n: number; bloqueada: boolean }>(
    `SELECT intentos_fallidos_login AS n, (bloqueado_hasta IS NOT NULL AND bloqueado_hasta > now()) AS bloqueada
       FROM usuarios WHERE id = :id`,
    { replacements: { id }, type: QueryTypes.SELECT }
  ))[0];

const estadoPreguntas = async (id: string) =>
  (await sequelize.query<{ n: number; bloqueada: boolean }>(
    `SELECT intentos_fallidos AS n, (bloqueado_hasta IS NOT NULL AND bloqueado_hasta > now()) AS bloqueada
       FROM usuarios WHERE id = :id`,
    { replacements: { id }, type: QueryTypes.SELECT }
  ))[0];

const administradoresActivos = async () =>
  Number((await sequelize.query<{ n: string }>(
    `SELECT count(*) AS n FROM usuarios u JOIN roles r ON r.id = u.rol_id
      WHERE u.estado = 'active' AND r.nombre = 'Administrador'`,
    { type: QueryTypes.SELECT }
  ))[0].n);

const vaciarUsuarios = () => sequelize.query('DELETE FROM usuarios');

const res = (rs: Resultado[]) => rs;

/** El tope real de intentos que el sistema promete, para decir cuántos «de más» dejó pasar. */
const TOPE_LOGIN = 5;
const TOPE_PREGUNTAS = 3;

const main = async () => {
  await sequelize.authenticate();
  await crearRoles();
  console.log(`Rondas: ${RONDAS} (${RONDAS_BCRYPT} en los de fuerza bruta)  ·  ráfaga: ${INTENTOS_EN_RAFAGA} intentos`);
  const veredictos: boolean[] = [];

  veredictos.push(await correrRondas('crear usuario ×2 con el mismo correo', async () => {
    const email = correo('dup');
    const rid = await rolId('Editor');
    const rs = await Promise.all(
      ['A', 'B'].map((n) =>
        intentar({ nombre: `crear(${n})`, correr: () => createUser({ email, name: n, role_id: rid }) })
      )
    );
    const [{ n }] = await sequelize.query<{ n: string }>('SELECT count(*) AS n FROM usuarios WHERE email = :email', {
      replacements: { email },
      type: QueryTypes.SELECT,
    });
    return { rs, problemas: Number(n) === 1 ? [] : [`debía haber 1 cuenta y hay ${n}`], final: `${n} cuenta(s)` };
  }));

  /* ---- Bloqueo por intentos fallidos del login ---- */

  veredictos.push(await correrRondas(
    `login: ${INTENTOS_EN_RAFAGA} contraseñas incorrectas A LA VEZ (tope del bloqueo: ${TOPE_LOGIN})`,
    async () => {
      const c = await cuentaConPreguntas();
      const rs = await Promise.all(
        Array.from({ length: INTENTOS_EN_RAFAGA }, (_, i) =>
          intentar({ nombre: 'mal', correr: () => loginUseCase(c.email, `incorrecta-${i}`) })
        )
      );
      const { n, bloqueada } = await estadoDeBloqueo(c.id);
      const acierto = await intentar({ nombre: 'buena', correr: () => loginUseCase(c.email, NUEVA) });
      const problemas: string[] = [];
      if (!bloqueada) problemas.push(`tras ${INTENTOS_EN_RAFAGA} fallos simultáneos la cuenta NO quedó bloqueada (contador=${n}, tope=${TOPE_LOGIN})`);
      if (acierto.ok) problemas.push('con la contraseña buena se entró justo después de la ráfaga: el bloqueo no sirvió de nada');
      return { rs: res(rs.slice(0, 1).concat(acierto)), problemas, final: `contador=${n} bloqueada=${bloqueada} buena=${acierto.ok ? 'ENTRÓ' : acierto.ok === false && acierto.status}` };
    },
    RONDAS_BCRYPT
  ));

  veredictos.push(await correrRondas(
    `login (control): ${INTENTOS_EN_RAFAGA} contraseñas incorrectas UNA TRAS OTRA`,
    async () => {
      const c = await cuentaConPreguntas();
      for (let i = 0; i < INTENTOS_EN_RAFAGA; i++) await intentar({ nombre: 'mal', correr: () => loginUseCase(c.email, `incorrecta-${i}`) });
      const { n, bloqueada } = await estadoDeBloqueo(c.id);
      const acierto = await intentar({ nombre: 'buena', correr: () => loginUseCase(c.email, NUEVA) });
      const problemas = !bloqueada || acierto.ok ? ['el control en fila tampoco bloquea: la prueba no sirve'] : [];
      return { rs: [acierto], problemas, final: `contador=${n} bloqueada=${bloqueada} buena=${acierto.ok ? 'ENTRÓ' : acierto.status}` };
    },
    RONDAS_BCRYPT
  ));

  /* ---- Bloqueo por intentos fallidos de las preguntas de seguridad ---- */

  veredictos.push(await correrRondas(
    `preguntas de seguridad: ${INTENTOS_EN_RAFAGA} respuestas incorrectas A LA VEZ (tope: ${TOPE_PREGUNTAS})`,
    async () => {
      const c = await cuentaConPreguntas();
      const respuestas = (ok: boolean, i = 0) => CLAVES.map((key) => ({ key, answer: ok ? `respuesta-${key}` : `mala-${i}` }));
      const rs = await Promise.all(
        Array.from({ length: INTENTOS_EN_RAFAGA }, (_, i) =>
          intentar({ nombre: 'mal', correr: () => verifyAnswers(c.email, respuestas(false, i)) })
        )
      );
      const { n, bloqueada } = await estadoPreguntas(c.id);
      const acierto = await intentar({ nombre: 'buena', correr: () => verifyAnswers(c.email, respuestas(true)) });
      const problemas: string[] = [];
      if (!bloqueada) problemas.push(`tras ${INTENTOS_EN_RAFAGA} fallos simultáneos la cuenta NO quedó bloqueada (contador=${n}, tope=${TOPE_PREGUNTAS})`);
      if (acierto.ok) problemas.push('con las respuestas buenas se pasó justo después de la ráfaga: el bloqueo no sirvió de nada');
      return { rs: res(rs.slice(0, 1).concat(acierto)), problemas, final: `contador=${n} bloqueada=${bloqueada} buenas=${acierto.ok ? 'PASARON' : acierto.status}` };
    },
    RONDAS_BCRYPT
  ));

  /* ---- Primer ingreso ---- */

  veredictos.push(await correrRondas('primer ingreso ×2 a la vez (dos pestañas con respuestas distintas)', async () => {
    const c = await nuevaCuenta('Editor', 'f');
    const pedido = (n: string, pass: string): Accion => ({
      nombre: `ingreso(${n})`,
      correr: () => firstLoginUseCase(c.id, c.temporal, pass, CLAVES.map((key) => ({ key, answer: `${n}-${key}` }))),
    });
    const rs = await Promise.all([pedido('A', NUEVA), pedido('B', `${NUEVA}b`)].map(intentar));
    const filas = await sequelize.query<{ pregunta_clave: string; respuesta_hash: string }>(
      'SELECT pregunta_clave, respuesta_hash FROM preguntas_seguridad WHERE usuario_id = :id',
      { replacements: { id: c.id }, type: QueryTypes.SELECT }
    );
    const problemas: string[] = [];
    if (filas.length !== 3) problemas.push(`debían quedar 3 preguntas y hay ${filas.length}`);
    // ¿Todas las respuestas guardadas son de la misma pestaña?
    const dueños = new Set<string>();
    const bcrypt = require('bcryptjs');
    for (const f of filas) {
      for (const n of ['A', 'B']) {
        if (await bcrypt.compare(`${n}-${f.pregunta_clave}`.toLowerCase(), f.respuesta_hash)) dueños.add(n);
      }
    }
    if (dueños.size > 1) problemas.push('las tres preguntas guardadas mezclan respuestas de las dos pestañas');
    return { rs, problemas, final: `${filas.length} preguntas de ${[...dueños].join('+') || '—'}` };
  }, RONDAS_BCRYPT));

  /* ---- Último administrador ---- */

  const dosAdministradores = async () => {
    await vaciarUsuarios();
    const a = await nuevaCuenta('Administrador', 'adm');
    const b = await nuevaCuenta('Administrador', 'adm');
    return { a, b, actorA: { id: a.id, role: 'Administrador' }, actorB: { id: b.id, role: 'Administrador' } };
  };

  veredictos.push(await correrRondas('último administrador: dos administradores se eliminan entre sí a la vez', async () => {
    const { a, b, actorA, actorB } = await dosAdministradores();
    const rs = await Promise.all([
      intentar({ nombre: 'A borra a B', correr: () => deleteUser(b.id, actorA) }),
      intentar({ nombre: 'B borra a A', correr: () => deleteUser(a.id, actorB) }),
    ]);
    const n = await administradoresActivos();
    return { rs, problemas: n >= 1 ? [] : ['el sistema se quedó SIN administradores activos'], final: `${n} administrador(es)` };
  }, RONDAS_BCRYPT));

  veredictos.push(await correrRondas('último administrador: dos administradores se inactivan entre sí a la vez', async () => {
    const { a, b, actorA, actorB } = await dosAdministradores();
    const rs = await Promise.all([
      intentar({ nombre: 'A inactiva a B', correr: () => updateUser(b.id, { status: 'inactive' }, actorA) }),
      intentar({ nombre: 'B inactiva a A', correr: () => updateUser(a.id, { status: 'inactive' }, actorB) }),
    ]);
    const n = await administradoresActivos();
    return { rs, problemas: n >= 1 ? [] : ['el sistema se quedó SIN administradores activos'], final: `${n} administrador(es)` };
  }, RONDAS_BCRYPT));

  veredictos.push(await correrRondas('último administrador: uno degrada al otro mientras el otro lo elimina', async () => {
    const { a, b, actorA, actorB } = await dosAdministradores();
    const rolEditor = await rolId('Editor');
    const rs = await Promise.all([
      intentar({ nombre: 'A degrada a B', correr: () => updateUser(b.id, { role_id: rolEditor }, actorA) }),
      intentar({ nombre: 'B borra a A', correr: () => deleteUser(a.id, actorB) }),
    ]);
    const n = await administradoresActivos();
    return { rs, problemas: n >= 1 ? [] : ['el sistema se quedó SIN administradores activos'], final: `${n} administrador(es)` };
  }, RONDAS_BCRYPT));

  /* ---- Restablecer contraseña ---- */

  veredictos.push(await correrRondas('restablecer contraseña ×2 a la vez (gana la última; ninguna puede quedar inservible)', async () => {
    const { b, actorA } = await dosAdministradores();
    const entregadas: string[] = [];
    const reset = (n: string): Accion => ({
      nombre: `reset(${n})`,
      correr: async () => {
        const u: any = await updateUser(b.id, { reset_password: true }, actorA);
        entregadas.push(String(u.temporaryPassword));
      },
    });
    const rs = await Promise.all([reset('A'), reset('B')].map(intentar));
    const [{ hash }] = await sequelize.query<{ hash: string }>('SELECT password_hash AS hash FROM usuarios WHERE id = :id', {
      replacements: { id: b.id },
      type: QueryTypes.SELECT,
    });
    let validas = 0;
    for (const t of entregadas) if (await compararPassword(t, hash)) validas++;
    // Dos restablecimientos seguidos invalidan el primero: es lo normal, no una carrera. Lo que no puede
    // pasar es que no funcione NINGUNA de las entregadas (la base con un hash que nadie conoce).
    const problemas = entregadas.length === 2 && validas === 0 ? ['se entregaron 2 contraseñas temporales y ninguna funciona'] : [];
    return { rs, problemas, final: `${entregadas.length} entregadas, ${validas} válida(s)` };
  }, RONDAS_BCRYPT));

  await vaciarUsuarios();
  const fallidos = veredictos.filter((v) => !v).length;
  console.log(`\n${fallidos === 0 ? 'TODO EN ORDEN' : `${fallidos} ESCENARIO(S) CON PROBLEMAS`} (${veredictos.length} escenarios)`);
  await sequelize.close();
  process.exit(fallidos === 0 ? 0 : 1);
};

main().catch(async (e) => {
  console.error(e);
  await sequelize.close().catch(() => undefined);
  process.exit(1);
});

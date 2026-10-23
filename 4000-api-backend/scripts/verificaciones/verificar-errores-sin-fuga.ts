/**
 * Comprueba que los errores no filtren información y que el login y la recuperación de
 * contraseña no sirvan para averiguar qué cuentas existen.
 *
 * Existe por la auditoría del 2026-10-22 (`auditorias/2026-10-22-fuga-de-informacion-en-errores.md`):
 * `verify`, `user-questions` y `login` contestaban cosas distintas según la cuenta existiera,
 * estuviera bloqueada o inactiva, y el manejador de errores dejaba salir el `code` de los
 * errores de sistema (`ENOSPC`, `ECONNREFUSED`).
 *
 * No toca la base de datos ni Redis: los repositorios se sustituyen por versiones en memoria
 * y el manejador de errores se prueba con una petición y una respuesta de mentira. Misma
 * convención que `verificar-cookie-de-sesion.ts`.
 */
process.env.JWT_SECRET ||= 'secreto-solo-para-esta-verificacion';

import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { DatabaseError, UniqueConstraintError } from 'sequelize';
import { config } from '../../src/config';
import { errorHandler } from '../../src/middlewares/error.middleware';
import {
  describirErrorParaLog,
  esErrorDeDominio,
  mensajeSeguroDeCarga,
  MENSAJE_CARGA_ERROR_INTERNO,
  MENSAJE_CARGA_RECHAZADA_POR_LA_BASE,
  MENSAJE_ERROR_INTERNO,
} from '../../src/shared/errores';
import { elegirSiempreLasMismas } from '../../src/shared/anti-enumeracion';
import { UserRepository } from '../../src/repositories/usuarios.repository';
import { SecurityQuestionRepository } from '../../src/repositories/security-questions.repository';
import * as auditoria from '../../src/use-cases/auditoria/audit.usecase';
import { loginUseCase } from '../../src/use-cases/auth/login.usecase';
import {
  getCatalog,
  getQuestionKeysForUser,
  MENSAJE_VERIFICACION_FALLIDA,
  verifyAnswers,
} from '../../src/use-cases/auth/security-questions.usecase';

let fallos = 0;

/** Imprime OK o FALLA para una comprobación y cuenta los fallos. */
const comprobar = (descripcion: string, obtenido: unknown, esperado: unknown) => {
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado);
  if (!ok) fallos += 1;
  console.log(`  ${ok ? 'OK  ' : 'FALLA'}  ${descripcion} → ${JSON.stringify(obtenido)}${ok ? '' : ` (esperado ${JSON.stringify(esperado)})`}`);
};

const comprobarQue = (descripcion: string, condicion: boolean, detalle = '') => {
  if (!condicion) fallos += 1;
  console.log(`  ${condicion ? 'OK  ' : 'FALLA'}  ${descripcion}${detalle ? ` → ${detalle}` : ''}`);
};

// ── 1. Manejador de errores ──────────────────────────────────────────────────

interface RespuestaCapturada {
  status: number;
  cuerpo: any;
}

/** Pasa un error por `errorHandler` y devuelve lo que habría recibido el cliente. */
const responder = (err: unknown): { respuesta: RespuestaCapturada; log: string } => {
  const respuesta: RespuestaCapturada = { status: 0, cuerpo: undefined };
  const res = {
    status(codigo: number) {
      respuesta.status = codigo;
      return this;
    },
    json(cuerpo: unknown) {
      respuesta.cuerpo = cuerpo;
      return this;
    },
  } as unknown as Response;

  const lineas: string[] = [];
  const original = console.error;
  console.error = (...args: unknown[]) => lineas.push(args.map(String).join(' '));
  try {
    errorHandler(err, { method: 'POST', path: '/api/prueba' } as Request, res, () => undefined);
  } finally {
    console.error = original;
  }
  return { respuesta, log: lineas.join('\n') };
};

const conCodigo = (mensaje: string, code: string, status?: number) =>
  Object.assign(new Error(mensaje), { code, ...(status ? { status } : {}) });

const verificarManejador = (): void => {
  // El manejador lee `config.esProduccion`, que se fija al cargar el módulo: cambiar
  // `process.env.NODE_ENV` aquí ya no lo movería.
  const eraProduccion = config.esProduccion;

  console.log('\n=== Manejador de errores · producción ===');
  config.esProduccion = true;

  let r = responder(conCodigo("ENOSPC: no space left on device, write '/filesystem/sitio/uploads/x.png'", 'ENOSPC'));
  comprobar('error de disco → 500 genérico', r.respuesta, { status: 500, cuerpo: { error: MENSAJE_ERROR_INTERNO } });
  comprobarQue('el log sí guarda el detalle', r.log.includes('ENOSPC') && r.log.includes('/filesystem/'));
  comprobarQue('el log no lleva traza (sin «    at »)', !/\n\s+at /.test(r.log) && !r.log.includes('\n'));

  r = responder(conCodigo('connect ECONNREFUSED 10.0.0.5:6379', 'ECONNREFUSED'));
  comprobar('Redis caído → 500 genérico, sin `code`', r.respuesta, { status: 500, cuerpo: { error: MENSAJE_ERROR_INTERNO } });

  r = responder(Object.assign(new Error('upstream connect error to db.interno:5432'), { status: 502 }));
  comprobar('error de librería con status 502 → 500 genérico', r.respuesta, { status: 500, cuerpo: { error: MENSAJE_ERROR_INTERNO } });

  r = responder(Object.assign(new Error('relation "usuarios" does not exist'), { statusCode: 503 }));
  comprobar('error con `statusCode` 503 → 500 genérico', r.respuesta, { status: 500, cuerpo: { error: MENSAJE_ERROR_INTERNO } });

  r = responder(new DatabaseError(Object.assign(new Error('column "password_hash" of relation "usuarios" does not exist'), { sql: "UPDATE usuarios SET password_hash = '$2b$12$secreto'" })));
  comprobar('DatabaseError de Sequelize → 500 genérico', r.respuesta, { status: 500, cuerpo: { error: MENSAJE_ERROR_INTERNO } });
  comprobarQue('el log de ese error no vuelca el SQL ni los valores (sin «$2b$»)', !r.log.includes('$2b$') && !r.log.includes('UPDATE'));

  r = responder(new TypeError("Cannot read properties of undefined (reading 'id')"));
  comprobar('TypeError → 500 genérico', r.respuesta, { status: 500, cuerpo: { error: MENSAJE_ERROR_INTERNO } });

  r = responder(Object.assign(new Error('Carga no encontrada.'), { status: 404 }));
  comprobar('error de dominio 404 conserva su mensaje', r.respuesta, { status: 404, cuerpo: { error: 'Carga no encontrada.' } });

  r = responder(conCodigo('No se puede restaurar la página: la edita Ana', 'PAGE_LOCKED', 409));
  comprobar('error de dominio con `code` propio lo conserva', r.respuesta, {
    status: 409,
    cuerpo: { error: 'No se puede restaurar la página: la edita Ana', code: 'PAGE_LOCKED' },
  });

  r = responder(Object.assign(new SyntaxError('Unexpected token } in JSON at position 17'), { status: 400, type: 'entity.parse.failed' }));
  comprobar('JSON mal formado → mensaje fijo, sin el trozo del parser', r.respuesta, {
    status: 400,
    cuerpo: { error: 'El cuerpo de la petición no es un JSON válido.' },
  });

  comprobarQue('`esErrorDeDominio` rechaza un 5xx explícito', !esErrorDeDominio(Object.assign(new Error('x'), { status: 500 })));
  comprobarQue('`esErrorDeDominio` rechaza un status no entero', !esErrorDeDominio(Object.assign(new Error('x'), { status: '404' })));

  console.log('\n=== Manejador de errores · desarrollo (se conserva el mensaje para depurar) ===');
  config.esProduccion = false;
  r = responder(new TypeError("Cannot read properties of undefined (reading 'id')"));
  comprobar('fuera de producción el mensaje real sí sale', r.respuesta, {
    status: 500,
    cuerpo: { error: "Cannot read properties of undefined (reading 'id')" },
  });
  r = responder(conCodigo('connect ECONNREFUSED', 'ECONNREFUSED'));
  comprobarQue('ni siquiera en desarrollo sale el `code` del sistema', r.respuesta.cuerpo.code === undefined);

  config.esProduccion = eraProduccion;
};

// ── 2. Mensajes de las cargas de Excel ───────────────────────────────────────

const verificarMensajesDeCarga = (): void => {
  console.log('\n=== `cargas_datos.mensaje`: lo que se enseña en el panel ===');
  const baseCaida = new DatabaseError(Object.assign(new Error('relation "cargas_datos" does not exist'), { sql: "UPDATE cargas_datos SET mensaje = 'x'" }));
  comprobar('error de la base → mensaje interno genérico', mensajeSeguroDeCarga(baseCaida), MENSAJE_CARGA_ERROR_INTERNO);

  const duplicado = new UniqueConstraintError({ message: 'Validation error', errors: [] });
  comprobar('violación de unicidad → mensaje sin tablas ni columnas', mensajeSeguroDeCarga(duplicado), MENSAJE_CARGA_RECHAZADA_POR_LA_BASE);

  comprobar('error del sistema (con code) → genérico', mensajeSeguroDeCarga(conCodigo("ENOENT: no such file '/filesystem/cargas/a.xlsx'", 'ENOENT')), MENSAJE_CARGA_ERROR_INTERNO);

  comprobar('error escrito por el código se conserva', mensajeSeguroDeCarga(new Error('Falta la columna "Sexo" en la hoja "Superan el margen".')), 'Falta la columna "Sexo" en la hoja "Superan el margen".');
  comprobar('valor lanzado que no es Error', mensajeSeguroDeCarga('algo'), 'Error desconocido al procesar el archivo.');
  comprobarQue('el log de un error de base sí conserva el detalle', describirErrorParaLog(baseCaida).includes('cargas_datos'));
};

// ── 3. Preguntas inventadas ──────────────────────────────────────────────────

const verificarPreguntasInventadas = (): void => {
  console.log('\n=== Preguntas que se inventan para un correo sin cuenta ===');
  const catalogo = getCatalog();
  const claves = new Set(catalogo.map((c) => c.key));

  const a1 = elegirSiempreLasMismas('nadie@sena.edu.co', catalogo, 3);
  const a2 = elegirSiempreLasMismas('nadie@sena.edu.co', catalogo, 3);
  comprobar('mismo correo → mismas preguntas, en el mismo orden', a1, a2);
  comprobar('son tres', a1.length, 3);
  comprobar('distintas entre sí', new Set(a1.map((q) => q.key)).size, 3);
  comprobarQue('todas salen del catálogo', a1.every((q) => claves.has(q.key)));

  const variantes = new Set(Array.from({ length: 30 }, (_, i) => elegirSiempreLasMismas(`persona${i}@sena.edu.co`, catalogo, 3).map((q) => q.key).join()));
  comprobarQue('correos distintos no reciben todos las mismas', variantes.size > 5, `${variantes.size} combinaciones en 30 correos`);
};

// ── 4. Login y recuperación con repositorios en memoria ──────────────────────

const CORRECTA = 'Correcta#2026-clave';
const HASH_REAL = bcrypt.hashSync(CORRECTA, 12);
const RESPUESTA_REAL = 'azul';

/** Una cuenta con lo mínimo que mira el login y la recuperación. */
const cuenta = (cambios: Record<string, unknown> = {}) => ({
  id: 'u-1',
  email: 'ana@sena.edu.co',
  name: 'Ana',
  status: 'active',
  locked_until: null,
  expiration_date: null,
  password_hash: HASH_REAL,
  failed_login_attempts: 0,
  failed_security_attempts: 0,
  must_change_password: false,
  must_setup_security_questions: false,
  role: { name: 'Editor' },
  ...cambios,
});

const tresPreguntas = ['pet_name', 'birth_city', 'favorite_food'].map((k, i) => ({
  question_key: k,
  answer_hash: bcrypt.hashSync(RESPUESTA_REAL, 12),
  sort_order: i,
}));

let usuarioEnMemoria: ReturnType<typeof cuenta> | null = null;
let preguntasEnMemoria: typeof tresPreguntas = [];
let escrituras = 0;

const instalarRepositoriosEnMemoria = (): void => {
  const usuarios = UserRepository as any;
  usuarios.findByEmail = async () => usuarioEnMemoria;
  usuarios.update = async () => {
    escrituras += 1;
  };
  usuarios.updateLastAccess = async () => undefined;
  (SecurityQuestionRepository as any).findByUserId = async () => preguntasEnMemoria;
  // La bitácora escribe en la base; aquí no hay. Los fallos de respuesta la usan al contar intentos.
  (auditoria as any).logVerificacionDePreguntas = async () => undefined;
  (auditoria as any).logBloqueoDeCuenta = async () => undefined;
};

/** Ejecuta algo que debe fallar y devuelve `status` y mensaje del error. */
const fallo = async (accion: () => Promise<unknown>): Promise<{ status: number | undefined; mensaje: string }> => {
  try {
    await accion();
    return { status: undefined, mensaje: '(no falló)' };
  } catch (err: any) {
    return { status: err.status, mensaje: err.message };
  }
};

const GENERICO_LOGIN = { status: 401, mensaje: 'Credenciales inválidas' };
const GENERICO_PREGUNTAS = { status: 401, mensaje: MENSAJE_VERIFICACION_FALLIDA };

const enElFuturo = new Date(Date.now() + 10 * 60 * 1000);
const enElPasado = new Date(Date.now() - 24 * 60 * 60 * 1000);

const verificarLogin = async (): Promise<void> => {
  console.log('\n=== Login: el estado de la cuenta solo se dice a quien acierta la contraseña ===');
  const intento = (clave: string) => () => loginUseCase('ana@sena.edu.co', clave);

  usuarioEnMemoria = null;
  comprobar('correo inexistente', await fallo(intento('lo-que-sea')), GENERICO_LOGIN);

  usuarioEnMemoria = cuenta();
  comprobar('contraseña errónea', await fallo(intento('mala')), GENERICO_LOGIN);

  usuarioEnMemoria = cuenta({ status: 'inactive' });
  comprobar('inactiva + contraseña errónea (antes: 403 «Cuenta inactiva»)', await fallo(intento('mala')), GENERICO_LOGIN);

  usuarioEnMemoria = cuenta({ locked_until: enElFuturo });
  escrituras = 0;
  comprobar('bloqueada + contraseña errónea (antes: 423 «Cuenta bloqueada»)', await fallo(intento('mala')), GENERICO_LOGIN);
  comprobar('…y no suma otro fallo a una cuenta ya bloqueada', escrituras, 0);

  usuarioEnMemoria = cuenta({ expiration_date: enElPasado });
  comprobar('caducada + contraseña errónea (antes: 403 «Cuenta expirada»)', await fallo(intento('mala')), GENERICO_LOGIN);

  usuarioEnMemoria = cuenta();
  comprobar('contraseña ausente no revienta bcrypt', await fallo(() => loginUseCase('ana@sena.edu.co', undefined as unknown as string)), GENERICO_LOGIN);

  usuarioEnMemoria = cuenta({ status: 'inactive' });
  comprobar('inactiva + contraseña correcta sí lo dice', await fallo(intento(CORRECTA)), { status: 403, mensaje: 'Cuenta inactiva o suspendida' });

  usuarioEnMemoria = cuenta({ locked_until: enElFuturo });
  comprobar('bloqueada + contraseña correcta sí lo dice', await fallo(intento(CORRECTA)), { status: 423, mensaje: 'Cuenta bloqueada temporalmente' });

  console.log('\n=== Login: el tiempo no distingue «no existe» de «existe y la clave es errónea» ===');
  const medir = async (preparar: () => void): Promise<number> => {
    preparar();
    const inicio = process.hrtime.bigint();
    await fallo(intento('mala'));
    return Number(process.hrtime.bigint() - inicio) / 1e6;
  };
  const promedio = async (preparar: () => void) => {
    const muestras = [await medir(preparar), await medir(preparar), await medir(preparar)];
    return muestras.reduce((a, b) => a + b, 0) / muestras.length;
  };
  const sinCuenta = await promedio(() => (usuarioEnMemoria = null));
  const conCuenta = await promedio(() => (usuarioEnMemoria = cuenta()));
  const razon = sinCuenta / conCuenta;
  comprobarQue(
    'tardan lo mismo (razón entre 0,6 y 1,6)',
    razon > 0.6 && razon < 1.6,
    `sin cuenta ${sinCuenta.toFixed(0)} ms · con cuenta ${conCuenta.toFixed(0)} ms`
  );
};

const verificarRecuperacion = async (): Promise<void> => {
  console.log('\n=== Recuperación: `user-questions` siempre devuelve tres ===');
  const claves = (lista: { key: string }[]) => lista.map((q) => q.key);

  usuarioEnMemoria = null;
  const sinCuenta = await getQuestionKeysForUser('ana@sena.edu.co');
  comprobar('correo inexistente → tres preguntas', sinCuenta.length, 3);

  usuarioEnMemoria = cuenta();
  preguntasEnMemoria = tresPreguntas;
  const real = await getQuestionKeysForUser('ana@sena.edu.co');
  comprobar('cuenta con preguntas → las suyas', claves(real), ['pet_name', 'birth_city', 'favorite_food']);

  usuarioEnMemoria = cuenta({ locked_until: enElFuturo });
  comprobar('cuenta bloqueada → las suyas, sin 423', claves(await getQuestionKeysForUser('ana@sena.edu.co')), ['pet_name', 'birth_city', 'favorite_food']);

  usuarioEnMemoria = cuenta();
  preguntasEnMemoria = [];
  const sinConfigurar = await getQuestionKeysForUser('ana@sena.edu.co');
  comprobar('cuenta sin preguntas → tres inventadas (no `[]`)', sinConfigurar.length, 3);
  comprobar('…iguales a las que recibiría un correo sin cuenta', claves(sinConfigurar), claves(await (async () => { usuarioEnMemoria = null; return getQuestionKeysForUser('ana@sena.edu.co'); })()));
  comprobarQue('mismas claves en forma {key, label}', real.every((q: any) => typeof q.key === 'string' && typeof q.label === 'string'));

  console.log('\n=== Recuperación: `verify` responde igual en todos los casos que dependen de la cuenta ===');
  const respuestas = [
    { key: 'pet_name', answer: RESPUESTA_REAL },
    { key: 'birth_city', answer: RESPUESTA_REAL },
    { key: 'favorite_food', answer: RESPUESTA_REAL },
  ];
  const verificar = () => verifyAnswers('ana@sena.edu.co', respuestas, {});

  usuarioEnMemoria = null;
  comprobar('correo inexistente (antes: 404 «Usuario no encontrado»)', await fallo(verificar), GENERICO_PREGUNTAS);

  usuarioEnMemoria = cuenta({ locked_until: enElFuturo });
  preguntasEnMemoria = tresPreguntas;
  comprobar('cuenta bloqueada (antes: 423)', await fallo(verificar), GENERICO_PREGUNTAS);

  usuarioEnMemoria = cuenta();
  preguntasEnMemoria = [];
  comprobar('cuenta sin preguntas (antes: 400 «no tiene preguntas configuradas»)', await fallo(verificar), GENERICO_PREGUNTAS);

  preguntasEnMemoria = tresPreguntas;
  comprobar('claves de pregunta que no son suyas (antes: 400 «Falta una o más respuestas»)', await fallo(() =>
    verifyAnswers('ana@sena.edu.co', respuestas.map((r) => ({ ...r, key: 'otra' })), {})
  ), GENERICO_PREGUNTAS);

  comprobar('respuesta errónea', await fallo(() =>
    verifyAnswers('ana@sena.edu.co', respuestas.map((r) => ({ ...r, answer: 'rojo' })), {})
  ), GENERICO_PREGUNTAS);

  comprobar('forma del cuerpo incorrecta sigue siendo 400, antes de mirar la base', await fallo(() =>
    verifyAnswers('ana@sena.edu.co', [], {})
  ), { status: 400, mensaje: 'Debe proporcionar respuestas a las 3 preguntas' });

  comprobar('respuestas correctas pasan', (await verifyAnswers('ana@sena.edu.co', respuestas, {})).id, 'u-1');

  console.log('\n=== Recuperación: el tiempo de `verify` tampoco distingue ===');
  const medir = async (preparar: () => void): Promise<number> => {
    preparar();
    const inicio = process.hrtime.bigint();
    await fallo(verificar);
    return Number(process.hrtime.bigint() - inicio) / 1e6;
  };
  const promedio = async (preparar: () => void) => {
    const m = [await medir(preparar), await medir(preparar), await medir(preparar)];
    return m.reduce((a, b) => a + b, 0) / m.length;
  };
  const inexistente = await promedio(() => (usuarioEnMemoria = null));
  const conRespuestaMala = await promedio(() => {
    usuarioEnMemoria = cuenta();
    preguntasEnMemoria = tresPreguntas;
    // la primera pregunta falla: una sola comparación de bcrypt, como en el relleno
    (respuestas[0] as any).answer = 'rojo';
  });
  (respuestas[0] as any).answer = RESPUESTA_REAL;
  const razon = inexistente / conRespuestaMala;
  comprobarQue(
    'inexistente y «respuesta errónea» tardan lo mismo (razón entre 0,6 y 1,6)',
    razon > 0.6 && razon < 1.6,
    `inexistente ${inexistente.toFixed(0)} ms · respuesta errónea ${conRespuestaMala.toFixed(0)} ms`
  );
};

const principal = async (): Promise<void> => {
  verificarManejador();
  verificarMensajesDeCarga();
  verificarPreguntasInventadas();
  instalarRepositoriosEnMemoria();
  await verificarLogin();
  await verificarRecuperacion();

  console.log(fallos === 0 ? '\nTodo correcto.\n' : `\n${fallos} comprobaciones fallaron.\n`);
  process.exit(fallos === 0 ? 0 : 1);
};

principal().catch((err) => {
  console.error('La verificación no pudo terminar:', describirErrorParaLog(err));
  process.exit(1);
});

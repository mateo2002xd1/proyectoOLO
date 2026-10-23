import jwt from 'jsonwebtoken';
import { createHash, timingSafeEqual } from 'crypto';
import { config } from '../../config';
import { UserRepository } from '../../repositories/usuarios.repository';
import { SecurityQuestionRepository } from '../../repositories/security-questions.repository';
import { TOTAL_PREGUNTAS } from './first-login.usecase';
import {
  compararPassword,
  INTENTOS_MAXIMOS_LOGIN,
  MINUTOS_BLOQUEO_LOGIN,
  MENSAJE_TEMPORAL_VENCIDA,
  temporalVencida,
} from '../../shared/password-policy';
import { esDominioInstitucional, normalizarEmail } from '../../shared/email-policy';
import { RolePermissionRepository } from '../../repositories/role-permissions.repository';
import { CLAVES_DEL_CATALOGO } from '../../shared/catalogo-permisos';
import { logAudit, logBloqueoDeCuenta } from '../auditoria/audit.usecase';
import { tieneRol } from '../../shared/autorizacion';
import { gastarComparacionDeRelleno } from '../../shared/anti-enumeracion';

/** El "desde dónde" de un login, para la bitácora. Opcional: los scripts y pruebas
 *  que llaman a este caso de uso sin pasar por HTTP no tienen ninguno de los dos. */
interface ContextoDeLogin {
  ip?: string | null;
  userAgent?: string | null;
  /** En cuál de los dos portales se está entrando; `null` si la petición no lo dice. */
  aplicacion?: string | null;
}

/**
 * Anota un intento fallido y bloquea al llegar al tope (§3: 5 intentos, 15 minutos).
 *
 * Esto no existía. El login *leía* `bloqueado_hasta` pero nunca lo escribía, así que
 * la comprobación de más abajo no podía dispararse nunca: fallar mil veces no tenía
 * consecuencia. El límite por IP de `auth.routes.ts` es otro control y no cubre este
 * — un atacante que rote direcciones lo esquiva, y no protege una cuenta concreta.
 *
 * El contador es `intentos_fallidos_login`, distinto del de las preguntas de
 * seguridad: son dos flujos con umbrales distintos (5/15min contra 3/30min).
 */
const registrarFalloDeLogin = async (user: any, contexto?: ContextoDeLogin): Promise<void> => {
  const intentos = (user.failed_login_attempts || 0) + 1;
  const cambios: Record<string, unknown> = { failed_login_attempts: intentos };
  let bloqueadoHasta: Date | null = null;

  if (intentos >= INTENTOS_MAXIMOS_LOGIN) {
    bloqueadoHasta = new Date(Date.now() + MINUTOS_BLOQUEO_LOGIN * 60 * 1000);
    cambios.locked_until = bloqueadoHasta;
    // Se reinicia junto con el bloqueo para que, al expirar, el usuario tenga otra
    // tanda completa en vez de quedar bloqueado en cada intento siguiente.
    cambios.failed_login_attempts = 0;
  }

  await UserRepository.update(user.id, cambios);

  // El bloqueo queda en la bitácora; cada fallo suelto, no. Auditar todos los intentos
  // fallidos se descartó (6-auditoria.md, 19-09-2026): volumen, y qué hacer con correos
  // que ni existen. El bloqueo es lo que cambia algo —la cuenta deja de poder entrar— y
  // es lo que alguien tiene que poder ver.
  if (bloqueadoHasta) {
    await logBloqueoDeCuenta(user.id, contexto, {
      motivo: 'inicio_sesion',
      intentos: INTENTOS_MAXIMOS_LOGIN,
      minutos: MINUTOS_BLOQUEO_LOGIN,
      hasta: bloqueadoHasta,
    });
  }
};

/**
 * Compara dos cadenas sin que el tiempo delate cuánto coincidían.
 *
 * El resto de contraseñas del sistema pasan por bcrypt, que ya compara así. La cuenta
 * maestra se comparaba con `===`, que corta en el primer carácter distinto: medir el
 * tiempo de respuesta permite adivinarla carácter a carácter en vez de a fuerza bruta.
 * Sobre una red real la señal es ruidosa, pero esta credencial no caduca, no se puede
 * desactivar desde el panel y da Superadmin — no es la que conviene dejar barata.
 *
 * Se comparan los hashes y no las cadenas para que las longitudes distintas no fallen
 * antes de tiempo, que sería la misma fuga por otra vía.
 */
const igualEnTiempoConstante = (a: string, b: string): boolean => {
  const bufA = createHash('sha256').update(a, 'utf8').digest();
  const bufB = createHash('sha256').update(b, 'utf8').digest();
  return timingSafeEqual(bufA, bufB);
};

/** ¿Son estas las credenciales de la cuenta maestra local? Compara en tiempo constante. */
const esLaCuentaMaestra = (emailNormalizado: string, password: string): boolean =>
  igualEnTiempoConstante(config.localAuth.email, emailNormalizado) &&
  igualEnTiempoConstante(config.localAuth.password, password);

/**
 * Las claves de permiso de un rol, tal como las recibe el frontend.
 *
 * Superadmin recibe el catálogo entero: su bypass vive en `resolverPermisos` y no en la
 * tabla `roles_permisos`, así que sin esto el panel le enseñaría menos de lo que puede
 * hacer. Lo usan el login (para el token) y `GET /api/me` (para refrescarlos).
 */
export const permisosDeRol = async (rol: string | null | undefined): Promise<string[]> =>
  tieneRol(rol, ['superadmin']) ? CLAVES_DEL_CATALOGO : RolePermissionRepository.getPermissionsByRole(rol ?? '');

/**
 * Inicia sesión: valida dominio y credenciales, aplica bloqueo y caducidad, firma el JWT con los
 * permisos del rol y deja el ingreso en la bitácora.
 * @throws {Error} 401 genérico ante credenciales inválidas (cuenta inexistente o contraseña errónea, sin
 * distinguirlas); 403 si la cuenta está inactiva o caducada, y 423 si está bloqueada, pero **solo después de
 * acertar la contraseña**: antes, esos tres mensajes delataban a cualquiera que probara un correo si la
 * cuenta existía y en qué estado estaba.
 */
export const loginUseCase = async (email: string, password: string, contexto?: ContextoDeLogin) => {
  // Un cuerpo sin contraseña (o con una que no es texto) no debe hacer reventar bcrypt: sería un
  // 500 distinto del 401 de siempre, y eso también delata.
  if (typeof password !== 'string') password = '';
  const normalizedEmail = normalizarEmail(email ?? '');

  /**
   * El dominio se comprueba **antes** de buscar en la base y con el mismo error
   * 401 genérico que un usuario inexistente. Devolver aquí un 400 con «dominio no
   * permitido» convertiría el login en un detector de dominios: bastaría con probar
   * correos para saber cuáles llegan siquiera a consultarse. Quien escribe mal el
   * dominio lo ve avisado en el formulario, que para eso valida antes de enviar.
   */
  if (!esDominioInstitucional(normalizedEmail)) {
    throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });
  }

  // La cuenta maestra de `.env` no deja fila en la bitácora: `entidad_id` es una
  // FK obligatoria contra `usuarios` y ella no tiene fila — es una vía de rescate,
  // no una cuenta real. El resto de sus acciones sí quedan (ver `idReferenciable`
  // en `auditoria-request.ts`); solo el propio login queda sin auditar.
  if (config.localAuth.habilitado && esLaCuentaMaestra(normalizedEmail, password)) {
    const payload = {
      id: 'local-auth',
      email: normalizedEmail,
      name: config.localAuth.name,
      role: config.localAuth.role,
      isLocal: true,
      must_setup_security_questions: false,
      must_change_password: false,
      permisos: CLAVES_DEL_CATALOGO,
    };
    const token = jwt.sign(payload as any, config.jwtSecret, {
      algorithm: config.jwtAlgoritmo,
      expiresIn: config.jwtExpiresIn as any,
    });
    return { token, user: payload };
  }

  const user = await UserRepository.findByEmail(normalizedEmail);
  if (!user) {
    // Sin esto, un correo que no existe respondía al instante y uno que sí, tras ~250 ms de
    // bcrypt: el tiempo delataba lo que el mensaje ya callaba.
    await gastarComparacionDeRelleno(password);
    throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });
  }

  /**
   * La contraseña se comprueba **antes** de mirar el estado de la cuenta.
   *
   * Hasta el 2026-10-22 «Cuenta inactiva», «Cuenta bloqueada» y «Cuenta expirada» salían
   * antes de comparar la contraseña, así que cualquiera que escribiera un correo
   * institucional sabía si esa cuenta existía y en qué estado, sin conocer la clave. Ahora
   * esos mensajes solo los ve quien acierta la contraseña —que ya es quien puede usarlos—;
   * el resto recibe el mismo 401 que un usuario inexistente.
   */
  const valid = await compararPassword(password, user.password_hash || '');
  const bloqueada = Boolean(user.locked_until && new Date(user.locked_until) > new Date());

  if (!valid) {
    // Con la cuenta ya bloqueada no se cuenta el fallo: alargaría el bloqueo a quien lo
    // provoca un tercero, y antes tampoco se contaba (salía 423 sin llegar a comparar).
    if (!bloqueada) await registrarFalloDeLogin(user, contexto);
    throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });
  }

  if (bloqueada) throw Object.assign(new Error('Cuenta bloqueada temporalmente'), { status: 423 });

  if (user.status !== 'active')
    throw Object.assign(new Error('Cuenta inactiva o suspendida'), { status: 403 });

  if (user.expiration_date && new Date(user.expiration_date) < new Date()) {
    await UserRepository.update(user.id, { status: 'inactive' });
    // El actor es «nadie»: nadie decidió esto, se cumplió una fecha. Por eso
    // `usuarioId` va en null y el nombre lo dice en vez de repetir el de quien
    // intentaba entrar — sería mentir sobre quién hizo el cambio.
    await logAudit({
      entidadId: user.id,
      entidadTipo: 'usuario',
      accion: 'expirar',
      usuarioId: null,
      usuarioNombre: 'Sistema (fecha de caducidad cumplida)',
      ip: contexto?.ip ?? null,
      userAgent: contexto?.userAgent ?? null,
      camposModificados: [{ campo: 'status', antes: 'active', despues: 'inactive' }],
    });
    throw Object.assign(new Error('Cuenta expirada'), { status: 403 });
  }

  // Temporal vencida (72 h). Va **después** de comprobar la contraseña: antes, cualquiera
  // que probara el correo sabría que esa cuenta existe y no se ha estrenado.
  if (temporalVencida(user)) {
    throw Object.assign(new Error(MENSAJE_TEMPORAL_VENCIDA), { status: 403 });
  }

  // Un acierto cierra la racha. Si no se limpiara, los fallos se acumularían entre
  // sesiones y acabarían bloqueando a alguien que sí sabe su contraseña.
  if (user.failed_login_attempts > 0 || user.locked_until) {
    await UserRepository.update(user.id, { failed_login_attempts: 0, locked_until: null });
  }

  await UserRepository.updateLastAccess(user.id);

  /**
   * Una cuenta sin sus preguntas de seguridad no puede recuperar la contraseña, y la
   * marca `must_setup_security_questions` no basta para saberlo: solo se enciende al
   * crear la cuenta o al restablecerlas, así que las cuentas sembradas a mano, las
   * anteriores a la recuperación o aquellas cuyas filas se perdieron entraban sin que
   * nadie se las pidiera. Aquí se cuenta lo que hay de verdad y, si falta, se enciende
   * la marca: desde ese momento todo el sistema (proxies, `requireAuth`, primer
   * ingreso) la trata como cualquier otra cuenta pendiente.
   */
  if (!user.must_setup_security_questions) {
    const preguntas = await SecurityQuestionRepository.countByUserId(user.id);
    if (preguntas < TOTAL_PREGUNTAS) {
      await UserRepository.update(user.id, { must_setup_security_questions: true });
      user.must_setup_security_questions = true;
    }
  }

  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    apellidos: (user as any).apellidos,
    role: user.role?.name,
    role_id: user.role_id,
    must_setup_security_questions: user.must_setup_security_questions,
    must_change_password: user.must_change_password,
    permisos: await permisosDeRol(user.role?.name),
  };

  const token = jwt.sign(payload as any, config.jwtSecret, {
    algorithm: config.jwtAlgoritmo,
    expiresIn: config.jwtExpiresIn as any,
  });

  // Va después de firmar el token y no antes: si `logAudit` fallara, quien acaba de
  // dar la contraseña correcta no debe quedarse sin poder entrar por eso. `logAudit`
  // sin `tx` ya se traga sus propios errores (ver `audit.usecase.ts`), así que esto
  // no puede tumbar el login de todos modos — el orden es además, por si acaso.
  await logAudit({
    entidadId: user.id,
    entidadTipo: 'usuario',
    accion: 'autenticar',
    usuarioId: user.id,
    usuarioNombre: payload.apellidos ? `${payload.name} ${payload.apellidos}` : payload.name,
    ip: contexto?.ip ?? null,
    userAgent: contexto?.userAgent ?? null,
    // Lo único de un login que no se deduce de la fila: en cuál de los dos portales
    // fue. Va como campo y no como una acción aparte porque sigue siendo la misma cosa
    // —alguien entró—, solo que ahora dice por dónde. Sin la cabecera se queda sin
    // campos, igual que todas las filas anteriores a esto, y la pantalla sigue leyendo
    // «Inició sesión» a secas en vez de inventarse un portal.
    camposModificados: contexto?.aplicacion
      ? [{ campo: 'origen', antes: null, despues: contexto.aplicacion }]
      : [],
  });

  return { token, user: payload };
};

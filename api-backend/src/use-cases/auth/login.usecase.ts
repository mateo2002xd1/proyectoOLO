import jwt from 'jsonwebtoken';
import { createHash, timingSafeEqual } from 'crypto';
import { config } from '../../config';
import { UserRepository } from '../../repositories/usuarios.repository';
import {
  compararPassword,
  INTENTOS_MAXIMOS_LOGIN,
  MINUTOS_BLOQUEO_LOGIN,
} from '../../shared/password-policy';
import { esDominioInstitucional, normalizarEmail } from '../../shared/email-policy';

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
const registrarFalloDeLogin = async (user: any): Promise<void> => {
  const intentos = (user.failed_login_attempts || 0) + 1;
  const cambios: Record<string, unknown> = { failed_login_attempts: intentos };

  if (intentos >= INTENTOS_MAXIMOS_LOGIN) {
    cambios.locked_until = new Date(Date.now() + MINUTOS_BLOQUEO_LOGIN * 60 * 1000);
    // Se reinicia junto con el bloqueo para que, al expirar, el usuario tenga otra
    // tanda completa en vez de quedar bloqueado en cada intento siguiente.
    cambios.failed_login_attempts = 0;
  }

  await UserRepository.update(user.id, cambios);
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

const esLaCuentaMaestra = (emailNormalizado: string, password: string): boolean =>
  igualEnTiempoConstante(config.localAuth.email, emailNormalizado) &&
  igualEnTiempoConstante(config.localAuth.password, password);

export const loginUseCase = async (email: string, password: string) => {
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

  if (config.localAuth.habilitado && esLaCuentaMaestra(normalizedEmail, password)) {
    const payload = {
      id: 'local-auth',
      email: normalizedEmail,
      name: config.localAuth.name,
      role: config.localAuth.role,
      isLocal: true,
      must_setup_security_questions: false,
      must_change_password: false,
    };
    const token = jwt.sign(payload as any, config.jwtSecret, { expiresIn: config.jwtExpiresIn as any });
    return { token, user: payload };
  }

  const user = await UserRepository.findByEmail(normalizedEmail);
  if (!user) throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });

  if (user.status !== 'active')
    throw Object.assign(new Error('Cuenta inactiva o suspendida'), { status: 403 });

  if (user.locked_until && new Date(user.locked_until) > new Date())
    throw Object.assign(new Error('Cuenta bloqueada temporalmente'), { status: 423 });

  if (user.expiration_date && new Date(user.expiration_date) < new Date()) {
    await UserRepository.update(user.id, { status: 'inactive' });
    throw Object.assign(new Error('Cuenta expirada'), { status: 403 });
  }

  const valid = await compararPassword(password, user.password_hash || '');
  if (!valid) {
    await registrarFalloDeLogin(user);
    throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });
  }

  // Un acierto cierra la racha. Si no se limpiara, los fallos se acumularían entre
  // sesiones y acabarían bloqueando a alguien que sí sabe su contraseña.
  if (user.failed_login_attempts > 0 || user.locked_until) {
    await UserRepository.update(user.id, { failed_login_attempts: 0, locked_until: null });
  }

  await UserRepository.updateLastAccess(user.id);

  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    apellidos: (user as any).apellidos,
    role: user.role?.name,
    role_id: user.role_id,
    must_setup_security_questions: user.must_setup_security_questions,
    must_change_password: user.must_change_password,
  };

  const token = jwt.sign(payload as any, config.jwtSecret, { expiresIn: config.jwtExpiresIn as any });
  return { token, user: payload };
};

export const verifyTokenUseCase = (token: string) => {
  return jwt.verify(token, config.jwtSecret);
};

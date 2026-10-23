import bcrypt from 'bcryptjs';
import { UserRepository } from '../../repositories/usuarios.repository';
import { RoleRepository } from '../../repositories/roles.repository';
import { config } from '../../config';
import {
  generarPasswordTemporal,
  nuevaPasswordSinRepetir,
  vencimientoDeTemporal,
  BCRYPT_ROUNDS,
} from '../../shared/password-policy';
import { exigirEmailInstitucional } from '../../shared/email-policy';
import { SecurityQuestionRepository } from '../../repositories/security-questions.repository';
import { usuariosPolicies, puedeGestionarCuentaDeRol, errorCuentaReservada } from '../../policies/usuarios.policies';
import { esDueno } from '../../shared/autorizacion';
import { logAudit } from '../auditoria/audit.usecase';
import { UniqueConstraintError } from 'sequelize';
import { enSeccionCritica } from '../../shared/seccion-critica';

/** La exclusión compartida por todo lo que crea, cambia o quita cuentas (ver `updateUser`). */
const CLAVE_DE_ADMINISTRACION = 'usuarios:administracion';

/** El índice único del correo es la última defensa: la violación es un correo repetido, no un fallo. */
const traducirCorreoRepetido = (error: unknown): never => {
  if (error instanceof UniqueConstraintError) {
    throw Object.assign(new Error('El correo ya está registrado'), { status: 409 });
  }
  throw error;
};

/** Todas las cuentas con su rol, sin hash de contraseña. */
export const getAllUsers = () => UserRepository.findAll();

/**
 * Una cuenta por su id.
 * @throws {Error} 404 si no existe.
 */
export const getUserById = async (id: string) => {
  const user = await UserRepository.findById(id);
  if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
  return user;
};

/**
 * Crea una cuenta con correo institucional y una contraseña temporal que obliga a cambiarla al entrar.
 * @throws {Error} 403 con el correo reservado; 409 si el correo ya existe; 404 si el rol no existe.
 */
const crearUsuario = async (data: any, actor?: Actor) => {
  const { email, password, role_id, ...rest } = data;
  // Aquí sí se devuelve el motivo real: quien crea usuarios es un administrador
  // autenticado, así que decirle que el dominio no vale no revela nada a nadie.
  const normalizedEmail = exigirEmailInstitucional(email);

  if (normalizedEmail === config.localAuth.email.toLowerCase()) {
    throw Object.assign(new Error('Este correo es reservado y está protegido por el sistema'), { status: 403 });
  }

  const existing = await UserRepository.findByEmail(normalizedEmail);
  if (existing) throw Object.assign(new Error('El correo ya está registrado'), { status: 409 });

  const role = await RoleRepository.findById(role_id);
  if (!role) throw Object.assign(new Error('Rol no encontrado'), { status: 404 });
  if (actor && !puedeGestionarCuentaDeRol(actor, (role as any).name)) throw errorCuentaReservada();

  const temporaryPassword = generarPasswordTemporal();
  // La temporal ya nace cumpliendo §1, así que se hashea directa: pasarla otra vez
  // por el validador sería comprobar lo que el generador acaba de garantizar.
  const password_hash = await bcrypt.hash(temporaryPassword, BCRYPT_ROUNDS);
  const user = await UserRepository.create({
    ...rest,
    email: normalizedEmail,
    password_hash,
    role_id,
    must_change_password: true,
    temp_password_expires_at: vencimientoDeTemporal(),
  });

  const userJson = user.toJSON ? user.toJSON() : { ...user };
  userJson.temporaryPassword = temporaryPassword;
  return userJson;
};

/** Crea una cuenta; si otra petición registró el mismo correo a la vez, responde 409 como en fila. */
export const createUser = (data: any, actor?: Actor) => crearUsuario(data, actor).catch(traducirCorreoRepetido);

/**
 * Quién pide el cambio. Se pasa desde el controlador; los llamadores internos que ya
 * demostraron la identidad por otra vía (el cambio de contraseña voluntario, que
 * verifica la contraseña actual) lo omiten.
 */
type Actor = { id?: string; role?: string | null };

/** Lo único que alguien puede cambiarse a sí mismo sin ser administrador. */
const CAMPOS_DE_AUTOSERVICIO = ['name', 'apellidos', 'email'] as const;

/**
 * Cuántas cuentas activas administran usuarios ahora mismo (Superadmin o
 * Administrador: los dos roles que cuentan como `puedeAdministrarUsuarios`), sin
 * contar `excluirId`.
 *
 * La cuenta maestra de `.env` no aparece aquí —`UserRepository.findAll` ya la
 * excluye— y no es una red de rescate real: `localAuthHabilitado` la apaga en
 * producción (`config/index.ts`). Estas cuentas son la única puerta para volver a
 * nombrar un administrador, así que ninguna de las tres formas de vaciarlas —bajar
 * el rol, desactivar el estado o dejarlo caducar— puede dejar este número en cero.
 */
const contarAdministradoresActivos = async (excluirId?: string) => {
  const usuarios = await UserRepository.findAll();
  return (usuarios as any[]).filter(
    (u) =>
      u.id !== excluirId &&
      u.status === 'active' &&
      usuariosPolicies.puedeAdministrarUsuarios(u.role?.name)
  ).length;
};

/**
 * Actualiza una cuenta respetando quién la edita: nadie se cambia su propio rol ni estado, y no se
 * degrada al último administrador activo. También resetea contraseña o preguntas si se pide.
 * @throws {Error} 404 si no existe; 403 si el cambio no está permitido; 409 si dejaría el sistema sin administrador.
 */
const actualizarUsuario = async (id: string, data: any, actor?: Actor) => {
  const { password, email, reset_password, reset_security_questions, ...rest } = data;

  const user = await UserRepository.findById(id);
  if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });

  if (user.email === config.localAuth.email.toLowerCase()) {
    throw Object.assign(new Error('No se puede modificar la cuenta maestra del sistema'), { status: 403 });
  }

  // La cuenta de un Superadmin, y el rol de Superadmin, solo los toca un Superadmin. Se mira
  // el rol que tiene ahora (para no operar sobre ella) y el que se pide (para no ascender a
  // nadie, ni a uno mismo ni a un cómplice).
  if (actor) {
    if (!puedeGestionarCuentaDeRol(actor, (user as any).role?.name)) throw errorCuentaReservada();
    if (rest.role_id !== undefined && !esDueno(rest.role_id, user.role_id)) {
      const rolPedido = await RoleRepository.findById(rest.role_id);
      if (rolPedido && !puedeGestionarCuentaDeRol(actor, (rolPedido as any).name)) throw errorCuentaReservada();
    }
  }

  const esAdministrador = usuariosPolicies.puedeAdministrarUsuarios(actor?.role);
  const seEditaASiMismo = actor?.id != null && esDueno(id, actor.id);

  /**
   * Autoservicio: la ruta ya dejó pasar a quien no administra **solo** sobre su propia
   * cuenta, y aquí se limita lo que puede escribir. Sin esta lista, «Mi perfil» seguía
   * siendo el mismo endpoint con el que uno se ascendía a Superadmin, se quitaba la
   * caducidad o se pedía `reset_password` — solo que apuntando a su propio id.
   */
  if (actor && !esAdministrador) {
    if (!seEditaASiMismo) {
      throw Object.assign(new Error('No tienes permisos sobre esta cuenta'), { status: 403 });
    }
    const prohibidos = Object.keys(data).filter(
      (campo) => !CAMPOS_DE_AUTOSERVICIO.includes(campo as (typeof CAMPOS_DE_AUTOSERVICIO)[number])
    );
    if (prohibidos.length > 0) {
      throw Object.assign(
        new Error(`Solo puedes modificar ${CAMPOS_DE_AUTOSERVICIO.join(', ')} de tu propia cuenta`),
        { status: 403 }
      );
    }
  }

  /**
   * Nadie se cambia su propio rol ni su propio estado, tenga el rol que tenga.
   *
   * Un Administrador que puede editar cuentas puede editar la suya, y ahí la
   * comprobación de rol no dice nada: ya pasó. Esto es lo que impide que se ascienda
   * a Superadmin por la puerta de al lado, y de paso que alguien se desactive solo.
   */
  if (seEditaASiMismo) {
    if (rest.role_id && !esDueno(rest.role_id, user.role_id)) {
      throw Object.assign(new Error('No puedes cambiar tu propio rol'), { status: 403 });
    }
    if (rest.status && rest.status !== user.status) {
      throw Object.assign(new Error('No puedes cambiar el estado de tu propia cuenta'), { status: 403 });
    }
  }

  // Nadie deja el sistema sin ningún administrador activo, ni bajándole el rol ni
  // desactivándolo. Comparar solo contra "Superadmin" se quedaba corto: Administrador
  // también administra usuarios (`usuariosPolicies`), así que degradar al último
  // Administrador activo dejaba pasar exactamente el mismo problema por el otro rol.
  const cambiaRol = rest.role_id !== undefined && !esDueno(rest.role_id, user.role_id);
  const cambiaEstado = rest.status !== undefined && rest.status !== user.status;

  if (cambiaRol || cambiaEstado) {
    const rolActual = (user as any).role;
    const eraAdministradorActivo =
      user.status === 'active' && usuariosPolicies.puedeAdministrarUsuarios(rolActual?.name);

    if (eraAdministradorActivo) {
      const rolResultante = cambiaRol ? await RoleRepository.findById(rest.role_id) : rolActual;
      const estadoResultante = cambiaEstado ? rest.status : user.status;
      const seguiraAdministrando =
        estadoResultante === 'active' && usuariosPolicies.puedeAdministrarUsuarios(rolResultante?.name);

      if (!seguiraAdministrando && (await contarAdministradoresActivos(id)) < 1) {
        throw Object.assign(
          new Error('No se puede quitar al último administrador activo del sistema'),
          { status: 409 }
        );
      }
    }
  }

  const updateData: any = { ...rest };
  if (email) {
    // Restringir solo el alta dejaría la puerta abierta a cambiar el correo después
    // a uno de fuera del dominio, que es el mismo agujero por otra vía.
    const normalizedEmail = exigirEmailInstitucional(email);
    if (normalizedEmail === config.localAuth.email.toLowerCase()) {
      throw Object.assign(new Error('Este correo es reservado y está protegido por el sistema'), { status: 403 });
    }
    updateData.email = normalizedEmail;
  }
  // Este era el agujero grande de la consideración 1: por aquí un administrador
  // fijaba la contraseña de cualquiera y era el único de los cinco caminos que no
  // comprobaba absolutamente nada, ni siquiera la longitud.
  // Desde el 15-10-2026, además, sin repetir la actual ni la anterior; la que había pasa
  // a ser la anterior. `findById` no trae los hashes: se piden aparte, solo aquí.
  if (password) {
    const conHashes = await UserRepository.findByIdWithPassword(id);
    Object.assign(
      updateData,
      await nuevaPasswordSinRepetir(password, {
        actual: (conHashes as any)?.password_hash,
        anterior: (conHashes as any)?.previous_password_hash,
      }),
    );
  }

  // Quien llama con `must_change_password: false` (el cambio voluntario) acaba de
  // reemplazar la temporal: su vencimiento deja de tener sentido.
  if (updateData.must_change_password === false) updateData.temp_password_expires_at = null;

  if (reset_security_questions === true) {
    updateData.must_setup_security_questions = true;
    // Se borran, no solo se marca la bandera. Si se dejaran, las preguntas viejas
    // seguirían sirviendo para recuperar la cuenta hasta que el usuario eligiera
    // otras — y un administrador que restablece preguntas suele hacerlo justo porque
    // dejaron de ser de fiar. Sin preguntas, la recuperación queda cerrada hasta que
    // el usuario configure las nuevas en su siguiente ingreso, que es lo correcto.
    await SecurityQuestionRepository.deleteByUserId(id);
  }

  const targetExpiration = updateData.expiration_date !== undefined ? updateData.expiration_date : user.expiration_date;
  if (updateData.status === 'active' && targetExpiration && new Date(targetExpiration) < new Date()) {
    throw Object.assign(
      new Error('No se puede activar una cuenta con fecha de vencimiento expirada. Actualiza la fecha de vencimiento primero.'),
      { status: 400 }
    );
  }

  const isReactivation = updateData.status === 'active' && user.status === 'inactive';
  const shouldReset = reset_password || isReactivation;

  if (shouldReset) {
    const temporaryPassword = generarPasswordTemporal();
    updateData.password_hash = await bcrypt.hash(temporaryPassword, BCRYPT_ROUNDS);
    // La contraseña real que tenía pasa a ser la anterior: en el primer ingreso tras el
    // restablecimiento no podrá volver a ella (ni a la temporal).
    const conHashes = await UserRepository.findByIdWithPassword(id);
    updateData.previous_password_hash = (conHashes as any)?.password_hash ?? null;
    updateData.must_change_password = true;
    // Cada temporal nueva trae sus 72 horas, también al reactivar una cuenta.
    updateData.temp_password_expires_at = vencimientoDeTemporal();
    // Un restablecimiento tiene que devolver el acceso: si la cuenta venía
    // bloqueada por §3, dejarla bloqueada haría inútil la contraseña recién emitida.
    updateData.failed_login_attempts = 0;
    updateData.failed_security_attempts = 0;
    updateData.locked_until = null;

    await UserRepository.update(id, updateData);
    const refreshed = await UserRepository.findById(id);
    if (!refreshed) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
    const resultJson = (refreshed as any).toJSON ? (refreshed as any).toJSON() : { ...refreshed };
    resultJson.temporaryPassword = temporaryPassword;
    return resultJson;
  }

  await UserRepository.update(id, updateData);
  return UserRepository.findById(id);
};

/**
 * Actualiza una cuenta, de una en una con las demás altas, bajas y cambios de cuentas.
 *
 * La regla del último administrador («cuenta cuántos quedan y después cambia») solo es cierta si
 * nadie cambia otra cuenta entre las dos cosas: dos administradores que se inactivaban, degradaban
 * o eliminaban entre sí a la vez veían cada uno al otro como el que quedaba y dejaban el sistema
 * sin ninguno. Por eso las operaciones que pueden quitar un administrador entran de una en una.
 */
export const updateUser = (id: string, data: any, actor?: Actor) =>
  enSeccionCritica(CLAVE_DE_ADMINISTRACION, () => actualizarUsuario(id, data, actor)).catch(traducirCorreoRepetido);

/**
 * Elimina una cuenta, salvo la maestra, la propia o la del último administrador activo.
 * @throws {Error} 404 si no existe; 403 en los casos protegidos; 409 si es el último administrador o tiene contenido asociado.
 */
const eliminarUsuario = async (id: string, actor?: Actor) => {
  const user = await UserRepository.findById(id);
  if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });

  if (user.email === config.localAuth.email.toLowerCase()) {
    throw Object.assign(new Error('No se puede eliminar la cuenta maestra del sistema'), { status: 403 });
  }

  if (actor && !puedeGestionarCuentaDeRol(actor, (user as any).role?.name)) throw errorCuentaReservada();

  // Borrarse a uno mismo deja la sesión en curso sin sujeto y es indistinguible de un
  // clic equivocado. Para irse está la desactivación, que es reversible.
  if (actor?.id != null && esDueno(id, actor.id)) {
    throw Object.assign(new Error('No puedes eliminar tu propia cuenta'), { status: 403 });
  }

  const esAdministradorActivo =
    user.status === 'active' && usuariosPolicies.puedeAdministrarUsuarios((user as any).role?.name);
  if (esAdministradorActivo && (await contarAdministradoresActivos(id)) < 1) {
    throw Object.assign(
      new Error('No se puede eliminar al último administrador activo del sistema'),
      { status: 409 }
    );
  }

  try {
    await UserRepository.delete(id);
  } catch (err: any) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      throw Object.assign(new Error('No se puede eliminar el usuario porque tiene registros o contenido asociado en el sistema. Te recomendamos inactivarlo.'), { status: 409 });
    }
    throw err;
  }
  
  return { message: 'Usuario eliminado' };
};

/** Elimina una cuenta, de una en una con las demás operaciones que pueden quitar un administrador. */
export const deleteUser = (id: string, actor?: Actor) =>
  enSeccionCritica(CLAVE_DE_ADMINISTRACION, () => eliminarUsuario(id, actor));

/**
 * Inactiva las cuentas activas cuya fecha de caducidad ya pasó (el rol administrador queda exento).
 */
export const deactivateExpiredUsers = async () => {
  const users = await UserRepository.findAll() as any[];
  const now = new Date();

  const expiredActiveUsers = users.filter(
    (u) => u.status === 'active' && u.expiration_date && new Date(u.expiration_date) < now
  );

  let deactivated = 0;
  const exentosPorRolAdministrador: string[] = [];

  for (const user of expiredActiveUsers) {
    // El rol administrador queda fuera de la caducidad automática por completo: no es
    // "mientras quede otro activo" (esa regla es aparte, para las acciones manuales en
    // updateUser/deleteUser) — esta revisión no toca una cuenta administradora aunque
    // haya diez más. Es lo que pide la historia: acceso temporal para editores e
    // intranet, exceptuando al rol de administrador.
    if (usuariosPolicies.puedeAdministrarUsuarios(user.role?.name)) {
      exentosPorRolAdministrador.push(user.id);
      continue;
    }
    await UserRepository.update(user.id, { status: 'inactive' });
    // Mismo verbo y el mismo «Sistema» como actor que el login expirado
    // (`login.usecase.ts`): es la misma caducidad, solo que la descubre este barrido
    // en vez de un intento de entrar. Sin `ip`/`user-agent`: esto corre al listar la
    // pantalla de usuarios, no como respuesta a la petición de nadie en particular.
    await logAudit({
      entidadId: user.id,
      entidadTipo: 'usuario',
      accion: 'expirar',
      usuarioId: null,
      usuarioNombre: 'Sistema (fecha de caducidad cumplida)',
      camposModificados: [{ campo: 'status', antes: 'active', despues: 'inactive' }],
    });
    deactivated++;
  }

  return { deactivated, exentosPorRolAdministrador };
};

/** Cuentas activas que caducan dentro de `windowDays` días, con los días que les quedan. */
export const getExpirationAlerts = async (windowDays = 7) => {
  const users = await UserRepository.findAll();
  const now = new Date();
  const todayUtcStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const msPerDay = 24 * 60 * 60 * 1000;

  const alerts = (users as any[])
    .filter((user) => user.status === 'active' && user.expiration_date)
    .map((user) => {
      const expirationDate = new Date(user.expiration_date);
      const expirationUtcStart = Date.UTC(
        expirationDate.getUTCFullYear(),
        expirationDate.getUTCMonth(),
        expirationDate.getUTCDate()
      );
      const daysLeft = Math.floor((expirationUtcStart - todayUtcStart) / msPerDay) + 1;
      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        expiration: `${expirationDate.getUTCFullYear()}-${String(expirationDate.getUTCMonth() + 1).padStart(2, '0')}-${String(expirationDate.getUTCDate()).padStart(2, '0')}`,
        daysLeft,
      };
    })
    .filter((item) => item.daysLeft >= 1 && item.daysLeft <= windowDays)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return { alerts, count: alerts.length };
};

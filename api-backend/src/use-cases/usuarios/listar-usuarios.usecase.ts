import bcrypt from 'bcryptjs';
import { UserRepository } from '../../repositories/usuarios.repository';
import { RoleRepository } from '../../repositories/roles.repository';
import { config } from '../../config';
import {
  generarPasswordTemporal,
  hashearPassword,
  BCRYPT_ROUNDS,
} from '../../shared/password-policy';
import { exigirEmailInstitucional } from '../../shared/email-policy';
import { SecurityQuestionRepository } from '../../repositories/security-questions.repository';
import { usuariosPolicies } from '../../policies/usuarios.policies';
import { esDueno } from '../../shared/autorizacion';

export const getAllUsers = () => UserRepository.findAll();

export const getUserById = async (id: string) => {
  const user = await UserRepository.findById(id);
  if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
  return user;
};

export const createUser = async (data: any) => {
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
  });

  const userJson = user.toJSON ? user.toJSON() : { ...user };
  userJson.temporaryPassword = temporaryPassword;
  return userJson;
};

/**
 * Quién pide el cambio. Se pasa desde el controlador; los llamadores internos que ya
 * demostraron la identidad por otra vía (el cambio de contraseña voluntario, que
 * verifica la contraseña actual) lo omiten.
 */
type Actor = { id?: string; role?: string | null };

/** Lo único que alguien puede cambiarse a sí mismo sin ser administrador. */
const CAMPOS_DE_AUTOSERVICIO = ['name', 'apellidos', 'email'] as const;

export const updateUser = async (id: string, data: any, actor?: Actor) => {
  const { password, email, reset_password, reset_security_questions, ...rest } = data;

  const user = await UserRepository.findById(id);
  if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });

  if (user.email === config.localAuth.email.toLowerCase()) {
    throw Object.assign(new Error('No se puede modificar la cuenta maestra del sistema'), { status: 403 });
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

  // Degradar al último Superadmin activo deja el sistema sin nadie que pueda volver a
  // nombrar uno: la cuenta maestra de `.env` es un rescate, no una silla ocupada.
  if (rest.role_id && !esDueno(rest.role_id, user.role_id)) {
    const rolActual = await RoleRepository.findById(user.role_id);
    if ((rolActual?.name ?? '').trim().toLowerCase() === 'superadmin') {
      const restantes = await UserRepository.contarActivosPorRol(user.role_id);
      if (restantes <= 1) {
        throw Object.assign(
          new Error('No se puede degradar al único Superadmin activo del sistema'),
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
  if (password) updateData.password_hash = await hashearPassword(password);

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
    updateData.must_change_password = true;
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

export const deleteUser = async (id: string, actor?: Actor) => {
  const user = await UserRepository.findById(id);
  if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });

  if (user.email === config.localAuth.email.toLowerCase()) {
    throw Object.assign(new Error('No se puede eliminar la cuenta maestra del sistema'), { status: 403 });
  }

  // Borrarse a uno mismo deja la sesión en curso sin sujeto y es indistinguible de un
  // clic equivocado. Para irse está la desactivación, que es reversible.
  if (actor?.id != null && esDueno(id, actor.id)) {
    throw Object.assign(new Error('No puedes eliminar tu propia cuenta'), { status: 403 });
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

export const deactivateExpiredUsers = async () => {
  const users = await UserRepository.findAll();
  const now = new Date();
  const expiredActiveUsers = users.filter(
    (u: any) => u.status === 'active' && u.expiration_date && new Date(u.expiration_date) < now
  );
  for (const user of expiredActiveUsers) {
    await UserRepository.update(user.id, { status: 'inactive' });
  }
  return { deactivated: expiredActiveUsers.length };
};

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

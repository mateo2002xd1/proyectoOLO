import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { UserRepository } from '../../repositories/usuarios.repository';

export const loginUseCase = async (email: string, password: string) => {
  const normalizedEmail = email.trim().toLowerCase();

  if (
    config.localAuth.email === normalizedEmail &&
    config.localAuth.password === password
  ) {
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

  if (user.expiration_date && new Date(user.expiration_date) < new Date())
    throw Object.assign(new Error('Cuenta expirada'), { status: 403 });

  const valid = await bcrypt.compare(password, user.password_hash || '');
  if (!valid) throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });

  await UserRepository.updateLastAccess(user.id);

  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
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

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { SitioUserRepository } from '../../repositories/sitio-users.repository';

export const getAllSitioUsers = () => SitioUserRepository.findAll();

export const getSitioUserById = async (id: string) => {
  const user = await SitioUserRepository.findById(id);
  if (!user) throw Object.assign(new Error('Usuario de sitio no encontrado'), { status: 404 });
  return user;
};

export const createSitioUser = async (data: any, createdBy?: string) => {
  const { email, password, ...rest } = data;
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await SitioUserRepository.findByEmail(normalizedEmail);
  if (existing) throw Object.assign(new Error('El correo ya está registrado en sitio'), { status: 409 });

  const password_hash = password ? await bcrypt.hash(password, 12) : null;
  const user = await SitioUserRepository.create({
    ...rest,
    email: normalizedEmail,
    password_hash,
    created_by: createdBy || null,
  });

  const result = user.toJSON ? user.toJSON() : { ...user };
  delete result.password_hash;
  return result;
};

export const updateSitioUser = async (id: string, data: any) => {
  const { password, email, ...rest } = data;

  const user = await SitioUserRepository.findById(id);
  if (!user) throw Object.assign(new Error('Usuario de sitio no encontrado'), { status: 404 });

  const updateData: any = { ...rest };
  if (email) updateData.email = email.trim().toLowerCase();
  if (password) updateData.password_hash = await bcrypt.hash(password, 12);

  await SitioUserRepository.update(id, updateData);
  return SitioUserRepository.findById(id);
};

export const deleteSitioUser = async (id: string) => {
  const user = await SitioUserRepository.findById(id);
  if (!user) throw Object.assign(new Error('Usuario de sitio no encontrado'), { status: 404 });
  await SitioUserRepository.delete(id);
  return { message: 'Usuario de sitio eliminado' };
};

export const loginSitioUser = async (email: string, password: string) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await SitioUserRepository.findByEmail(normalizedEmail);
  if (!user) throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });

  if (user.status !== 'active')
    throw Object.assign(new Error('Cuenta inactiva o suspendida'), { status: 403 });

  const valid = await bcrypt.compare(password, user.password_hash || '');
  if (!valid) throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });

  await SitioUserRepository.updateLastLogin(user.id);

  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    type: 'sitio',
  };

  const token = jwt.sign(payload as any, config.jwtSiteSecret, { expiresIn: config.jwtExpiresIn as any });
  return { token, user: payload };
};
